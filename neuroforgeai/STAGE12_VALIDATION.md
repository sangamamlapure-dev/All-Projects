# NeuroForge AI — Stage 12 Validation Report

**Date:** 5 November 2026  
**Status:** Stage 12 validation and deployment preparation complete; no live deployment was performed.

## Validation results

| Check | Result |
|---|---|
| Backend tests | **64 passed**, 1 upstream Starlette deprecation warning, 8.05 seconds. |
| Frontend production build | **Passed**: `tsc -b` and Vite 8.3.6; 2,073 modules transformed. |
| Browser workflow | **Passed** against the actual React UI and FastAPI routes using a disposable SQLite database and deterministic local fixtures; no browser page errors. |
| Provider-cost safety | **0 Tavily/OpenAI provider calls**. No provider keys were set. External font requests were intercepted and aborted before network access. |
| Refresh/persistence | **Passed**: saved state remained visible after refresh; browser API POST count and fixture/provider counters did not increase. |
| Video | One continuous **82.53-second**, 1600×900, 30 fps H.264 MP4 with burned-in captions and a persistent synthetic-data/no-live-provider disclosure. |
| Docker deployment runtime | **Not executed**: Docker/Compose was unavailable in this sandbox. The Compose deployment is prepared but not represented as runtime-tested. |

The complete walkthrough is supplied separately as `NeuroForgeAI-Stage12-demo.mp4`.

## Demonstrated workflow and limits

The video shows project architecture, a submitted research brief, a saved Research Agent answer and source records, Analysis and Evaluation results, Decision Support options with saved-source excerpts and limitations, an insufficient-evidence abstention path, the Overview/Agents/Reports screens, and a refresh persistence check. It also shows the evaluation prerequisite before the explicit agent run and distinguishes sample report/library content from saved agent output.

All research sources and successful agent outputs in the video are **synthetic deterministic test fixtures**, not live search results or model responses. One Analysis failure was intentionally injected by the disposable test harness to demonstrate the explicit retry control; the caption identifies it as a test-only failure, not a provider outage. The second brief uses a fixture with no readable source snippet; the production deterministic abstention logic is exercised without an LLM call. The final refresh performed no additional POST, agent, or provider call.

## Deployment status and remaining steps

No public or private hosted URL is available. No hosting account, domain, TLS certificate, Docker runtime, or deployment credentials were provided or accessible, so no host provisioning, database migration, or live URL verification was possible. The prepared Docker Compose configuration, environment template, Nginx TLS/Basic Auth gateway, API rate limiting, persistent PostgreSQL volume, health checks, and host instructions are in `compose.deploy.yml`, `.env.deploy.example`, `deploy/`, and `DEPLOYMENT.md`.

Before using remote staging, an operator must provision a Docker/Compose host, domain and valid certificate; create the Basic Auth file; enter database and any authorized provider secrets through the host secret manager or owner-only `.env.deploy`; configure firewall access; start the stack; confirm health and Alembic head; and test only with appropriately authorized data. Keep the default loopback bind until the private ingress and firewall are ready. The gateway is a shared staging gate, **not** multi-user authorization: the application has no accounts or per-record ownership, so do not expose it as an open public or multi-tenant service.

The Windows setup and local run guide is in `README.md`. Provider keys are placeholders only and were not included in the source package or recording. No paid provider requests were made.