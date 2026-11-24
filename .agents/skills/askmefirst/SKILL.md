---
name: askmefirst
description: >-
  Use when the user invokes /askmefirst or asks you to clarify requirements before
  implementing. Inspects context read-only and asks 2-5 concise multiple-choice
  questions in pop-up modals via ask_question before making any code edits.
---

# Ask Me First (Clarify Before Implementing)

Always clarify ambiguities, architectural choices, and scope trade-offs with the user **before** modifying source files.

## Rules

1. **No Premature Edits:** Do NOT edit or create application code files until the user has answered your clarifying questions.
2. **Read Context First:** Quickly inspect `spec.md`, `progress.md`, `AGENTS.md`, and any files relevant to the user's request so you never ask questions already answered in the docs.
3. **Use Pop-Up Modal Questions (`ask_question`):**
   - Formulate **2 to 5** focused, high-impact questions covering genuine ambiguities (behavior, UX, data contract, error handling, or scope).
   - Call the `ask_question` tool so the questions appear as interactive pop-up modals.
   - Keep options concise, unnumbered, and put the recommended option first prefixed with `(Recommended)`.
   - Use `is_multi_select: true` only when choices are not mutually exclusive.
4. **Record Decisions:**
   - Once the user responds, append any confirmed architectural or product decisions to the **Decisions Log** table in `progress.md`.
5. **Proceed or Confirm:**
   - Summarize the confirmed plan briefly and begin implementation (or follow the user's requested next step).
