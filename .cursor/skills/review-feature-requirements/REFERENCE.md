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
- If a scenario references a screen, what happens with zero soundscapes, zero FX, or partial data?
- Are destructive or irreversible actions (delete, global stop, session lock) specified clearly?
- Is navigation consistent with route and layout conventions in `docs/designs/home-design.md`?
- Are disabled controls explained — condition and recovery?
- Are timing-sensitive interactions (fades, crossfades) defined enough for consistent UX?

**Gap signals:** `When` without observable `Then`; success-only paths; controls named in one scenario but undefined elsewhere.

## Audio semantics (`@audio-specialist`)

Principles: Web Audio API, perceptual mixing, low-latency feedback for live GM use, browser autoplay policy.

- Are perceptual outcomes stated in testable terms? ("smoothly", "seamlessly", "no dip")
- What happens when the tab loses focus or `AudioContext` is suspended during crossfade or FX?
- Concurrent triggers, overlapping loops, mid-FX scene switches?
- Bluetooth / system mute / browser autoplay block behaviors aligned with system audio scenarios?
- Are fade/duck durations requirements or implementation defaults?
- Missing or corrupt asset behavior specified?

**Gap signals:** playback without pause/resume policy; intensity changes during ducking; master stop during crossfade.

## Behavioral completeness (`@principal-qa`)

Principles: *Specification by Example* (Adzic), *Explore It!* (Hendrickson).

- What rules are implied but not exemplified? (Invert each `Then`.)
- Do `Background` steps hide preconditions readers need in individual scenarios?
- Do multiple scenarios repeat the same rule with only different entity names?
- Could scenarios consolidate into a `Scenario Outline` with an `Examples` table?
- Do scenarios depend on another feature file without cross-referencing it?
- Are negative paths as concrete as positive paths?

**Simplification signals:** parallel scenarios differing only by nouns; cosmetic UI state split from behavioral scenario; duplicate `Given` chains.
