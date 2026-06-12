# Agent Instructions

## Prime Directive

Use this file as the source of truth for agent behavior in this repository.
Before making changes, inspect the relevant code, follow the applicable rule files, and verify the result with the smallest meaningful test or build command.

## Project Map

- `frontend/`: React + Vite client
- `backend/`: Spring Boot server
- `ai/`: AI service code and OLV integration
- `docs/`: API contracts and workflow documents
- `rules/`: task-specific engineering rules

For a depth-limited structure map, use `rules/project-treemap.tsv`.

## Required Rules

Read the relevant rule files before editing:

- API, endpoint, DTO, WebSocket, `[ACTION]`, or DOM-contract work: `rules/api-contract.tsv`
- Git branch, commit, PR, merge, release, or collaboration work: `rules/git-workflow.tsv`

When a rule file points to a canonical document in `docs/`, consult that document for exact contract details before changing behavior.

## Common Rules

- Prefer existing project patterns over introducing new abstractions.
- Keep changes scoped to the user request.
- Do not edit generated/build output or dependency folders unless explicitly required.
- Do not commit secrets or credentials.
- Do not make breaking API contract changes without explicit team agreement.
- Run relevant checks before finishing, and mention any checks that could not be run.
