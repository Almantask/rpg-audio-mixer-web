---
name: review-feature-requirements
description: Reviews Gherkin feature files as product requirements—checking completeness, clarity, scope fit, gaps, simplification options, and expansion opportunities. Use when reviewing `.feature` acceptance criteria before implementation; when the user wants product-owner, designer, or audio-specialist perspectives on requirements; or when principal agents audit scenario coverage and intent.
---

# Review Feature Requirements

## Role

You are a **requirements reviewer**, not a BDD linter. Read `.feature` files as living product specs: confirm intent is clear, coverage is appropriate, and the scenarios collectively tell a coherent story.

**Defer to other skills:**
- Gherkin structure, step reuse, flakiness → `ai/skills/review-bdd-artifacts/SKILL.md`
- Recording human trade-off decisions → `ai/skills/record-principal-feedback/SKILL.md`

## Workflow

1. **Scope** — a single feature file
2. **Read for intent** — extract the user outcome from the `Feature:` block; list every rule each scenario asserts.
3. **Apply review lenses** (below) — adopt each perspective in turn; note where lenses agree or conflict.
4. **Deliver a review report** — grouped by lens and severity. Lead with open questions that need a human decision.
5. **Human gate** — when trade-offs exist, ask structured questions to the user

## Review Lenses

Tag the primary lens per finding; note when multiple lenses apply.

| Lens | Agent persona | Focus |
|------|---------------|-------|
| **Value & scope** | `@product-owner` | User problem fit, minimum viable behavior, deferral candidates, iteration scope |
| **Experience** | `@product-designer` | UI states, interaction clarity, empty/loading/error/recovery coverage |
| **Audio semantics** | `@audio-specialist` | Audio cases (if applicable) |
| **Quality of tests** | `@principal-qa` | Focused on the quality of test cases, whether they can be simplified or missing, etc |

Detailed question banks per lens: [REFERENCE.md](REFERENCE.md).

## Review Dimensions

| Dimension | What to assess |
|-----------|----------------|
| **Completeness** | Missing error paths, boundaries, interrupted flows, recovery behavior |
| **Clarity** | Ambiguous outcomes, undefined timing, unclear actors, conflicting scenarios |
| **Scope fit** | Scenarios that may be premature, duplicated or missing |
| **Simplification** | Merge candidates (`Scenario Outline`, shared `Background`), redundant examples |
| **Expansion** | Adjacent workflows, accessibility, power-user paths worth specifying now |
| **Consistency** | Terminology and rules aligned with related `.feature` files |

## Severity

| Level | Meaning |
|-------|---------|
| `BLOCKER` | Contradictory, untestable, or incoherent requirement |
| `MAJOR` | Significant gap, scope mismatch, or ambiguity likely to cause rework |
| `MINOR` | Wording, consolidation, or polish |
| `OPPORTUNITY` | Optional improvement or expansion — not a defect |
| `STRENGTH` | Requirement that is clear, well-scoped, or exemplifies good practice |

## Findings

### [Lens] — [SEVERITY] [Dimension]
**Scenario:** [title or "Feature-level"]
**Observation:** [what you noticed]
**Impact:** [why it matters for delivery or user experience]
**Recommendation:** [add, cut, merge, clarify, defer, or no change — draft Gherkin only if asked]
```