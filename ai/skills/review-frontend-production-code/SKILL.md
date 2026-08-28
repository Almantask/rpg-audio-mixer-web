---
name: review-frontend-production-code
description: Review React and TypeScript production code for quality. Use when reviewing PRs, building the project, or flagging warnings, deprecations, bugs, security issues, performance issues, and architectural code smells.
---

# Review Frontend Production Code

## Role

Act as a **Senior Frontend Code Reviewer**. Correctness, responsiveness, accessibility, and performance are first-class concerns alongside standard React quality.

Review production code (components, hooks, routes, state) and deliver a severity-ranked report.

## Workflow

1. **Build the project** — treat TypeScript errors, lint failures, or unresolved dependencies as blocking:
   ```powershell
   .\ai\skills\review-frontend-production-code\scripts\build_frontend.ps1
   ```

2. **Evaluate production code** — work through every category below. Flag issues with severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

3. **Run lint and typecheck**:
   ```bash
   pnpm lint
   pnpm typecheck
   ```
   Include findings in the report.

4. **Pair review** — after isolated reviews complete, combine findings before reporting to implementers.

5. **Deliver a focused report** — group by category and severity. Lead with `CRITICAL` and `HIGH`. Each finding must include: file + line reference, explanation, and a concrete fix suggestion.

## Evaluation Categories

### Performance & Responsiveness
- Unnecessary re-renders, missing `useMemo`/`useCallback` on hot paths
- Large bundle imports (import whole libraries instead of tree-shaken paths)
- Layout thrashing, missing suspense boundaries on route transitions
- Inefficient DOM operations or heavy synchronous work on the main thread

### State & Asynchronous Lifecycle
- Stale closures in hooks, missing effect cleanup
- Race conditions in async state updates
- Incorrect dependency arrays in `useEffect`
- Unhandled promise rejections in client loaders

### Potential Bugs
- Unhandled null/undefined values or missing runtime boundary checks
- Missing error boundary coverage
- Stale cached state or synchronization issues

### Code Smells
- Business logic inside presentational components
- God components, prop drilling past two levels without context
- Duplicated fetch logic outside hooks or route loaders
- Raw `<button>`/`<input>` where shadcn primitives exist

### Accessibility
- Missing accessible names on interactive elements
- Keyboard traps, incorrect focus management in dialogs
- Color-only state indicators

### Warnings & Deprecations
- Deprecated React or Next.js APIs
- Legacy ESLint rule suppressions without justification

### Dependency Health
- Dependencies declared in `package.json` with pinned or catalogued versions
- Superseded patterns (Pages Router when App Router is standard, etc.)

### Security
- Hardcoded secrets, XSS via `dangerouslySetInnerHTML`
- Missing validation or sanitization for user-uploaded metadata

## Severity Guide

| Level | Meaning |
|-------|---------|
| `CRITICAL` | Production crash, data loss, or severe performance regression. |
| `HIGH` | Correctness risk, architecture violation, or missing error handling on a critical path. |
| `MEDIUM` | Maintainability, readability, or non-critical deprecation. |
| `LOW` | Cosmetic or minor style improvement. |

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
