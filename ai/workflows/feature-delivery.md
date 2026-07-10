---
description: An orchestration workflow that sequentially hands a feature specification through the PO, QA, Developer, Code Reviewers, and finally back to the PO for sign-off.
---

# Feature Delivery Workflow

This workflow is designed to simulate an agile development team right here in the IDE.

**Instructions for Antigravity (the AI Assistant):**
Follow these steps in strict sequence. Do NOT skip any steps. If a step involves a command, remember it will require the User's approval.

## Phase 1: Implementation
Both `@qa-tester` and `@android-developer` personas activate and work alongside each other on the given requirements.
- **QA Tester:** Writes the BDD `.feature` file based on requirements and drafts the Espresso step definitions. *Does NOT run tests yet.*
- **Android Developer:** Implements the production code following TDD (Red -> Green -> Refactor) for unit tests, setting up domain, ViewModels, and UI.

## Phase 2: Validation
Once Dev implementation is complete:
- **QA Tester** runs the acceptance test suite: `.\ai\skills\author-acceptance-tests\scripts\run_acceptance_tests.ps1 -FeaturePath "features/[target].feature"`.
- If build or CI infrastructure blocks validation, invoke **DevOps Engineer (`@devops-engineer`)** before returning to implementation fixes.
- If tests fail, hand execution back to **Android Developer** to fix the implementation. Do not proceed until tests are green.

## Phase 3: The Review Council
Once tests pass, the following reviews run in **parallel batches**. All agents within a batch run simultaneously. Each batch must complete before the next begins.

**Batch A — Peer Code Reviews (run in parallel):**
- `@android-reviewer`: Production code — architecture, performance, security, audio quality, deprecations
- `@qa-reviewer`: Test codebase — BDD quality, scenario coverage, step definitions

**Batch B — Principal & Audio Reviews (run in parallel, after Batch A):**
- `@principal-engineer`: Technical architecture and strategy; records 2–3-option questions in `/feedback/iteration [x].md`
- `@principal-qa`: Feature file behavioral clarity and test robustness; records questions in `/feedback/feature [name].md`
- `@audio-specialist`: Media logic, latency traps, ExoPlayer/SoundPool correctness

**⚠ Human Gate:** If any Principal agent raised questions, pause and notify the human. Wait for decisions in `/feedback/` before continuing.

**Batch C — Outcome Sign-off (run in parallel, after human gate):**
- `@product-owner`: Final validation against Acceptance Criteria and strategic outcomes
- `@principal-po`: Strategic outcome and market-fit review; records questions in `/feedback/feature [name].md`

If any batch surfaces blocking issues, move to Phase 4.

## Phase 4: Post-Review Fixes
If any issues were identified during the Review Council (Phase 3):
- **Android Developer** and **QA Tester** collaborate to address the review feedback from ALL reviewers.
- **Human Decisions:** ALL agents must check the `/feedback/` directory for any human decisions made on Principal questions and adjust the implementation accordingly.
- Re-run validation (Phase 2) and obtain final sign-off from the Review Council (Phase 3).

## Phase 5: Project Historian (Documentation)
Once PO sign-off is achieved:
- Activate the `@project-historian` persona.
- The Historian reviews the entire context of what was just built.
- The Historian updates `app/Learnings.md` and any other project documentation (like architectural decisions or new idioms discovered) to preserve institutional memory.