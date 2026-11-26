## What & why

Set up the initial STRIDEXA project repository and development environment. This PR establishes the Next.js foundation, project structure, development tooling, and CI workflow for Sprint 0.

## Changes

-Initialized STRIDEXA repository with main and develop branches.

Created Next.js application using TypeScript and Tailwind CSS.

Added feature-based folder structure.

Added global design tokens and root layout.

Added shared domain constants and utility functions.

Configured Vitest and initial unit tests.

Added .env.example and Docker Compose configuration for PostgreSQL.

Added GitHub Actions CI workflow.

Updated README with setup instructions and Git branching conventions.

## How to test

1.Run npm install to install dependencies.

2. Run cp .env.example .env to create the environment file.

3. Run docker compose up -d to start PostgreSQL.

4. Run npm run dev and verify the app opens at http://localhost:3000.

5. Run npm run lint.

6. Run npm run typecheck.

7. Run npm test.

8. Run npm run build.

## Checklist

- [ ] `npm run lint`, `typecheck` and `test` pass locally
- [ ] Conventional Commit messages
- [ ] No secrets committed (`git status` shows no `.env`)
- [ ] README/docs updated if behaviour changed
