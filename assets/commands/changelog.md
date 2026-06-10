---
description: Summarize staged/working changes into a concise changelog entry
argument-hint: "[version or section heading]"
allowed-tools: Bash(git diff:*), Bash(git status:*)
---

Summarize the current uncommitted changes into a single changelog entry.

1. Run `git status` and `git diff` to see what changed.
2. Group the changes under **Added**, **Changed**, **Fixed**, and **Removed** headings —
   omit any heading with no entries.
3. Write each entry as one user-facing line in the imperative mood (e.g. "Add X", not
   "Added X" or "This adds X").
4. If `$ARGUMENTS` is provided, use it as the section heading; otherwise use today's date.

Keep it tight — this is a changelog, not a commit log. Collapse noise (formatting,
lockfile churn) into a single line or omit it.
