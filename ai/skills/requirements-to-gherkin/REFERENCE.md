# Requirements to Gherkin — Reference

## Human gate

Stop before Phase 1 when the requirements doc or feedback file marks decisions as blocking and those checkboxes are still empty.

1. List open inquiry IDs (e.g. `LIT-00`, `LIT-03`).
2. Do not author or rewrite scenarios that depend on them.
3. Resume only after checkboxes exist, or the user explicitly scopes a fully decided subset.

Unchecked options are never source of truth. Do not invent product answers.

## Precedence

When sources conflict, apply in order:

1. Checked `/feedback/` options
2. Non-negotiable ACs in `docs/requirements/`
3. Peer `.feature` terminology (wording only — not new rules)

## Exclusions

| Do not use as source of truth | Use instead |
|---|---|
| `docs/designs/*-design.md`, HTML prototypes | `design-to-gherkin` |
| `docs/designs/answered-questions-dont-refer/` | Decided feedback / requirements |
| Unchecked `/feedback/` options | Wait for human decisions |

## Mapping examples

**Good — decided slice to focused features**

```text
docs/requirements/library-imported-tracks.md
+ feedback (LIT-00 = browse+trash, LIT-09 = user imports only, …)
→ features/library/browse_imported_tracks.feature
→ features/library/delete_imported_track.feature
```

**Bad — guessing undecided product rules**

```text
# feedback LIT-03 unchecked → inventing "detach on trash" scenarios
→ delete_imported_track.feature with detach+restore rules   ✗ stop at gate
```

**Bad — design as requirements**

```text
docs/designs/audio-library-design.md → rewrite library features
# Wrong skill. Use design-to-gherkin.
```

## Out of scope

- Step definitions, fixtures, Playwright runs (`author-acceptance-tests` after Gherkin exists)
- Design specs / HTML prototypes (`design-to-gherkin`)
- Product coverage audit as primary goal (`review-feature-requirements`)
- Production UI/audio code
