---
name: post-task-code-audit
description: >-
  Mandatory line-by-line audit of every line of code the agent wrote, run only
  AFTER the task is completely completed — never during implementation, never
  mid-edit, never while work remains. Use at wrap-up of any coding task:
  feature, bugfix, refactor, edit, or new file, immediately before declaring
  the work done. Skip if no code was written. Ensures the code is correct,
  bug-free, well-written, simple, and as short as possible.
---

# Post-Task Code Audit

This skill is mandatory after every coding task.

## When to run

Run **only after** all of these are true:

- The user's request is fully implemented
- No remaining planned edits, TODOs, or follow-up code changes
- You would otherwise now tell the user the work is done

Do **not** run:

- During implementation
- After writing some files but not others
- While still debugging, iterating, or deciding the approach
- On question-only / read-only / planning turns with no code written

If this skill is loaded before the task is finished: complete the user's request first. Do not audit, refactor, or delay implementation. Return here only when the work is completely done.

## Announce before auditing

The instant the audit starts, the first user-visible text must be this exact heading:

```markdown
# AUDIT INITIALIZED
```

Emit it, then keep going in the same turn (read files, audit, fix). Do not wait for the user. Do not save this heading for the final summary. Do not start the audit silently.

## What to audit

Audit **every line** you wrote or changed in this task. Do not audit lines you did not write or change unless a change you made depends on them.

Read the diff of those files. For new or untracked files, read the full file.

## Audit criteria

For every changed line, confirm:

1. **Correct** — does what the user asked; matches existing patterns; no wrong assumptions, off-by-ones, bad types, broken imports, or missed call sites
2. **Bug-free** — handles realistic edge cases (empty, null/undefined, errors, races, stale state); no logic holes, leaked resources, or silent failures
3. **Well-written / simple / as short as possible** — no extra abstractions, duplication, dead code, comments, speculative features, or drive-by refactors
4. **Fits Cartoonie** — still a frontend-only Next.js page; one Canvas 2D film; scroll plays and rewinds it; shared state stays in Zustand; chapters stay local data; no `any`; no library, backend, sound, or hosting added beyond `TECHSTACK.md`

If a line is not needed, remove it. If a simpler form is equivalent, use it.

## Workflow

1. Tell the user `# AUDIT INITIALIZED` (exact text, big heading), then continue in the same turn
2. List every file you created or edited
3. Read the diff of those files; read new/untracked files in full
4. Re-read each touched region in context (callers, types, related state)
5. Go line by line against the criteria above
6. If anything fails: fix it, then re-audit **only the fix**
7. Repeat until the changed code passes
8. Write the final reply to the user

Do not start a new feature, rename, or restyle unrelated code while fixing audit findings.

Do not run project-wide verification commands as part of this audit unless the user already approved them.

## Output

After the audit, keep the report short.

- If you found and fixed issues: say what was wrong and what you changed
- If the audit passed with no edits: do not narrate a long checklist; finish the original task reply normally
