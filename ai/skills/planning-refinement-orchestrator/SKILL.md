---
name: planning-refinement-orchestrator
description: 'Strategy orchestrator for planning and refinement workflows on the Arcanum Audio web app.'
---

# Planning & Refinement Orchestrator

Move features from request → aligned plans for the **React web app**. Prefer `/plan-feature` and `/refine-feature` skills when invoked via slash command.

Workflows:
- [Planning](../workflows/planning.md)
- [Refinement](../workflows/refinement.md)

## Rules

- No extensive plan without `.feature` files, scene design docs, and HTML prototypes.
- Principal questions go to `/feedback/`; wait for human checkbox decisions.
- Delegate to `@fe-developer`, not legacy mobile roles.

**Git Policy:** Do NOT commit unless the user explicitly asks.
