# NeuroForge AI

NeuroForge is a React + TypeScript frontend, FastAPI API, and PostgreSQL-backed research workflow. Stage 6 retrieves source results from Tavily Search and saves a source-grounded Research Agent answer. Stages 7–9 add explicitly triggered Analysis, Evaluation, and Decision Support agents that consume saved upstream outputs and evidence. Stage 10 hardens retries, saved-output handling, configuration, CORS, and verification without adding an agent or changing the migration chain. None of the agents independently verifies sources or replaces expert review.

## Stage 6: Research workflow

When a new brief is submitted, the backend saves the research request before external calls, performs one Tavily basic-depth search (up to five results), saves the returned source metadata, and asks the existing OpenAI model for a structured source-grounded answer. The model can assign citations only from retrieved source numbers; the backend validates those references and displays provider-returned links separately. If search is missing, times out, fails, or returns no usable sources, the request is saved as failed and no sources or answer are fabricated. If answer generation fails after search, retrieved sources remain saved.

Tavily content is treated as untrusted data. Prompts instruct the model not to follow embedded instructions, use outside knowledge as evidence, or invent citations, titles, dates, URLs, or unsupported claims. Provider-estimated publication dates are labeled as estimates in the UI.

## Stage 7: Analysis Agent

On a saved completed research record, use **Run Analysis Agent** to explicitly start analysis. It reads only the saved Research Agent answer and stored source snippets; it does not make another web search. Its one-per-record result is saved with `processing`, `completed`, or `failed` status. The saved-record page reads the status through GET; opening or refreshing the page does not trigger another search or model call. A failed analysis can be retried only through its explicit button. The output separates findings, patterns/comparisons, implications, conflicts, and evidence gaps; interpretations are labeled.

## Stage 8: Evaluation Agent

After a completed Research Agent answer and completed saved Analysis Agent result exist, use **Run Evaluation Agent** on the saved research detail page. The Evaluation Agent uses only the original question, saved Research Agent answer, saved source records/snippets, and saved Analysis Agent output. It does not perform a new search and does not treat either earlier agent's output as proof.

The saved evaluation reports an overall assessment, evidence-support category (`supported`, `partially_supported`, `unsupported`, or `insufficient_evidence`), consistency findings, unsupported claims, evidence gaps, limitations, and suggested improvements. It does not produce accuracy scores or confidence percentages, invent citations or source details, or claim independent source verification. Its assessment is a judgment about the saved material, not an independently verified fact. If there are no readable saved snippets, the application records an insufficient-evidence evaluation without making an LLM call.

Each research record can have one saved evaluation. GET is read-only. Repeating POST after completion returns the saved evaluation without another model call; failed evaluations can be retried only by an explicit POST/button action. Evaluation failures do not delete or change research, sources, or analysis.

### Stage 8 API

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/research/{research_id}/evaluation` | Explicitly evaluate and save a completed research answer plus completed saved analysis; returns existing completed/processing status rather than duplicating calls |
| GET | `/api/research/{research_id}/evaluation` | Read saved evaluation/status or `not_started`; never runs a model |

Invalid UUIDs return 400, unknown research records return 404, missing/incomplete Research or Analysis Agent results return 409, and storage unavailability returns 503. Provider/validation failures are saved with a safe error code and `failed` status. A failed run may be retried with the explicit POST. The additive migration creates `research_evaluations`, a one-to-one table with structured JSON output, status, safe error code, and timestamps.

## Stage 9: Decision Support Agent

After the Research, Analysis, and Evaluation results are completed and saved, use **Run Decision Support Agent** on the saved research detail page. It consumes only the original research question, saved research answer and sources, saved analysis, and saved evaluation. It does not call Tavily or perform another search. Earlier AI outputs are inputs to assess, not proof; saved source snippets are the only evidence. The agent does not claim independent source verification and never guarantees outcomes.

The structured result contains a decision question and summary, evidence condition, options (when the saved evidence supports comparison), potential benefits, risks/trade-offs, supporting evidence, assumptions/unknowns, option comparison, optional recommended next step, qualitative confidence with basis, limitations, and questions to resolve. Evidence references use saved source UUIDs, returned additively as `source_id` in each research-source API record; each reference also includes a verbatim excerpt checked against that source's saved snippet before persistence. The frontend resolves the validated IDs to saved source URLs and displays the excerpt. Unknown, snippet-less, or mismatched source references cause controlled validation failure. Weak, conflicting, or insufficient evidence cannot produce a recommendation; no readable snippets or an insufficient upstream result yield a saved abstention without an OpenAI call.

Each research record has one saved decision-support result. GET only reads status/result. A repeated POST returns an existing completed or recent processing result; a failed run can be retried only with an explicit POST/button action. Failures leave research, sources, analysis, and evaluation unchanged.

### Stage 9 API

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/research/{research_id}/decision-support` | Explicitly generate and save a decision aid; requires completed Research, Analysis, and Evaluation results |
| GET | `/api/research/{research_id}/decision-support` | Read the saved decision-support result/status or `not_started`; never runs a model |

Invalid UUIDs return 400, unknown research records return 404, unmet prerequisites return 409, and storage unavailability returns 503. Provider, source-reference, or structured-output failures are returned with safe `decision_support_*` codes and saved `failed` status. `0006_decision_support_agent` adds only the one-to-one `research_decision_support` JSON/status table after `0005_evaluation_agent`; previous migrations and records are unchanged.

## Stage 10: integration, reliability, and security

Stage 10 does not add an agent or migration. Analysis, Evaluation, and Decision Support run records are claimed with an atomic database update so concurrent retries of a failed run cannot launch two agents. Failed runs still require an explicit POST. A `processing` record remains untouched by every GET; only an explicit POST can reclaim it after five minutes without an update. This lease is longer than the configured 20-second Tavily and 30-second OpenAI request timeouts. Refreshing a page never starts or resumes work. Research creation remains a normal POST that creates a new record on each submission; do not repeat it unless a new provider-backed research request is intended.

Malformed saved Analysis, Evaluation, or Decision Support JSON now returns a generic 409 conflict on GET or repeated POST instead of a validation traceback/500. SQLite API tests enable foreign keys and exercise orphan rejection and cascade deletion. The linear migration history remains unchanged through `0006_decision_support_agent`.

The API validates `DATABASE_URL` before handling database-backed requests. Supported runtime URLs are PostgreSQL using `postgresql+psycopg://.../<database>` and SQLite for tests; invalid or missing database configuration returns a safe 503. Provider keys are checked when their operation is requested. The examples contain only placeholders; active variables are `DATABASE_URL`, `CORS_ORIGINS`, `LLM_API_KEY`, and `TAVILY_API_KEY`. `APP_ENV` is not used by this codebase and has been removed from the examples. Optional `VITE_API_BASE_URL` changes the browser-visible API base and must never contain secrets.

CORS defaults to the four explicit local development origins and allows GET/POST/OPTIONS plus JSON `Content-Type` and the standard browser CORS-safelisted headers; credentialed cross-origin requests are disabled. Vite dev/preview and the documented Uvicorn command bind to loopback by default. The application itself still has no user authentication, authorization, or rate limiting. The optional Compose stack described below adds an Nginx Basic Auth gate and IP-based API rate/concurrency limits for a small private staging cohort; it does not add per-user data ownership. Keep it private and do not use it for sensitive or general public multi-user records without a separate application security design. Server logs record operation context and, for unhandled errors, the exception class—not tracebacks or SQL parameter values. Model/source text is rendered as escaped React text; provider source links are opened with `noopener`/`noreferrer`.

## Private staging deployment preparation

`compose.deploy.yml` prepares a single-host Docker Compose stack: Nginx serves the built frontend over TLS, prompts for Basic Auth on the app and API, and rate-limits API requests; FastAPI is private to the Docker network; PostgreSQL is not host-published and persists in a named volume. The default gateway bind is loopback (`127.0.0.1:8443`). Existing Alembic migrations run before Uvicorn starts, and health checks gate service startup. The backend and frontend Dockerfiles, secret placeholders, Nginx configuration, host setup, backup notes, and verification commands are documented in [`DEPLOYMENT.md`](DEPLOYMENT.md).

This is deployment preparation, not a live deployment: no hosting account, domain/certificate, Docker runtime, or provider keys were available for this task. No public URL is provided. The optional shared-password staging gate does not make the app multi-tenant or safe for an open public audience; use a private trusted cohort and complete the remaining security/host steps in `DEPLOYMENT.md`.

See [`STAGE12_VALIDATION.md`](STAGE12_VALIDATION.md) for exact test results, mock/demo disclosures, deployment status, and remaining manual steps.

## Required accounts and credentials

The project uses one retrieval provider and one LLM provider:

- **Retrieval:** Tavily Search API, using a basic search with up to five results per request. Check current Tavily plan limits and pricing.
- **LLM:** OpenAI `gpt-4.1-mini` via the official Python SDK and Responses API. Model usage may incur charges. Research, analysis, evaluation, and decision support all reuse `LLM_API_KEY`.

Create provider keys through their official accounts. Keys are server-side only: never put them in frontend files, source code, or a committed `.env` file. The `.env.example` files contain placeholders, not working credentials.

## Windows setup and launch

Prerequisites: Windows PowerShell; Python 3.10+ (3.12 is used in this guide); PostgreSQL 14+ server and client tools; Node.js 20.19+ or 22.12+; and pnpm 10.15.0. The Python packages are pinned in `backend/requirements.txt`; the frontend uses `pnpm-lock.yaml` and the Node floor matches locked Vite 8.3.6. The API uses the synchronous `psycopg` v3 driver.

### 1. Extract the project and create PostgreSQL database

From PowerShell, extract the ZIP into a new, empty folder. Change `$archive` if you saved the ZIP somewhere other than Downloads; the destination check prevents accidentally overlaying an earlier project copy.

```powershell
$archive = Join-Path $HOME 'Downloads\NeuroForgeAI-Stage12.zip'
$destination = Join-Path $HOME 'neuroforge-stage12-clean'
if (Test-Path $destination) { throw "Choose a new empty destination folder: $destination" }
New-Item -ItemType Directory -Path $destination | Out-Null
Expand-Archive -LiteralPath $archive -DestinationPath $destination
$projectRoot = Join-Path $destination 'neuroforge-ai-stage12'
Set-Location $projectRoot
```

This step requires your own PostgreSQL 14+ server, a local PostgreSQL administrator account, and the PostgreSQL Command Line Tools; none are bundled with this ZIP. Install PostgreSQL if needed, start its service, and use the password/account configured for your local installation.

```powershell
Set-Location $projectRoot
py -0p
node --version
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm --version
psql --version
pg_isready -h localhost -p 5432
createdb -U postgres neuroforge_db
```

Expect Python 3.12 to appear in `py -0p`, Node to be 20.19+ or 22.12+, `pnpm --version` to print `10.15.0`, and `pg_isready` to report that the server accepts connections. If Corepack is unavailable, install the pinned pnpm with `npm install --global pnpm@10.15.0`. Replace the path, PostgreSQL administrator name, and any example version below with values for your own installation. Create the database only once; `createdb` may prompt for the local PostgreSQL password. If `createdb` is unavailable but `psql` is present, open `psql -U postgres`, run `CREATE DATABASE neuroforge_db;`, then `\q`.

If PowerShell reports that `psql`, `pg_isready`, or `createdb` is not recognized, install PostgreSQL Command Line Tools or add the installed PostgreSQL `bin` directory to this PowerShell session's `PATH`. For example, discover the installed version, replace `16` with that version (and adjust the directory if PostgreSQL was installed elsewhere), then verify the commands:

```powershell
Get-ChildItem "$env:ProgramFiles\PostgreSQL" -Directory
$pgBin = Join-Path $env:ProgramFiles 'PostgreSQL\16\bin'
$env:Path = "$pgBin;$env:Path"
Get-Command psql, pg_isready, createdb
Get-Service *postgres* | Select-Object Name, Status
```

If the service is stopped, start the matching service name shown above from an elevated PowerShell session, then rerun `pg_isready`.

### 2. Configure the backend

From the project root:

```powershell
Set-Location .\backend
Copy-Item .env.example .env
notepad .env
```

Set your local database password and real server-side provider keys in `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/neuroforge_db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
LLM_API_KEY=your_real_openai_key
TAVILY_API_KEY=your_real_tavily_key
```

If the PostgreSQL password contains URL-reserved characters such as `@`, `/`, or `:`, URL-encode them. Keep keys in `backend/.env`; `.gitignore` excludes it. `APP_ENV` is intentionally omitted because this codebase does not read it. Restart FastAPI after changing a key. `VITE_API_BASE_URL` is optional browser-visible frontend configuration (defaults to `/api`) and must never contain a secret.

### 3. Install backend dependencies and apply migrations

Remain in the `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
alembic current
```

The latest migration is `0006_decision_support_agent` (after `0005_evaluation_agent`). It adds only the `research_decision_support` table; it does not rewrite prior migrations or remove existing records. If PowerShell blocks virtual-environment activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal and activate again.

### 4. Start FastAPI

Keep the `backend` folder as the working directory and `.venv` activated:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In another PowerShell window, check the API and database:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Expect `status: ok` and `database: ok`.

### 5. Start the frontend

In a separate PowerShell window, re-create the project-root variable (use the same destination you chose during extraction) and change to the project root:

```powershell
$projectRoot = Join-Path $HOME 'neuroforge-stage12-clean\neuroforge-ai-stage12'
Set-Location $projectRoot
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. Submit a research question, open its saved detail page, and click **Run Analysis Agent**. Once analysis is completed, click **Run Evaluation Agent**; once evaluation is completed, click **Run Decision Support Agent**. Refresh the page to confirm it reads the saved results without starting another model call. The Stage 9 action requires completed saved Research, Analysis, and Evaluation outputs.

### 6. Optional live API check

After the API is running, this creates a live research record (one Tavily request and one OpenAI research call may incur usage):

```powershell
$body = @{ question = 'How can cities improve access to public transit?'; research_type = 'Policy question'; description = 'Focus on urban commuters.' } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/research -ContentType 'application/json' -Body $body
$result | Select-Object research_id, status, evidence_status, ai_response
```

Then explicitly run analysis, evaluation, and decision support (each may make an OpenAI call and incur usage; insufficient or explicitly conflicting saved evidence may cause decision support to abstain without a call):

```powershell
$analysis = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/research/$($result.research_id)/analysis"
$analysis | Select-Object research_id, status, analysis
$evaluation = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/research/$($result.research_id)/evaluation"
$evaluation | Select-Object research_id, status, evaluation
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/research/$($result.research_id)/evaluation"
$decision = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/research/$($result.research_id)/decision-support"
$decision | Select-Object research_id, status, decision_support
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/research/$($result.research_id)/decision-support"
```

The final command only reads the saved decision-support result. Verify that evidence references displayed in the detail page resolve to source URLs returned in the saved research record.

## Manual Windows end-to-end verification

Run the automated checks before spending provider credits: from `backend` with the virtual environment active, run `pytest -q`; from the project root, run `pnpm install --frozen-lockfile` and `pnpm build`; from `backend`, run `alembic current` and confirm `0006_decision_support_agent`. Start FastAPI and confirm `/api/health` returns `status: ok` and `database: ok`. These checks confirm local code/build/configuration, not live provider correctness.

For one live browser pass, provider keys are required and Tavily/OpenAI usage may be billed. Submit one research question in the UI and note its Research ID. Confirm Research has a saved answer and source list. Before running downstream stages, replace `<research-id>` below with that ID and verify the prerequisites are enforced:

```powershell
$researchId = '<research-id>'
(Invoke-RestMethod "http://127.0.0.1:8000/api/research/$researchId/decision-support").status
curl.exe -s -o NUL -w "%{http_code}`n" -X POST "http://127.0.0.1:8000/api/research/$researchId/decision-support"
```

Expect `not_started` and HTTP `409`, respectively; the rejected POST must not call the Decision Support model. Then, on that same saved detail page, click **Run Analysis Agent**, wait for `completed`, click **Run Evaluation Agent**, wait for `completed`, and click **Run Decision Support Agent**. Confirm each structured result is displayed, source excerpts match saved snippets, and decision-support links resolve to the stored source URLs. If any upstream record is failed or processing, resolve/wait for it before proceeding; a failed Research Agent request requires a new research submission.

At each completed stage, refresh the detail page. In browser Developer Tools → Network, confirm refresh performs GET requests for saved research/analysis/evaluation/decision-support and sends no agent POST. The page does not automatically poll or rerun work. A repeated GET is read-only; a repeat POST after completion returns the saved result. Do not repeatedly click while a run is processing. Only an explicit POST can recover a processing row older than five minutes.

## Tests

From `backend` with the virtual environment activated, run:

```powershell
pytest -q
```

Tests use isolated in-memory/file SQLite and mocked retrieval/model responses. They need no API keys and make no paid Tavily/OpenAI calls. They cover the complete Research → Analysis → Evaluation → Decision Support API path, saved GET/read-only behavior, prerequisites, evidence/source validation, safe provider failures, explicit retries, atomic concurrent retry claims, stale-processing recovery, malformed saved output, foreign-key rejection/cascade, invalid DB settings, and log/CORS safety. The suite does not apply migrations against live PostgreSQL, call live providers, or exercise a real browser; those remain manual checks. The frontend has no separate automated test script; `pnpm build` checks TypeScript and creates the production bundle.

## Common errors

- **`retrieval_not_configured`:** Set `TAVILY_API_KEY` in `backend/.env` and restart the backend.
- **Search authentication/rate-limit/timeout errors:** Check the Tavily key, account limits, internet access, or provider status. Search is not automatically retried.
- **`retrieval_no_results`:** Try a more specific question. No synthetic source is created.
- **`DATABASE_URL is invalid` or health reports `database: unavailable`:** Use a valid `postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE` URL, confirm PostgreSQL is running, and URL-encode reserved password characters. If health is `ok` but the database is unavailable, check migrations and server connectivity.
- **`llm_not_configured`, `analysis_llm_not_configured`, `evaluation_llm_not_configured`, or `decision_support_llm_not_configured`:** Set or correct `LLM_API_KEY` in `backend/.env` and restart FastAPI.
- **Research, analysis, evaluation, or decision-support timeout/provider errors:** Check the OpenAI key, account usage/billing limits, connectivity, and provider status; then use a new research submission or the relevant explicit retry action. Existing failed research records are not silently reprocessed.
- **Evaluation returns 409:** Ensure the Research Agent answer and saved Analysis Agent output both have `completed` status before starting evaluation.
- **Evaluation fails structured validation:** The invalid result is not presented as successful. Retry explicitly; the saved research, sources, and analysis remain available.
- **Decision support returns 409:** Ensure the Research Agent answer, saved Analysis Agent output, and saved Evaluation Agent output are all completed before starting it.
- **Decision support abstains:** Weak, conflicting, unsupported, or insufficient evidence may intentionally yield no recommendation. Resolve the listed evidence gaps instead of treating the abstention as a system error.
- **Decision-support source reference error:** Only saved source UUIDs with readable snippets are accepted. Invalid model references fail safely rather than linking to invented sources.
- **An agent remains `processing`:** GET and refresh are intentionally read-only. Wait through the five-minute lease; then use that agent's explicit POST/retry button once. The service atomically gives only one request the retry claim.
- **The page loads but API calls fail from another origin:** Check that the browser origin is in `CORS_ORIGINS`. CORS only controls browser access and does not authenticate the API.
- **PostgreSQL/storage error:** Confirm PostgreSQL is running, `DATABASE_URL` is correct, and `alembic current` reports `0006_decision_support_agent`.

## Existing sample content

Sample projects, reports, and workspace example cards remain clearly labeled as sample/demo content. They are not generated by any of the agents and have no claimed real sources.

## Stage 11 release-readiness verification

Stage 11 is a release-copy and validation pass; it adds no agent, API behavior, or migration. The Stage 2 checklist in `TODO.md` is now explicitly marked as historical so its old frontend-only statements are not mistaken for current status.

Checks run in the Manus sandbox on November 5, 2026:

- Backend: `pytest -q` — **64 passed**; one upstream AnyIO deprecation warning.
- Frontend: `pnpm install --frozen-lockfile` and `pnpm build` — passed with pnpm 10.15.0 and Vite 8.3.6.
- Migrations: Alembic history and PostgreSQL offline SQL generation completed through `0006_decision_support_agent`. This generated SQL only; no live database was upgraded.
- Browser: the actual Vite frontend and FastAPI routes were exercised with the existing test stubs and a disposable SQLite database, without provider credentials. The pass covered the saved research-to-decision-support flow, GET-only refresh/persistence, the missing-prerequisite 409 API response, a controlled downstream failure followed by explicit retry (including a disabled duplicate-click check), and the no-readable-snippet insufficient-evidence UI. The revised landing, dashboard, Agents, and Reports pages were also reviewed; no browser console errors were observed. No paid Tavily or OpenAI calls were made. The temporary harness, database, and Vite tunnel-host exception are not included in the release archive.

This does **not** verify a clean migration against a running PostgreSQL server, Windows installation/startup, or behavior with live provider credentials. Follow the Windows setup and manual live-verification steps above on the target machine; provider-backed example requests may incur usage charges.

## Stage 12 validation record

Stage 12 made documentation-only corrections: a clean PowerShell extraction command and a separate-window project path are now explicit. Application source, API behavior, agent services, and migrations were not changed. Validation was performed from a fresh extraction of the Stage 12 ZIP on this Linux sandbox: Python 3.12.3, Node.js 22.23.4, pnpm 10.15.0.

- Backend setup/tests: from `backend`, `python3 -m venv .venv`, `. .venv/bin/activate`, `python -m pip install --upgrade pip`, `pip install -r requirements.txt`, `pytest -q` — **64 passed**, with one upstream AnyIO deprecation warning. The pinned backend packages installed successfully.
- Frontend: from the project root, `pnpm install --frozen-lockfile && pnpm build` — passed (TypeScript and Vite 8.3.6 production build).
- Migration check: from `backend`, `env -u DATABASE_URL ./.venv/bin/alembic heads` reported `0006_decision_support_agent (head)`; `env -u DATABASE_URL ./.venv/bin/alembic upgrade head --sql` generated PostgreSQL-dialect offline SQL through that head. This does not apply migrations to a database.
- API smoke: the unmodified FastAPI app started on loopback with a temporary SQLite URL, and `/api/health` returned `status: ok`, `database: ok`. This is only a SQLite connectivity smoke check, not PostgreSQL validation.
- Browser workflow: not repeated in Stage 12 because no application code changed. The Stage 11 browser pass above used the same frontend/backend source with test providers and disposable SQLite; it is not live-provider validation.

**Not performed:** Windows setup/startup (this host is Linux and has no PowerShell), live PostgreSQL migration/persistence/health checks (PostgreSQL client tools are absent and localhost port 5432 refuses connections), and live Tavily/OpenAI calls (`TAVILY_API_KEY` and `LLM_API_KEY` are not configured). The Research workspace's three internal Research steps share a coarse in-progress display; the API does not expose per-substep telemetry, so exact internal progress is not claimed.
