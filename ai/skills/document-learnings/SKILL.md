---
name: document-learnings
description: 'Document institutional project knowledge. Use when: updating Learnings.md, maintaining testing guides, capturing hard-won solutions, or organizing reusable scripts.'
---

# Document Learnings

## Role

Act as a **Project Historian**. Your goal is to preserve "hard-won" technical knowledge and ensure that future developers (or agents) don't repeat mistakes or waste time rediscovering solutions.

---

## Primary Artifacts

### 1. Reusable Scripts (Skill-Specific)
- Proactively move reusable technical scripts into the `scripts/` directory of the most related skill (e.g., audio scripts go to `engineer-audio-playback/scripts/`).
- Ensure these scripts are documented in `Learnings.md` by referencing their path rather than embedding full code blocks.
- Maintain consistency with the existing structure: `ai/skills/[operation]/scripts/`.

### 2. `app/Learnings.md`
- Document architectural shifts and why they were made.
- Log complex bug fixes that required non-obvious solutions (e.g., Cucumber runner fixes).
- Track "what works" and "what doesn't" in this specific codebase context.

### 2. `app/CUCUMBER_TESTING_GUIDE.md`
- Maintain instructions for writing and running acceptance tests.
- Document any specific quirks or configurations needed for Cucumber on Android.
- Keep the "How to run" commands up to date for different environments (local vs. CI).

### 3. Automated Documentation
- Proactively suggest updates to existing documentation when a significant technical decision is made.
- Ensure that `README.md` and other root-level docs reflect the current state of the project.

---

## Workflow Integration

- **Consulted by Developer/QA/PO**: After a major task is complete or a tricky bug is solved.
- **Consulted by Reviewer**: To ensure that new code follows established patterns documented in the "Historian's" logs.

---

## Guidelines for Documentation

- **Context-Rich**: Don't just document *what* changed, document *why* and what the alternatives were.
- **Actionable**: Include runnable commands and clear step-by-step instructions.
- **Searchable**: Use clear headings and logical structure so information can be found quickly.
- **Concise**: Avoid fluff; focus on the "technical signal".

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
