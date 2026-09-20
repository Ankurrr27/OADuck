# OADuck + self-hosted Judge0

OADuck sends C++ submissions to Judge0 from the Next.js backend. The browser never contacts Judge0 directly and never receives hidden test input or expected output.

```text
Monaco editor
    -> POST /api/run or POST /api/submit
    -> OADuck server (auth, validation, test selection)
    -> Judge0 CE /submissions
    -> OADuck verdict
    -> result panel
```

## 1. Run Judge0 locally

Judge0 is a Linux/Docker service. For local Windows development, run it through Docker Desktop with the WSL2 backend, or use an Ubuntu VPS for production.

Use the official Judge0 CE release rather than copying a partial compose file. The release contains the API, worker, PostgreSQL, Redis, sandbox, and version-matched configuration:

From the OADuck root, the setup script can download the release, generate local service passwords, and start Docker:

```powershell
.\scripts\setup-judge0.ps1
```

The script stores Judge0 under the ignored `judge0/` directory. It does not add Judge0 binaries, database data, or generated passwords to Git.

```bash
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip
cd judge0-v1.13.1
```

Set strong random values for `REDIS_PASSWORD` and `POSTGRES_PASSWORD` in `judge0.conf`. Then start the dependencies and workers:

```bash
docker compose up -d db redis
docker compose up -d
```

Wait until the API is ready, then open `http://localhost:2358/docs` or check the language catalog with:

```bash
curl http://localhost:2358/languages
```

Some Judge0 1.13.1 images can return an encoding error from `/about` on Docker Desktop. That endpoint is not required for code execution; `/languages` and a real submission are the useful health checks.

Do not expose port 2358 publicly without TLS and network access controls. In production, put Judge0 behind a private network or reverse proxy and allow requests only from the OADuck server.

## 2. Configure OADuck

Copy `.env.example` to `.env.local` and set:

```env
JUDGE0_API_URL=http://localhost:2358
JUDGE0_AUTH_TOKEN=
```

If Judge0 is on another machine, use its private address, for example:

```env
JUDGE0_API_URL=http://10.0.0.20:2358
```

`JUDGE0_AUTH_TOKEN` is optional and is sent as `X-Auth-Token` when configured. Never put either value in browser code or expose them through `NEXT_PUBLIC_*` variables.

Restart the Next.js server after changing environment variables:

```bash
npm run dev
```

## 3. Database setup

Apply the OADuck execution migration:

```bash
npx prisma migrate deploy
npx prisma generate
```

The migration adds test-case input/output and submission execution fields. A test case is public when `is_sample = true`; all other test cases are hidden.

## 4. Add test cases

Question create/update APIs accept a `testCases` array:

```json
[
  { "input": "2 3\n", "expectedOutput": "5\n", "isSample": true },
  { "input": "10 20\n", "expectedOutput": "30\n", "isSample": false }
]
```

Run executes only sample cases. Submit executes only hidden cases. Hidden values are never included in API responses.

## 5. Test the integration

Use a signed-in OADuck user and open a question with at least one sample and one hidden test case. A basic C++ submission can be:

```cpp
#include <iostream>
int main() {
  long long a, b;
  std::cin >> a >> b;
  std::cout << a + b << "\n";
}
```

Click **Run** to see each sample result. Click **Submit** to receive the verdict and `Passed: X / Y`. The backend stores the submission in PostgreSQL.

## 6. Safety and limits

- C++ is currently the only enabled language (`Judge0 language id 54`).
- OADuck limits source code to 50,000 characters and runs at most 20 samples or 100 hidden tests per request.
- Each test has a two-second CPU limit and is executed server-side by Judge0's sandbox.
- Submissions are currently sequential; a queue/worker can replace route execution later.
- Memory values depend on the Judge0 response and may be unavailable.
- Do not replace Judge0 with `child_process` on the Next.js server. That would allow submitted code to attack the application host.
- Judge0 itself should be patched and monitored like any production service; protect PostgreSQL, Redis, and the Judge0 API from the public internet.

## Files involved

- `src/lib/judge0.js` — Judge0 HTTP client and status normalization.
- `src/app/api/run/route.js` — public/sample execution endpoint.
- `src/app/api/submit/route.js` — hidden execution, comparison, and persistence endpoint.
- `src/app/questions/[id]/page.jsx` — Monaco Run/Submit UI.
- `prisma/schema.prisma` — test case and submission fields.
- `prisma/migrations/20260920120000_add_judge0_execution/migration.sql` — database migration.
- `prisma/migrations/20260920130000_add_sample_flag_compatibility/migration.sql` — compatibility migration for the existing `is_hidden` test-case schema.
