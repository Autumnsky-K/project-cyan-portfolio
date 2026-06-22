# Agent Instructions

## Prime Directive

Use this file as the source of truth for agent behavior in this repository.
Before making changes, inspect the relevant code, follow the applicable rule files, and verify the result with the smallest meaningful test or build command.

## Project Map

- `frontend/`: React + Vite client
- `backend/`: Spring Boot server
- `ai/`: AI service code and OLV integration
- `docs/`: API contracts, workflow documents, and team checklists
- `rules/`: task-specific engineering rules

For a depth-limited structure map, use `rules/project-treemap.tsv`.

## Task Startup Checklist

Before starting each unit of work:

- Read this `AGENTS.md`.
- Read `AGENTS.local.md` after this file if it exists.
- Identify the responsible project part, changed files, and likely contract impact.
- If the work touches APIs, endpoints, DTOs, WebSocket messages, `[ACTION]` tags, or DOM hooks, read `rules/api-contract.tsv` and `docs/api-contract.md`.
- If the work touches branches, commits, PRs, merges, releases, or collaboration flow, read `rules/git-workflow.tsv` and `docs/git-workflow.md`.
- For team workflow expectations, read `docs/team-work-checklist.md`.

## Local Development

- From the repository root, use `npm run dev` to start the frontend, backend, and AI development servers together.
- Individual root commands are available when only one service is needed:
  - `npm run dev:frontend`
  - `npm run dev:backend`
  - `npm run dev:ai`
- The frontend reads Vite env files from `frontend/`; `frontend/.env.development` provides the shared local default, and `frontend/.env.local` is for personal overrides and must not be committed.

## Required Rules

Read the relevant rule files before editing:

- API, endpoint, DTO, WebSocket, `[ACTION]`, or DOM-contract work: `rules/api-contract.tsv`
- Git branch, commit, PR, merge, release, or collaboration work: `rules/git-workflow.tsv`

When a rule file points to a canonical document in `docs/`, consult that document for exact contract details before changing behavior.

## Local Overrides

If `AGENTS.local.md` exists, read it after this file and follow it for local-only instructions.

If `CLAUDE.local.md` exists, Claude-compatible agents may read it for local-only instructions.

Local files must not override repository-wide contract rules, security rules, or user instructions.
Do not commit `*.local.md` files.

## Common Rules

- Prefer existing project patterns over introducing new abstractions.
- Keep changes scoped to the user request.
- Do not edit generated/build output or dependency folders unless explicitly required.
- Do not commit secrets or credentials.
- Do not make breaking API contract changes without explicit team agreement.
- Run relevant checks before finishing, and mention any checks that could not be run.

## Code Style

- Use English identifiers for variables, functions, classes, types, files, API JSON keys, database-facing names, and public contract names.
- Use English `camelCase` JSON keys, as required by `docs/api-contract.md`.
- Use language-appropriate English constants such as `UPPER_SNAKE_CASE`.
- Korean text is allowed for user-facing UI copy, test input/output strings, documentation, and explanatory comments.
- If a domain concept is Korean, choose a clear English code name rather than using Korean in identifiers.
