---
description: A workflow for planning a new feature or increment, starting from requirements to finalized designs and feature specs.
---

# Feature Planning Workflow

This workflow ensures that every new feature is thoroughly designed, documented, and reviewed before a single line of production code is written.

## Phase 1: Strategic Discovery (run in parallel)
- **Product Owner (`@product-owner`)** and **Principal Product Owner (`@principal-po`)** run simultaneously:
  - `@product-owner`: Defines high-level business goals and drafts primary behavior examples with the `@qa-tester`.
  - `@principal-po`: Reviews strategic alignment and outcome focus (per *Inspired*, *Build Trap*, etc.).

## Phase 2: Design & UI Translation
- **Product Designer (UX) (@product-designer):**
    - Translates PO goals into **`[scene]-design.md`** files (new for new scenes, updated for existing ones).
    - Builds or updates **HTML prototypes** in `docs/designs/`.
    - Ensures each "Scene" in the **`[scene]-design.md`** points to its corresponding HTML file.
    - Defines empty, loading, success, and error states in the design specs.

## Phase 3: Behavioral Specification
- **QA Tester (`@qa-tester`)** goes first:
    - Translates the Designer's specs into Gherkin `.feature` files with concrete examples.
    - Places feature files in `app/src/androidTest/assets/features/`.
- **Once the `.feature` file exists, run in parallel:**
  - **QA Reviewer (`@qa-reviewer`)**: Peer review of the new `.feature` files for project standards and coverage.
  - **Principal QA (`@principal-qa`)**: Reviews `.feature` files for ambiguity; asks the human clarifying questions in `/feedback/feature [name].md`.

## Phase 4: Implementation Strategy
- **Android Developer (`@android-developer`)** drafts first:
    - Drafts an extensive implementation plan summary in `/plans/summary.md`.
    - Creates detailed iteration plans in `/plans/iteration-x.md`.
    - **Links and References:** All plans MUST reference the relevant `.feature` files, Scenes (pointing to HTML), and `.html` prototypes.
- **Once the draft plan exists, run in parallel:**
  - **Audio Specialist (`@audio-specialist`)** *(if applicable)*: Provides specific audio strategy recommendations to be included in the implementation plan.
  - **Android Reviewer (`@android-reviewer`)**: "Dev Review" of the drafted implementation strategy for technical feasibility and adherence to project architecture.
- **If Gradle or CI issues block plan validation**, invoke **DevOps Engineer (`@devops-engineer`)**.

## Phase 5: Implementation Strategy Review (run in parallel)
All three Principal agents run simultaneously after Phase 4 is complete:
- **Principal Engineer (`@principal-engineer`)**: Reviews the technical strategy; asks the human 2–3-option questions in `/feedback/iteration [x].md`.
- **Principal Product Owner (`@principal-po`)**: Reviews plans for business/market viability; asks questions in `/feedback/request [name].md` or `/feedback/feature [name].md`.
- **Principal QA (`@principal-qa`)**: Audits the implementation plan for testability and behavior coverage.

## Phase 6: Human Feedback Loop
- **Trigger:** Human selects an option (ticks a checkbox) in the `/feedback/` directory.
- **The Team:**
    - ALL agents must check the relevant `/feedback/` files for human decisions.

## Phase 7: Post-Review Fixes
- **Android Developer (@android-developer) & Audio Specialist (@audio-specialist):**
    - Address all technical and strategic feedback from the Principal personas and the Human user.
    - Update `/plans/summary.md` and `/plans/iteration-x.md` to reflect the final, agreed-upon strategy.

## Phase 8: Final Review & Baseline
- **Project Historian (@project-historian):**
    - Finalizes the baseline documentation in `plans/summary.md` and updates `README.md`.
    - Captures the strategic rationale for the chosen path.
