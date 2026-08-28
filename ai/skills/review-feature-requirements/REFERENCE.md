# Review Feature Requirements — Reference

Question banks and worked examples for each review lens.

## Value & scope (`@product-owner`)

Principles: *Escaping the Build Trap* (Perri), *Continuous Discovery Habits* (Torres), *Inspired* (Cagan).

- Who is the primary user moment this feature serves — prep, live session, or post-session?
- Does the `So that` clause match what the scenarios actually guarantee?
- What is the smallest set of scenarios that still delivers the core outcome?
- Are any scenarios ahead of current iteration priority (`@iterN` tags)?
- Does the feature span two problems that belong in separate files or iterations?
- Which scenarios trace to a documented user need vs. an assumed edge case?

**Scope review signals:** behavior duplicated in another feature; hyper-specific policy (e.g. "3 minutes") without stated rationale; scenarios that don't connect to the Feature narrative.

## Experience (`@product-designer`)

Principles: shadcn/ui patterns, progressive disclosure, state-driven design.

- For each user action, are **empty**, **loading**, **success**, and **error** states addressed or explicitly out of scope?
- If a scenario references a screen, what happens with zero items, empty lists, or partial data?
- Are destructive or irreversible actions (delete, batch removal, reset) specified clearly?
- Is navigation consistent with route and layout conventions?
- Are disabled controls explained — condition and recovery?
- Are timing-sensitive interactions (debounce, animations, transitions) defined enough for consistent UX?

**Gap signals:** `When` without observable `Then`; success-only paths; controls named in one scenario but undefined elsewhere.

## Technical feasibility (`@principal-engineer`)

Principles: State consistency, async operations, data integrity, error resilience.

- Are asynchronous interactions and loading boundaries clearly specified?
- What happens when network requests fail, timeout, or return validation errors?
- How are concurrent edits, optimistic updates, or conflict resolutions handled?
- Are offline/cache policies and storage requirements aligned with application constraints?
- Are edge cases (rate limits, payload size limits) addressed?

**Gap signals:** untracked asynchronous operations; missing error recovery flows; ambiguous state persistence policies.

## Behavioral completeness (`@principal-qa`)

Principles: *Specification by Example* (Adzic), *Explore It!* (Hendrickson).

- What rules are implied but not exemplified? (Invert each `Then`.)
- Do `Background` steps hide preconditions readers need in individual scenarios?
- Do multiple scenarios repeat the same rule with only different entity names?
- Could scenarios consolidate into a `Scenario Outline` with an `Examples` table?
- Do scenarios depend on another feature file without cross-referencing it?
- Are negative paths as concrete as positive paths?

**Simplification signals:** parallel scenarios differing only by nouns; cosmetic UI state split from behavioral scenario; duplicate `Given` chains.
