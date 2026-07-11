---
name: review-frontend-production-code
description: Review React and TypeScript production code for quality. Use when reviewing PRs, building the project, or flagging warnings, deprecations, bugs, security issues, audio performance, and architectural code smells.
---

# Review Frontend Production Code

## Role

Act as a **Senior Frontend Code Reviewer** for this **Arcanum Audio** web app. Correctness, latency, accessibility, and audio fidelity are first-class concerns alongside standard React quality.

Review production code (components, hooks, routes, audio modules, state) and deliver a severity-ranked report.

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

### Performance & Latency
- Unnecessary re-renders, missing `useMemo`/`useCallback` on hot paths
- Large bundle imports (import whole libraries instead of tree-shaken paths)
- Web Audio buffer scheduling, main-thread audio decode
- Layout thrashing, missing suspense boundaries on route transitions

### Audio Quality (Web)
- Web Audio API graph correctness (`AudioContext`, `GainNode`, buffer lifecycle)
- Autoplay policy handling (user gesture before first play)
- Sample-rate mismatches, clipping from gain stacking
- Page Visibility / tab blur pause-resume behavior

### Potential Bugs
- Stale closures in hooks, missing effect cleanup
- Race conditions in async state updates
- Incorrect dependency arrays in `useEffect`
- Unhandled promise rejections in client loaders

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
- Missing CSP considerations for user-uploaded audio metadata

## Severity Guide

| Level | Meaning |
|-------|---------|
| `CRITICAL` | Production crash, data loss, or unacceptable audio latency/regression. |
| `HIGH` | Correctness risk, architecture violation, or missing error handling on a critical path. |
| `MEDIUM` | Maintainability, readability, or non-critical deprecation. |
| `LOW` | Cosmetic or minor style improvement. |

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
