param(
  [string]$Version = "1.13.1",
  [string]$InstallDirectory = "judge0"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is required. Install Docker Desktop with the WSL2 backend first."
}

$dockerErrorMode = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
  docker info --format '{{.ServerVersion}}' 2>&1 | Out-Null
  $dockerExitCode = $LASTEXITCODE
} finally {
  $ErrorActionPreference = $dockerErrorMode
}
if ($dockerExitCode -ne 0) {
  throw "Docker Desktop is installed but its Linux engine is not running. Start Docker Desktop, then run this script again."
}

$root = (Get-Location).Path
$target = Join-Path $root $InstallDirectory
$zip = Join-Path $root ("judge0-v{0}.zip" -f $Version)
$url = "https://github.com/judge0/judge0/releases/download/v$Version/judge0-v$Version.zip"

if (-not (Test-Path $target)) {
  New-Item -ItemType Directory -Path $target | Out-Null
}

if (-not (Test-Path (Join-Path $target "docker-compose.yml"))) {
  if (-not (Test-Path $zip)) {
    Write-Host "Downloading Judge0 v$Version..."
    Invoke-WebRequest -Uri $url -OutFile $zip
  }
  Expand-Archive -Path $zip -DestinationPath $target -Force
  $nested = Join-Path $target ("judge0-v{0}" -f $Version)
  if (Test-Path $nested) {
    Get-ChildItem -Force $nested | Move-Item -Destination $target -Force
    Remove-Item -LiteralPath $nested -Recurse -Force
  }
}

$config = Join-Path $target "judge0.conf"
if (-not (Test-Path $config)) {
  throw "Judge0 archive did not contain judge0.conf. Check the downloaded release."
}

function Set-ConfigValue([string]$Name, [string]$Value) {
  $content = Get-Content -LiteralPath $config -Raw
  $pattern = "(?m)^#?\s*$Name=.*$"
  if ($content -match $pattern) {
    $content = [regex]::Replace($content, $pattern, "$Name=$Value")
  } else {
    $content += "`n$Name=$Value`n"
  }
  Set-Content -LiteralPath $config -Value $content -NoNewline
}

if ((Get-Content -LiteralPath $config -Raw) -match "(?m)^REDIS_PASSWORD=\s*$") {
  Set-ConfigValue "REDIS_PASSWORD" ([guid]::NewGuid().ToString("N"))
}
if ((Get-Content -LiteralPath $config -Raw) -match "(?m)^POSTGRES_PASSWORD=\s*$") {
  Set-ConfigValue "POSTGRES_PASSWORD" ([guid]::NewGuid().ToString("N"))
}

Push-Location $target
try {
  docker compose up -d db redis
  if ($LASTEXITCODE -ne 0) { throw "Judge0 database services failed to start." }
  docker compose up -d
  if ($LASTEXITCODE -ne 0) { throw "Judge0 services failed to start." }
} finally {
  Pop-Location
}

Write-Host "Judge0 is starting at http://localhost:2358"
Write-Host "Set JUDGE0_API_URL=http://localhost:2358 in OADuck .env.local and restart Next.js."
