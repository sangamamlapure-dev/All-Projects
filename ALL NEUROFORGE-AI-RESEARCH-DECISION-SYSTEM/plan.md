# NeuroForge AI — Stage 2 Frontend Plan

## Scope and implementation approach

Stage 2 will deliver a frontend-only React and TypeScript demonstration. It will not implement or connect a backend, PostgreSQL, authentication, LangGraph, Scikit-learn, or any external AI API. All research results, report cards, agent statuses, and workflow activity shown by the interface will be clearly labelled demo data. The research workspace will demonstrate frontend state changes only and will not claim that an AI analysis completed.

The application will be a single-page React app with client-side route state using React Router. A shared application shell will provide the responsive sidebar/top navigation, page titles, and consistent action styling. Reusable UI primitives will keep cards, badges, buttons, empty states, form controls, and icons consistent. Sample records will be isolated in `src/data/`, and TypeScript interfaces will be isolated in `src/types/`, so future backend integration can replace the data layer without rewriting the page components.

The primary user journey will be:

1. Land on the marketing page and understand NeuroForge AI.
2. Open the dashboard and see the demo workspace overview.
3. Start a new research workspace, enter a question, choose a research type, and submit it.
4. See an explicit demo workflow state and a safe message that no real AI analysis is running yet.
5. Browse demo agents and sample reports, with search/filter and report-detail interactions.

## Design direction

### Three initial style options

- **Quiet Intelligence / editorial research console** — probability 0.07; calm light surfaces, navy typography, blue-violet signal accents, and compact evidence-oriented panels.
- **Aurora Lab / expressive AI studio** — probability 0.06; brighter gradients, larger visual moments, and more experimental dashboard composition.
- **Civic Signal / institutional decision desk** — probability 0.05; restrained colors, strong data hierarchy, and formal report-first layouts.

**Chosen style:** Quiet Intelligence / editorial research console.

### Design movement

A restrained editorial research console: closer to a well-designed analyst workspace than a flashy AI dashboard.

### Core principles

1. **Evidence before spectacle:** Use hierarchy, labels, and source-like metadata to make the purpose clear.
2. **Calm guidance:** Use white space, navy text, and gentle blue-violet emphasis to reduce cognitive load.
3. **Honest states:** Demo, loading, empty, success, and error states are explicit and never imply real AI work.
4. **Progressive disclosure:** Keep high-level summaries visible while allowing report details and workflow context to be explored.

### Color philosophy

Warm white and cool slate surfaces create a dependable workspace. Deep navy provides readable authority for research content. Electric blue signals active navigation and primary actions; a muted violet is reserved for AI-oriented accents and orchestration. Green and amber are used sparingly for status communication, never as decoration.

### Layout paradigm

Use an asymmetric research desk layout: a narrow navigation rail and top context bar frame wide content columns. The landing page uses an editorial split hero with a compact interactive research prompt, while product pages use a left rail plus a flexible content canvas. Avoid a generic centered marketing grid.

### Signature elements

- A small `NF` neural-forge mark formed from two interlocking angled strokes.
- A thin “signal rail” motif beside workflow steps and report evidence sections.
- Compact status chips that always include a plain-language label such as `Demo data` or `Not connected`.

### Interaction philosophy

Interactions should feel deliberate and informative. Buttons show the result of their action through inline status text or a toast. Forms preserve entered content. Empty and unavailable states explain what is missing rather than pretending a result exists. Navigation is immediate and predictable.

### Animation

Use short, low-key transitions for route changes, cards, and status updates: opacity/translate transitions around 150–220ms. Avoid looping animations and decorative motion. A small progress indicator may pulse only while a demo workflow is active, and it must stop with a clear demo-complete message.

### Typography system

Use `Inter` for interface copy and `Space Grotesk` for major headings if loaded through a local-safe CSS import; fall back to system sans-serif fonts if unavailable. Use a strong display heading, readable 15–16px body text, compact uppercase eyebrow labels, and tabular-looking metric numerals. Keep line length comfortable for report content.

### Brand essence

**NeuroForge AI is a transparent research workspace for students and teams who need to turn complex questions into structured, evidence-aware decisions.** Personality: focused, candid, methodical.

### Brand voice

Headlines are direct and specific. CTAs describe the next action rather than making exaggerated promises.

- “Turn a difficult question into a research trail.”
- “Start with a question. Keep every assumption visible.”

### Wordmark and logo

The wordmark uses the `NF` interlocking-stroke mark beside the name, with a small “AI RESEARCH WORKSPACE” descriptor in the product shell. The mark is rendered as a CSS/SVG icon rather than a text-only logo.

### Signature brand color

`Signal Blue` (`#2563EB`) is the ownable brand color: bright enough to guide attention, but grounded by navy and neutral surfaces.

## Component and route structure

```text
src/
├── components/
│   ├── brand/              # Logo and product mark
│   ├── layout/             # App shell, sidebar, page header
│   ├── ui/                 # Buttons, cards, badges, inputs, empty states, toast
│   ├── research/           # Workflow steps and result sections
│   └── reports/            # Report cards and report detail panel
├── data/
│   └── demoData.ts         # Clearly labelled demo agents, reports, history
├── layouts/
│   └── AppShell.tsx        # Shared authenticated-style demo layout
├── pages/
│   ├── LandingPage.tsx
│   ├── DashboardPage.tsx
│   ├── ResearchWorkspacePage.tsx
│   ├── AgentsPage.tsx
│   └── ReportsPage.tsx
├── types/
│   └── index.ts            # Shared TypeScript interfaces and unions
├── App.tsx                 # Route table and top-level demo state
├── main.tsx                # React entry point
└── index.css               # Tailwind layers and global visual tokens
```

Routes:

- `/` — Landing page
- `/dashboard` — Dashboard
- `/research/new` — Research Workspace
- `/agents` — AI Agents
- `/reports` — Reports
- `/reports/:reportId` — Report detail

A public `public/manus-routes.json` will list these page routes for the managed preview.

## Build workflow

1. Add a minimal Vite React TypeScript setup and pin the package manager.
2. Configure Tailwind CSS, Lucide React, React Router, and the project-level styling tokens.
3. Create the route manifest before starting the dev server.
4. Build shared primitives and the responsive app shell.
5. Implement the landing page and public navigation.
6. Implement dashboard, research workspace, agents, and reports using isolated demo data.
7. Add clear loading, empty, success, error, and “demo only / backend not connected” states.
8. Configure managed TypeScript diagnostics and resolve actionable diagnostics.
9. Run the production build and start the development server on the configured port.
10. Verify the route manifest, HTTP readiness, page routes, responsive layouts, form interactions, report search/filter, report detail, demo workflow state, and export-demo action.
11. Prepare `README.md` run instructions and a Stage 2 completion checklist without changing the existing Stage 1 documentation outside this project workspace.
12. Commit the frontend implementation to the managed project’s main branch checkpoint.

## Explicit non-goals for Stage 2

- No FastAPI server or API routes.
- No PostgreSQL schema or database connection.
- No real login, registration, sessions, or account storage.
- No LangGraph workflow execution.
- No Gemini or other external LLM calls.
- No live web research, real citations, fake findings, fake evidence, or fake predictions.
- No Scikit-learn model training or prediction.
- No Stage 3 implementation.
