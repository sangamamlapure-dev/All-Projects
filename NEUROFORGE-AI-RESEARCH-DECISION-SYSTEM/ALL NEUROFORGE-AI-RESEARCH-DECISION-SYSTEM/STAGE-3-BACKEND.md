# NeuroForge AI — Stage 3 Backend Development

## Scope

Stage 3 adds the first FastAPI backend foundation and connects the existing Stage 2 frontend to it. PostgreSQL, authentication, LangGraph, AI agents, external AI APIs, evidence collection, predictions, and report generation remain out of scope.

## Completed deliverables

- FastAPI application factory with CORS, logging, and generic error handling.
- `GET /api/health` health-check endpoint.
- `POST /api/research` request-validation and submission endpoint.
- `GET /api/research/{research_id}` status/retrieval endpoint.
- `GET /api/research` current-session history endpoint.
- Pydantic validation for question, type, and optional description.
- Service layer with temporary thread-safe in-memory storage.
- Pytest tests for health, valid submission, invalid requests, status lookup, unknown IDs, and history.
- Vite `/api` proxy to local FastAPI port 8000.
- Research workspace submission connected to the backend.
- Dashboard backend history section with loading, success, empty, and unavailable states.
- Beginner-oriented backend documentation and run instructions.

## Completion checklist

- [x] FastAPI application created.
- [x] `GET /api/health` implemented and tested.
- [x] `POST /api/research` implemented with Pydantic validation.
- [x] `GET /api/research/{research_id}` implemented with 404 handling.
- [x] `GET /api/research` implemented for current-session history.
- [x] CORS configured for local frontend development.
- [x] Service layer and temporary in-memory storage implemented.
- [x] Logging and generic error handling added.
- [x] Pytest suite passes.
- [x] Frontend submission and history are connected through the Vite proxy.
- [x] Existing frontend pages preserved; no redesign or removal performed.
- [x] No PostgreSQL, authentication, AI agents, external AI API, fake findings, citations, or predictions added.

## Important limitation

A successful submission only means the backend accepted and stored a request in memory. No AI analysis runs in Stage 3. All existing demo findings and reports remain clearly labelled sample/interface content.

## Stage 4 requirements

Before Stage 4, decide the PostgreSQL schema, migration tool, database connection strategy, user ownership model, data-retention policy, and how the API will handle database failures. Then replace the in-memory `ResearchService` with a repository/database implementation while keeping the API schemas stable.
