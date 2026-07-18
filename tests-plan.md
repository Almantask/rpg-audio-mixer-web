# Test Speed & Stability Plan

Make unit and acceptance runs faster without trading away predictability. Prefer scoped local runs, condition-based waits, short audio fixtures, and CI parallelism only after isolation is proven.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` complete

**Constraints (do not violate):**

- No extra Playwright retries to “buy” green CI
- No multi-browser projects until Chromium is boringly green
- Do not raise CI `workers` until scenarios are proven independent under parallel load
- Keep `missingSteps: 'fail-on-gen'` and zero-skip sign-off rules
- Do **not** adopt a suite-wide “create all data → max-parallel interact → delete at end” on shared `localStorage` (see [Orchestration decision](#orchestration-decision--shared-create--interact--delete))

---

## Goals

| Goal | Success signal |
|---|---|
| Faster local iteration | Typical change validated with one feature + warm Vite server in minutes |
| Stable full suite | Full `@iter1`–`@iter10` suite green with `retries: 0` locally and CI retries only on first flake path |
| Faster CI wall-clock | Acceptance job time down via browser cache + safe sharding/workers (after Phase B) |
| Right layer of test | New logic covered in Vitest first; Playwright reserved for cross-screen / real Web Audio behavior |

---

## Phase A — Local workflow (low risk, immediate)

Document and wire the existing preferred loop so it is the default path.

### A1. Warm server + focused feature runs

- [ ] Document in `ai/skills/author-acceptance-tests` (and/or `package.json` scripts):
  - Start once: `npm run dev` (port `5173`; Playwright already uses `reuseExistingServer: !CI`)
  - Iterate: `npx bddgen` then one generated feature with `--workers=1 --reporter=line`
  - Sign-off: full suite only when the slice is done
- [ ] Add convenience scripts (names can vary; keep behavior clear):
  - `test:acceptance:feature` — runs a single `.features-gen/...feature.spec.js` path
  - `test:acceptance:iter` — `playwright test --grep "@iterN"` (pass tag via env/arg)
- [ ] Keep full-suite script as today: `bddgen && playwright test`

### A2. Tag-scoped runs

- [ ] Prefer `--grep "@iterN"` over the full `@iter0 or … or @iter10` expression when validating one slice
- [ ] Align manual workflow `acceptance-tests.yml` defaults with the slice under test (already accepts `cucumber_tags` / `cucumber_features`)

### A3. Vitest as the fast path

- [ ] For new pure logic (audio manager helpers, storage merges, tag parsing, volume math), add/extend `src/**/*.{test,spec}.{ts,tsx}` before adding Playwright coverage
- [ ] When a Playwright scenario only asserts pure state with heavy UI setup, consider extracting the assertion target into a unit-tested helper and shrinking the E2E to the user-visible contract
- [ ] Keep `npm run test` / `test:watch` as the default inner loop for FE changes; reserve `test:acceptance` for behavior that needs a real browser

**Exit criteria:** A developer can validate a typical UI/audio change without a full Playwright suite; scripts make the focused path obvious.

---

## Phase B — Acceptance step quality (stability + speed)

Remove artificial latency and unnecessary heavy fixtures. Do not weaken assertions.

### B1. Replace fixed sleeps with condition waits

Known `page.waitForTimeout` call sites:

| File | Approx. waits | Replacement direction |
|---|---|---|
| `e2e/steps/active-scene/playback.ts` | `2500`, `500` | Assert `data-state` / playing helpers via `expect.poll` / Playwright auto-wait |
| `e2e/steps/active-scene/soundscapes.ts` | `300`, `400` | Wait on visible UI / playback attributes |
| `e2e/steps/active-scene/master-controls.ts` | `500` | Wait on master/playback state attributes |
| `e2e/steps/scenes/scene-cloning.ts` | `200`, `200` | Wait on cloned card / navigation readiness |

- [ ] Replace each sleep with a deterministic condition (role/label/`data-*` already used elsewhere)
- [ ] Re-run the owning feature file after each file change (`--workers=1`)
- [ ] Grep for `waitForTimeout` — target **zero** remaining uses unless a scenario truly needs wall-clock time (document why if any remain)

### B2. Prefer short audio fixtures

- [ ] Audit seeds using `longAudio: true`, `LONG_FX_AUDIO_URL`, or `durationSeconds: 120` when the scenario does **not** need natural track-end / long overlap
  - Known: `e2e/steps/active-scene/playback.ts`, `seedSoundboardEffects(..., { longAudio: true })` in `e2e/steps/shared/test-data.ts`
- [ ] Default new FX/soundscape seeds to short clips (existing short `durationSeconds` patterns)
- [ ] Keep long assets only for scenarios that assert track-end chaining, long overlap, or similar timing contracts
- [ ] Optionally add a tiny dedicated fixture file (very short ogg) if decode cost of production assets is still high for “presence only” steps

### B3. Isolation checklist (prerequisite for more workers)

Before raising parallelism, confirm every scenario:

- [ ] Seeds its own data via `seedE2EData` / builders (no reliance on leftover `localStorage`)
- [ ] Does not depend on run order or shared browser profile state
- [ ] Uses scoped locators (`main` / `dialog`, strict role/label) — no `.first()` band-aids
- [ ] Passes when its feature file is run alone

**Exit criteria:** No unjustified `waitForTimeout`; long audio only where required; one-feature-alone green for touched areas.

---

## Orchestration decision — shared create → interact → delete

**Question:** Can we create data for all scenarios first (in parallel), wait, then max-parallelize interactions on that data, then run delete scenarios at the end?

**Answer for this repo today: no as a default strategy.** Playwright can stage work; our data model cannot safely share one mutable world across workers.

### What Playwright can do

Project `dependencies` act as barriers between stages:

```ts
// Illustrative only — not the chosen default for this repo
projects: [
  { name: 'create',   testMatch: /create/ },
  { name: 'interact', testMatch: /interact/, dependencies: ['create'] },
  { name: 'delete',   testMatch: /delete/,   dependencies: ['interact'] },
]
```

- All `create` tests finish (may run in parallel within the project)
- Then `interact` starts (workers as configured)
- Then `delete` runs last

Global setup / teardown can provision and clean once, but setup is one process unless you parallelize it yourself. Workers still do **not** let you pin “feature X → worker Y”; they pull from Playwright’s queue (`fullyParallel` = scenario-level; off = file-level).

### Why shared create/interact/delete fails here

Acceptance data is seeded into **`localStorage` / `__ARCANUM_E2E__` per browser context** (`seedE2EData`). Contexts are not a shared database.

| Pattern | Verdict |
|---|---|
| Per-scenario seed + interact + cleanup in the same scenario / hooks | **Preferred** — stable with `fullyParallel` |
| Project phases with **independent** entities (unique IDs), each later owned by one scenario/context | Possible only if each interact still loads **its** seed into **its** context (phases don’t share storage for free) |
| Create **once**, many workers mutate the **same** data, delete-all at end | **Rejected** — races, crossed assertions, flaky deletes |
| Delete-everything while interact still running | **Rejected** — phases must finish interact before delete |

### Chosen approach (implement this)

- [x] **Decision recorded:** keep **per-scenario (or per-feature) isolation** as the speed/stability strategy
- [ ] Document in acceptance-test skill / learnings: do not redesign Gherkin around suite-wide shared worlds
- [ ] When several scenarios truly must share one graph, use `test.describe.configure({ mode: 'serial' })` for that group only — not suite-wide shared data
- [ ] Parallelize by raising workers/shards on **isolated** scenarios (Phase C), not by sharing fixtures across workers

### Revisit only if architecture changes

Phased create → interact → delete becomes attractive **after** a shared backend (or equivalent) where:

- Creates insert unique rows via API
- Interact tests reference those IDs without sharing browser `localStorage`
- Delete project cleans by ID after all interact projects complete

Until then, treat suite-wide shared create/delete as **out of scope**.

---

## Phase C — CI speed (after Phase B)

Apply only once Phase B isolation holds. Current config: `workers: process.env.CI ? 1 : undefined`, `retries: CI ? 1 : 0`, Chromium-only.

### C1. Cache Playwright browsers

In `.github/workflows/ci.yml` and `acceptance-tests.yml`:

- [ ] Cache Playwright browser install (e.g. `actions/cache` on Playwright’s cache path + version key, or the official Playwright GitHub Action cache pattern)
- [ ] Keep `npx playwright install chromium --with-deps` but make it a no-op when cache hits

### C2. Safe parallelization ladder

Do **not** jump to max cores.

1. [ ] Prove local full suite green with default workers and `retries: 0`
2. [ ] CI: raise `workers` from `1` → `2` only; monitor flake rate for several PRs
3. [ ] If green: add Playwright sharding (`--shard=1/N` …) across matrix jobs for acceptance
4. [ ] Optionally overlap `acceptance` with parts of `quality` only if install/cache cost justifies it (today acceptance `needs: quality` — keep a cheap gate if flakes are still possible)

### C3. Reporting

- [ ] Keep HTML report upload on failure/always
- [ ] Prefer `list` (or `line`) in CI logs for faster feedback; keep HTML artifact for diagnosis
- [ ] Do **not** increase `retries` beyond current CI `1` as a speed/stability strategy

**Exit criteria:** CI acceptance wall-clock reduced; flake rate not worse than baseline; `workers ≥ 2` only with evidence.

---

## Phase D — Guardrails & docs

- [ ] Update acceptance-test skill “Commands” to lead with warm-server + single-feature + tag filter
- [ ] Note in `learnings/feature-tests.md` (short entry): sleeps → conditions; long audio only for timing scenarios; CI workers ladder; reject suite-wide shared create/interact/delete on `localStorage`
- [ ] Optional: lightweight script or CI comment that fails if new `waitForTimeout` is introduced (grep check) — only if the team wants a hard guard

**Out of scope / do not do:**

- Multi-project browsers (Firefox/WebKit) for speed
- Raising retries to mask races
- Dropping `fullyParallel` without measuring
- Weakening Gherkin coverage to make CI green faster
- Suite-wide shared `localStorage` world: parallel create → max-parallel interact → deferred delete
- Custom “assign feature file to worker N” scheduling (Playwright does not support this)

---

## Suggested implementation order

| Step | Work | Risk |
|---|---|---|
| 1 | Phase A scripts + skill docs | Low |
| 2 | Phase B1 remove sleeps (file by file) | Medium — re-run owning features |
| 3 | Phase B2 trim long audio misuse | Medium — audio timing scenarios only |
| 4 | Phase B3 isolation audit under local parallel | Medium |
| 5 | Document orchestration decision (per-scenario seed; no shared create/delete pipeline) | Low |
| 6 | Phase C1 browser cache | Low |
| 7 | Phase C2 workers=2, then shards | Medium–high — watch flakes |
| 8 | Phase D learnings / optional lint | Low |

---

## Verification checklist

- [ ] `npm run test` stays the fast default for logic changes
- [ ] Single-feature acceptance path documented and scripted
- [ ] `rg waitForTimeout e2e` is empty (or remaining uses documented)
- [ ] Full acceptance suite green locally with `retries: 0`
- [ ] CI still Chromium-only; retries unchanged or lower
- [ ] After workers/shards: compare wall-clock and flake rate to pre-change baseline
- [ ] No suite depends on shared cross-worker `localStorage`; new features follow per-scenario seed
- [ ] Any intentional shared graph is confined to a `serial` describe (documented why)

---

## Reference (current repo facts)

- Unit: Vitest via `vite.config.ts` (`jsdom`, `src/**/*.{test,spec}.{ts,tsx}`)
- Acceptance: `playwright-bdd` → `.features-gen`, config in `playwright.config.ts`
- Data seeding: `e2e/steps/shared/test-data.ts` → `seedE2EData` / `localStorage` + `__ARCANUM_E2E__` (per browser context)
- CI acceptance: `.github/workflows/ci.yml` job `acceptance` (`workers: 1` in CI)
- Manual slice runs: `.github/workflows/acceptance-tests.yml` (`cucumber_tags` / `cucumber_features`)
- Existing focused helper: `ai/skills/author-acceptance-tests/scripts/run_acceptance_tests.ps1`
- Parallelism knobs: `fullyParallel` / `workers` / `--shard` / path+tag filters — not feature→worker pinning
