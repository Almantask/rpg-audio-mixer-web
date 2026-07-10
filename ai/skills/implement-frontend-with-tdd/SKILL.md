---
name: implement-frontend-with-tdd
description: 'Implement React frontend features with strict TDD (Red → Green → Refactor). Use when: writing components, pages, hooks, or client logic with Vitest/RTL; bootstrapping Next.js or Vite with Tailwind and shadcn/ui; or debugging frontend build/test failures.'
context: fork
---

# Implement Frontend with TDD

## Role

Act as a **senior frontend engineer** who practices strict **TDD** and ships accessible, type-safe React.  
Every task follows the Red → Green → Refactor loop before any production code is considered done.

---

## Stack Detection (always first)

Read `package.json` before assuming tooling:

| Signal | Stack |
|---|---|
| `"next"` in dependencies | **Next.js** — App Router (`app/`), Server Components by default, `"use client"` only when needed |
| `"vite"` in devDependencies | **Vite + React** — SPA with `src/main.tsx`, React Router |
| Neither present | Bootstrap per project convention; prefer **Vite** for SPA, **Next.js** when SSR/routing complexity warrants it |

Shared stack in all cases:
- **TypeScript** (strict mode)
- **Tailwind CSS** for layout and tokens
- **shadcn/ui** for interactive primitives — add via CLI, never hand-roll buttons/inputs/dialogs that shadcn already provides
- **Vitest** + **@testing-library/react** for unit/component tests

---

## TDD Loop (mandatory)

```
RED      → Write the smallest failing test that captures observable behaviour.
GREEN    → Write the minimum production code to pass. No gold-plating.
REFACTOR → Clean naming and structure without breaking tests.
```

**Never write production code before a failing test exists.**

### Cycle checklist

- [ ] Test name describes behaviour (`renders X when Y`, `calls onSubmit with valid data`).
- [ ] Query by role/label/text — not implementation details (`getByRole`, `getByLabelText`).
- [ ] One logical behaviour per test.
- [ ] After Green: run the full unit test suite.
- [ ] After Refactor: all tests still pass.

---

## Read Before Write

Before creating any file:

1. Search `src/components/`, `components/ui/`, `app/`, and `src/hooks/` for existing code to extend.
2. Read the relevant `docs/designs/[scene]-design.md` and linked HTML prototype for layout, states, and copy.
3. Read `docs/design-overall.md` for navigation, theme, and data-model constraints.
4. Match existing naming, import style, and folder layout.

**Simple first:** implement inline in the page/component until the same pattern appears twice, then extract.

---

## Delivery Order

1. **Understand requirements** — one-sentence behaviour statement.
2. **Inspect existing code** — reuse or extend before creating.
3. **Write failing test(s)** — smallest slice (hook logic, then component render, then interaction).
4. **Implement (Green)** — minimum code; prefer shadcn primitives + Tailwind utilities.
5. **Refactor** — extract only when duplication is real.
6. **Repeat** per behaviour slice.
7. **Cover states** from the design spec: empty, loading, success, error.
8. **Run quality gates** (below) before handoff.

Work in parallel on acceptance specs — do not block on `.feature` files. Do not write acceptance or E2E tests in this skill.

---

## File Conventions

### Next.js (App Router)

```
app/
  (routes)/[feature]/page.tsx       # route entry, composes feature UI
  layout.tsx                        # shared shell, nav
src/
  components/
    ui/                             # shadcn primitives (generated)
    [Feature]/[Feature].tsx         # feature-specific components
  hooks/use[Feature].ts
  lib/utils.ts                      # cn() helper, shared utilities
```

### Vite + React

```
src/
  pages/[Feature]Page.tsx
  components/
    ui/                             # shadcn primitives
    [Feature]/[Feature].tsx
  hooks/use[Feature].ts
  routes/                           # React Router config
  lib/utils.ts
```

**Rules:**
- Components are **presentational by default** — data fetching and side effects live in hooks or route loaders.
- Co-locate tests: `[Component].test.tsx` next to `[Component].tsx`.
- Use `cn()` from `lib/utils` for conditional Tailwind classes.
- Dark theme only — match `docs/design-overall.md` palette (black bg, gold/amber text, purple/pink/gold accents).

---

## shadcn/ui Usage

- Install components via `npx shadcn@latest add <component>` — do not copy-paste from docs into random paths.
- Compose shadcn primitives (`Button`, `Card`, `Skeleton`, `Dialog`, `Tabs`) rather than raw `<button>` / `<div>` for interactive UI.
- Extend with Tailwind — do not override shadcn CSS variables unless the design spec requires it.
- Every interactive element needs an accessible name (`aria-label` or visible text).

---

## Test Patterns

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SceneCard } from './SceneCard'

describe('SceneCard', () => {
  it('renders skeleton when loading', () => {
    render(<SceneCard isLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('calls onEnter when Enter button is clicked', async () => {
    const onEnter = vi.fn()
    render(<SceneCard name="Tavern" onEnter={onEnter} />)
    await userEvent.click(screen.getByRole('button', { name: /enter/i }))
    expect(onEnter).toHaveBeenCalledOnce()
  })
})
```

| Layer | Scope | Tools |
|---|---|---|
| Unit | Pure functions, hooks, mappers | Vitest |
| Component | Render, interaction, a11y roles | Vitest + RTL |
| E2E / acceptance | Full user flows | **Outside this skill's scope** |

---

## Local Quality Gates

Run before marking any task complete (use the project's package manager):

```bash
pnpm typecheck   # or: tsc --noEmit / next build --no-lint (project script)
pnpm lint
pnpm test
```

All three must pass. Fix issues — do not suppress lint rules without justification.

---

## Anti-Patterns

| Do not | Do instead |
|---|---|
| Create a `Button.tsx` when shadcn `Button` exists | `npx shadcn@latest add button` |
| Abstract a hook/component on first use | Inline; extract on second identical use |
| `getByTestId` for everything | `getByRole`, `getByLabelText`, `getByText` |
| `any` types | Proper generics or `unknown` + narrowing |
| Skip loading/error states | Implement all four states from design spec |
| Write Playwright/Cucumber tests | Outside this skill's scope |
| Commit without being asked | Leave changes uncommitted |

---

## Handoff

When done, report:
- Files created/changed
- Test count and pass status
- Quality gate results
- Any open questions or design ambiguities found in specs
