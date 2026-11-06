# NeuroForge AI Backend — Stages 6–10

NeuroForge uses FastAPI, SQLAlchemy, Alembic, and PostgreSQL for a saved, evidence-focused research workflow. Stage 6 creates a research record, performs one Tavily Search request, persists usable source metadata/snippets, and asks OpenAI `gpt-4.1-mini` for a structured answer. Stages 7–9 add explicit Analysis, Evaluation, and Decision Support runs over saved upstream data. Stage 10 hardens lifecycle claims, database configuration, API error handling, CORS/logging, and tests. It adds no agent and no migration.

The Stage 12 release is a validation/documentation update only; backend runtime behavior and migration history remain unchanged from Stage 10.

## Workflow boundaries

- `POST /api/research` creates a new research UUID and runs retrieval plus answer generation. Each submission is a new request; it is not idempotent by question text. A failed Research Agent request has no saved-record retry button; submit a new research request if a retry is intended.
- `POST /api/research/{id}/analysis` requires a completed Research Agent answer and saved sources. It reads only the saved research record/snippets.
- `POST /api/research/{id}/evaluation` requires completed Research and Analysis results. It evaluates the saved outputs against the saved source evidence.
- `POST /api/research/{id}/decision-support` requires completed Research, Analysis, and Evaluation results. It uses saved source UUIDs and exact snippet excerpts; it never searches again.
- The corresponding GET endpoints only return saved results/status (`not_started` when absent). Page load/refresh uses GET and never starts or polls an agent.

A completed result is returned unchanged on repeat POST. A failed downstream run is retried only by an explicit POST. Concurrent retries are claimed with an atomic status/timestamp update, so only one request starts the agent. A `processing` row is returned as-is while recent; after five minutes without an update, only an explicit POST can reclaim it. This threshold exceeds the configured Tavily (20-second) and OpenAI (30-second) request timeouts. Refreshing or GET never recovers a run.

## Data integrity and safe errors

Result tables are one-to-one with the parent research record and reference it with `ON DELETE CASCADE`. The migration chain remains linear from `0001_create_research` through `0006_decision_support_agent`; Stage 10 does not edit or add migrations. SQLite tests explicitly enable foreign keys and cover orphan rejection and cascade deletion. PostgreSQL remains the documented runtime database.

Invalid UUIDs return 400, unknown research records return 404, missing/incomplete prerequisites return 409, and database/storage problems return safe 503 responses. Invalid persisted Analysis/Evaluation output returns a generic 409 rather than exposing Pydantic validation details or returning a traceback. Provider failures are mapped to safe error codes. Database URL syntax/driver configuration is checked before database-backed requests.

Analysis, Evaluation, and Decision Support outputs are schema-validated. Citation/source numbers are checked against the current saved sources; Decision Support source UUIDs and excerpts are checked against readable snippets. Model/source content is treated as untrusted input and no agent is represented as an independent fact-checker. Provider errors, database statements/parameters, credentials, and raw provider responses are not returned to clients or written through application exception tracebacks.

## Configuration and requirements

Use Python **3.10+** (the guide uses 3.12); the code uses modern union syntax. Exact Python package versions are pinned in `requirements.txt`. The app uses synchronous `psycopg` v3 and SQLAlchemy 2. PostgreSQL **14+** is the documented local runtime baseline. Tests use SQLite and do not prove PostgreSQL compatibility. Node.js is **20.19+ or 22.12+** per locked Vite 8.3.6; pnpm **10.15.0** is declared by the frontend package.

Copy `.env.example` to `.env` in this directory and provide:

```dotenv
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@localhost:5432/neuroforge_db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
LLM_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

These examples contain placeholders only. `DATABASE_URL` must use a supported PostgreSQL psycopg URL with a database name; SQLite URLs are accepted for tests. URL-encode reserved characters in the database password. Set keys only in this server-side environment file or a secret store. Never put provider keys in Vite/`VITE_*` variables. `APP_ENV` is not consumed by this code and is intentionally omitted.

`CORS_ORIGINS` defaults to the four localhost/127.0.0.1 development origins. CORS allows GET/POST/OPTIONS and the JSON content type without credentialed cross-origin requests. Configure explicit trusted origins if needed; CORS is not authentication.

## Windows setup

From PowerShell, after installing PostgreSQL 14+, Python 3.12, Node 20.19+/22.12+, and pnpm 10.15.0:

```powershell
Set-Location C:\path\to\neuroforge-ai-stage12\backend
Copy-Item .env.example .env
notepad .env
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
alembic current
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`alembic current` should show `0006_decision_support_agent`. `/api/health` should report `status: ok` and `database: ok` when PostgreSQL is reachable and configured. If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that window, then activate again. The `--reload` command is for local development only.

## API endpoints

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/research` | Create a new research record; runs Tavily and OpenAI when configured |
| GET | `/api/research` | Read saved history |
| GET | `/api/research/{id}` | Read saved research, answer, and sources |
| POST / GET | `/api/research/{id}/analysis` | Explicit Analysis run / read-only Analysis status and result |
| POST / GET | `/api/research/{id}/evaluation` | Explicit Evaluation run / read-only Evaluation status and result |
| POST / GET | `/api/research/{id}/decision-support` | Explicit Decision Support run / read-only status and result |
| GET | `/api/health` | API/DB health summary; does not expose connection details |

## Tests and limits

Run from `backend` after installing requirements:

```powershell
pytest -q
```

The test suite uses mocked Tavily/OpenAI generators and SQLite, makes no paid provider requests, and covers the complete Research → Analysis → Evaluation → Decision Support API workflow; explicit/read-only calls; prerequisites; safe malformed saved-result responses; source validation; atomic concurrent retries for all three downstream services; stale-run recovery only through POST; foreign-key enforcement/cascades; invalid DB configuration; and CORS/logging behavior. Migration history and offline SQL generation are separate checks. Tests do not run a live PostgreSQL migration, call providers, or exercise a real browser.

This API has no user authentication, authorization, or rate limiting. Vite dev/preview and the documented Uvicorn command bind to loopback for local development; do not expose this API to the public Internet or use it for sensitive multi-user data. The README at the project root contains the full Windows walkthrough, the optional provider-costing example, manual browser/network verification, and troubleshooting. No live provider, Windows, browser, or PostgreSQL check should be inferred from passing the mocked test suite.


## Optional private Docker staging

The repository-root [`DEPLOYMENT.md`](../DEPLOYMENT.md) documents the optional Docker Compose stack for a private staging instance. It builds this FastAPI API, applies the existing Alembic head before Uvicorn starts, and keeps PostgreSQL on an internal network with a persistent volume. The API has no application-level users or per-record authorization: do not publish port 8000 or treat the shared Nginx Basic Auth gate as multi-user security. The deployment files have not been run with Docker or against a live PostgreSQL host in this environment.
