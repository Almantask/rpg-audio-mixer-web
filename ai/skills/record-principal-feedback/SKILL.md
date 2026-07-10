---
name: record-principal-feedback
description: 'Record principal-level human decisions. Use when: principal agents need to ask the human strategic questions with structured options in /feedback/.'
---

# Record Principal Feedback

Shared format for `@principal-engineer`, `@principal-po`, and `@principal-qa` when engaging the human on decisions.

## Rules

1. **Human engagement**: When ambiguity or trade-offs exist, ask the human — do not decide alone.
2. **Structured options**: Provide exactly **2–3 distinct options** per question.
3. **The "Why" quote**: Every question or recommendation MUST be preceded by a critical quote from the principal's foundational library.
4. **Checkbox format**: Use markdown checkboxes so the human can select an option in `/feedback/`.
5. **Do not proceed past human gate** until checkbox decisions exist in `/feedback/`.

## File Locations

| Principal agent | Feedback file |
|-----------------|-----------------|
| `@principal-engineer` | `/feedback/iteration [iteration number].md` |
| `@principal-po` | `/feedback/feature [feature name].md` or `/feedback/request [request name].md` |
| `@principal-qa` | `/feedback/feature [feature name].md` |

Create or append to the appropriate file. Multiple principals may share a feature feedback file — use clear section headings per inquiry.

## Question Template

```markdown
> "[Critical Quote from Book]" — [Author, Book Title]

**[Inquiry Label]:** [Your inquiry]
- [ ] Option A: [Description]
- [ ] Option B: [Description]
- [ ] Option C: [Description]
```

### Inquiry labels by role

| Agent | Label |
|-------|-------|
| `@principal-engineer` | **Technical Inquiry:** |
| `@principal-po` | **Strategic Inquiry:** |
| `@principal-qa` | **Behavioral Inquiry:** |

## After Human Responds

- All agents MUST read `/feedback/` for checkbox selections before finalizing plans or implementation.
- Incorporate the chosen option explicitly in updated plans, specs, or code.

**Git Policy:** Do NOT commit changes. Leave all changes uncommitted for the user to review and commit manually.
