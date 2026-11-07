# NeuroForge AI private staging deployment

This repository includes an optional Docker Compose deployment for a **private, single-trust-boundary staging instance**. It is prepared for the existing React/Vite, FastAPI, and PostgreSQL stack; it does not change application routes, agents, or Alembic history. It has **not** been deployed from this environment because no hosting account, domain/TLS certificate, Docker Engine, or Docker Compose runtime was available here. Do not treat the files as a verified live deployment.

## Security boundary and intended use

The application itself still has no user accounts, per-record authorization, or application-level rate limiting. The Compose gateway adds HTTPS termination, HTTP Basic authentication for the UI and all `/api/` routes, and per-source-IP request/concurrency limits at Nginx. PostgreSQL and FastAPI have no published host ports. The only unauthenticated route is `/healthz`, which returns the constant text `ok` and reveals no database details.

This is suitable only for a small, trusted private demo where every admitted person may see the same shared research records. It is **not** multi-tenant access control and is not a safe open public application: all authenticated users share the same history and provider budget. Before inviting the general public or handling sensitive/multi-user data, add application identity, ownership/authorization on every saved-record endpoint, abuse/spend controls, and a reviewed CSRF/session design. A shared Basic Auth password and an IP rate limit do not provide those properties.

The gateway defaults to `127.0.0.1:8443`; this prevents accidental Internet exposure. Publishing it on `0.0.0.0` is an explicit host-operator action and should happen only after a valid certificate, strong Basic Auth credentials, firewall rules, and private-demo access expectations are in place. The request limit is 30 API requests/minute per observed source IP with a burst of 12 and up to six concurrent API connections. Users behind the same NAT/proxy share that limit. If another proxy sits in front, do not trust arbitrary forwarded-IP headers; configure trusted proxy CIDRs deliberately before changing the limit key.

## Architecture

```text
Browser -- HTTPS + Basic Auth --> Nginx gateway
                                    |-- static Vite build
                                    `-- /api/* --> FastAPI (private container network)
                                                      |-- PostgreSQL (persistent Docker volume)
                                                      `-- Tavily/OpenAI egress (only if keys are configured)
```

The frontend uses its existing same-origin `/api` base. The gateway forwards API calls internally, and `CORS_ORIGINS` is set to the exact `PUBLIC_ORIGIN`. PostgreSQL is not mapped to a host port; the API is not mapped to a host port. The backend startup command applies the existing Alembic migrations with `alembic upgrade head` before starting Uvicorn. The Compose stack is deliberately single-replica; do not scale the API service without moving migrations into a separately controlled one-time release step.

## Host prerequisites

Use a Linux host or VM that you control and that supports Docker Engine plus the Docker Compose v2 plugin. You also need a DNS name and a valid TLS certificate for it for remote staging. On the host, store secrets in its secret manager if your platform provides one; otherwise use the local `.env.deploy` file with owner-only permissions. Do not send passwords or API keys in chat, add them to source files, or capture them in a screen recording.

The provided Manus WebDev hosting runtime does not run this Python/FastAPI/PostgreSQL stack unchanged. The Compose files are the portable alternative for a host that supports Docker. Choose and provision that host from your own account; no account or hosting credentials were available for this task.

## Prepare secrets and TLS files on the host

From the extracted project root:

```sh
cp .env.deploy.example .env.deploy
chmod 600 .env.deploy
mkdir -p deploy/secrets
chmod 700 deploy/secrets
```

Edit `.env.deploy` on the host. Generate a long random database password locally (a 32-byte hexadecimal value avoids URL-reserved characters):

```sh
openssl rand -hex 32
```

Set `POSTGRES_PASSWORD` and the password portion of `DATABASE_URL` to that same value. If you use a password with URL-reserved characters, percent-encode it in `DATABASE_URL`. Set `PUBLIC_ORIGIN` to the exact HTTPS origin, such as `https://neuroforge-staging.example.com`, without a path. The default `PUBLIC_BIND=127.0.0.1` and `HTTPS_PORT=8443` are intentionally private. Keep them for loopback-only use; changing to `PUBLIC_BIND=0.0.0.0` and `HTTPS_PORT=443` publishes the authenticated TLS gateway on all host interfaces and requires matching firewall rules.

Create an Nginx password file interactively. On Debian/Ubuntu, install `apache2-utils` first if `htpasswd` is not present. The command prompts for the password rather than putting it in shell history:

```sh
htpasswd -B -c deploy/secrets/htpasswd neuroforge-demo
chmod 600 deploy/secrets/htpasswd
```

For remote access, place the certificate chain at `deploy/secrets/fullchain.pem` and its matching private key at `deploy/secrets/privkey.pem`, with restrictive filesystem permissions. Obtain these from the host's certificate manager or ACME setup; never commit them. The Nginx container will fail closed if the required files are absent. A self-signed certificate is acceptable only for isolated local testing, not for a public browser URL.

Only when you are ready to authorize and monitor live provider costs, set `LLM_API_KEY` and `TAVILY_API_KEY` in the host's secret manager or the owner-only `.env.deploy`. They are passed only to FastAPI at runtime; they are not Vite variables and are not copied into the frontend image. Missing keys allow the app to start but provider-backed operations return safe configuration errors. Do not submit paid research requests as a deployment smoke test without approval.

## Build and start

Run from the project root on the host:

```sh
docker compose --env-file .env.deploy -f compose.deploy.yml up --build -d
```

The first API container waits for a healthy PostgreSQL service, applies the unchanged Alembic chain, then starts Uvicorn. The frontend build is served by Nginx, which is the sole host-published service. To see startup status without printing environment values:

```sh
docker compose --env-file .env.deploy -f compose.deploy.yml ps
docker compose --env-file .env.deploy -f compose.deploy.yml logs --tail=100 api gateway
```

If the API never becomes healthy, inspect its safe application log, verify the database URL/network and migrations, and do not expose the gateway while startup is failing. The API health check requires `/api/health` to report `database: ok`.

## Verify the protected staging instance

For a valid public certificate and a host binding on port 443:

```sh
curl --fail --silent --show-error --user neuroforge-demo https://neuroforge-staging.example.com/api/health
```

`curl` prompts for the Basic Auth password. Confirm that the response reports `status: ok` and `database: ok`. An unauthenticated request to `/` and `/api/health` should receive `401`; an authenticated request should succeed. Repeated API requests above the configured limit should receive `429`. Check the actual TLS certificate in a browser, and verify the firewall exposes only the intended HTTPS port. Do not test the research POST unless you have intentionally supplied provider credentials and accepted the possible provider charge.

The backend health route does not itself run migrations. Confirm the applied Alembic revision on the running service:

```sh
docker compose --env-file .env.deploy -f compose.deploy.yml exec -T api alembic current
```

The expected head is `0006_decision_support_agent`. After an explicitly authorized provider-backed workflow, refresh the saved record page and verify the already saved outputs. Refresh is read-only. Keep any real-user test content out of the demo instance.

## Persistence, backup, and shutdown

PostgreSQL data is stored in the named Docker volume `neuroforge_private_staging_pgdata`. `docker compose down` stops containers but keeps this volume. **Do not use `docker compose down -v` unless you intend to permanently delete the database.** Configure a separate encrypted backup/restore process on the host before relying on saved research; the Compose file does not schedule backups. Test restores to a separate staging database before production use.

## What remains before a public product launch

- Provision and authorize a host/domain from your account, obtain a valid certificate, configure firewall/networking, and run the Compose stack. No live URL is available from this task.
- Review this configuration on the selected host: Docker/Compose runtime and provider-specific secret handling were not testable in this sandbox.
- Add application login and per-user record ownership/authorization before exposing different users to shared research history; the current gateway password is a shared staging gate only.
- Set provider secrets through the host's protected secret facility and establish provider spend/usage monitoring before any paid API action.
- Establish and test PostgreSQL backups, restores, monitoring, and operational alerting.
- If public exposure is needed, have the host's security reviewer assess ingress, rate-limit fairness behind any proxy, TLS renewal, retention/deletion requirements, and whether health/docs endpoints meet policy.
