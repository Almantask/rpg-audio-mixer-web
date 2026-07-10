---
description: A workflow for refining existing specs, designs, and implementation plans.
---

# Feature Refinement Workflow

This workflow focuses on improving, correcting, or extending existing features through design iterations and plan updates.

## Phase 1: Identifying Refinement Needs
- **Trigger:** UX feedback, bug report, or feature extension request.
- **Product Owner (@product-owner):**
    - Evaluates feedback and re-prioritizes feature value.
    - Defines change goals and behavior updates with the `@qa-tester`.

## Phase 2: Design & UI Update
- **Product Designer (UX) (@product-designer):**
    - Updates **`[scene]-design.md`** and **HTML prototypes** in `docs/designs/`.
    - Ensures all Scenes remain correctly linked to their HTML prototypes.

## Phase 3: Specification Refinement
- **QA Tester (`@qa-tester`)** goes first:
    - Modifies existing `.feature` files to match the refinement.
- **Once the modified `.feature` file exists, run in parallel:**
  - **QA Reviewer (`@qa-reviewer`)**: Peer review of the refined `.feature` files for project standards and coverage integrity.
  - **Principal QA (`@principal-qa`)**: Reviews refined specs for ambiguity and consults with the human user.

## Phase 4: Plan Update
- **Android Developer (`@android-developer`)** updates first:
    - Updates `/plans/summary.md` and the relevant `/plans/iteration-x.md`.
    - Ensures updated plans correctly reference all changed feature files, scenes, and html files.
- **Once the updated plan exists, run in parallel:**
  - **Audio Specialist (`@audio-specialist`)** *(if applicable)*: Updates recommendations in the implementation plan for any audio refinements.
  - **Android Reviewer (`@android-reviewer`)**: "Dev Review" of the refined implementation strategy to catch architectural regressions or complexity early.
- **If Gradle or CI issues block plan validation**, invoke **DevOps Engineer (`@devops-engineer`)**.

## Phase 5: Refined Strategy Review (run in parallel)
All three Principal agents run simultaneously after Phase 4 is complete:
- **Principal Engineer (`@principal-engineer`)**: Audits updated plans; provides 2–3-option questions for new technical trade-offs in `/feedback/iteration [x].md`.
- **Principal Product Owner (`@principal-po`)**: Challenges the refinement for business impact, market fit, and speed-to-market in `/feedback/request [name].md`.
- **Principal QA (`@principal-qa`)**: Reviews the refined plan for testability and behavior coverage.

## Phase 6: Human Feedback Loop
- **Trigger:** Human selects an option in the `/feedback/` directory.
- **The Team:**
    - ALL agents must review the human's choices in the `/feedback/` directory.

## Phase 7: Post-Review Fixes
- **Android Developer (@android-developer) & Audio Specialist (@audio-specialist):**
    - Address all technical and strategic feedback from the Reviewers and the Human user.
    - Update artifacts (designs, feature files, plans) to align with the final decisions.