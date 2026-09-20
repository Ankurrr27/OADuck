const LANGUAGE_IDS = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
};

const DEFAULT_ENDPOINT = "https://ce.judge0.com";

function endpoint() {
  return (process.env.JUDGE0_API_URL || DEFAULT_ENDPOINT).replace(/\/$/, "");
}

function headers() {
  const token = process.env.JUDGE0_AUTH_TOKEN;
  return {
    "Content-Type": "application/json",
    ...(token ? { "X-Auth-Token": token } : {}),
  };
}

export function getLanguageId(language) {
  return LANGUAGE_IDS[language];
}

export function prepareSource(language, source) {
  if (language === "javascript") {
    return `${source}\n\nconst __input = require("fs").readFileSync(0, "utf8");\nif (typeof solve === "function") { Promise.resolve(solve(__input)).then((value) => { if (value !== undefined) process.stdout.write(typeof value === "string" ? value : JSON.stringify(value)); }).catch((error) => { throw error; }); }`;
  }

  if (language === "typescript") {
    return source;
  }

  return source;
}

// LeetCode examples often store string inputs as `"abc"`, while stdin-based
// solutions expect the raw value (`abc`). Keep the displayed testcase intact,
// but remove one matching pair of wrapping quotes before execution.
export function normalizeStdin(value) {
  const input = String(value ?? "");
  const trimmed = input.trim();
  if (trimmed.length >= 2 && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
    return trimmed.slice(1, -1);
  }
  return input;
}

export async function executeCode({ language, sourceCode, stdin = "", timeoutSeconds = 5 }) {
  const languageId = getLanguageId(language);
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const createResponse = await fetch(`${endpoint()}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      language_id: languageId,
      source_code: prepareSource(language, sourceCode),
      stdin,
      cpu_time_limit: timeoutSeconds,
      wall_time_limit: Math.max(timeoutSeconds + 2, 8),
    }),
  });

  if (!createResponse.ok) {
    const message = await createResponse.text();
    throw new Error(`Judge service rejected the request (${createResponse.status}): ${message.slice(0, 240)}`);
  }

  const { token } = await createResponse.json();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultResponse = await fetch(`${endpoint()}/submissions/${token}?base64_encoded=false`, { headers: headers(), cache: "no-store" });
    if (!resultResponse.ok) throw new Error(`Judge service polling failed (${resultResponse.status}).`);
    const result = await resultResponse.json();
    if (result.status?.id > 2) return result;
  }

  return { status: { id: 13, description: "Timed out" }, stderr: "The code runner took too long to respond." };
}

export function normalizeResult(result) {
  const statusId = result.status?.id || 0;
  return {
    status: result.status?.description || "Unknown",
    statusId,
    verdict: statusId === 3 ? "Accepted" : statusId === 4 ? "Wrong Answer" : statusId === 5 ? "Time Limit Exceeded" : statusId === 6 ? "Compilation Error" : statusId >= 7 && statusId <= 12 ? "Runtime Error" : statusId === 13 ? "Internal Error" : "Processing",
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    compileOutput: result.compile_output || "",
    message: result.message || "",
    time: result.time || null,
    memory: result.memory || null,
    exitCode: result.exit_code ?? null,
  };
}
