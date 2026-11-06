# NeuroForge AI — Stage 2 TODO (archived milestone checklist)

> Historical record of the Stage 2 frontend foundation. The checklist below describes that milestone only; some statements (including the absence of a backend) are not current system status. See `README.md` for the current backend workflow, setup instructions, and limitations.

## Frontend foundation and visual system

- [x] Create a working React and TypeScript frontend with Tailwind CSS and Lucide React.
- [x] Use a clean light background, dark navy text, blue/violet accents, rounded cards, subtle borders, responsive layouts, and restrained motion.
- [x] Keep the source modular with separate components, pages, layouts, data, and types.

## Landing page

- [x] Provide NeuroForge AI branding and navigation.
- [x] Provide a hero section explaining the platform.
- [x] Provide a research question input area.
- [x] Provide features, how-it-works, AI-agent overview, and footer sections.

## Product navigation and dashboard

- [x] Make navigation work between landing page, dashboard, research workspace, AI agents, reports, and report details.
- [x] Provide dashboard sidebar navigation, welcome section, new research button, recent research projects, statistics, recent reports, and empty states.

## Research workspace demo

- [x] Provide research question input, research type selector, optional description, and submit research button.
- [x] Provide a frontend-only AI-agent workflow visualization and progress states.
- [x] Provide findings, evidence, and limitations sections using clearly labelled demo content.
- [x] Never display a successful AI analysis when no backend exists; show an explicit demo-only/not-connected message.

## AI agents page

- [x] Display Research Agent, Analysis Agent, Evaluation Agent, Prediction Agent, and Orchestrator.
- [x] Show each agent's purpose, current demo status, and short explanation.

## Reports page

- [x] Provide report history, search, filter controls, report cards, report details, and an export-report demo action.
- [x] Use sample reports only and label them as demonstrations.

## States and verification

- [x] Show appropriate loading, empty, success, and error states.
- [x] Keep sample data and frontend demonstration state separate from future backend functionality.
- [x] Verify the app starts successfully with the development server.
- [x] Verify routes, navigation links, forms, search/filter controls, report details, and demonstration buttons.
- [x] Verify the application has no backend, database, authentication, external AI API, fake research evidence, fake citations, or fake predictions.
- [x] Add local run instructions, a file-change summary, frontend architecture notes, and a Stage 2 completion checklist.
