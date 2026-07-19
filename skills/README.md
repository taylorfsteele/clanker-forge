# skills/

Portable [agent skills](https://github.com/vercel-labs/skills). Each skill is a directory
containing a `SKILL.md` file (plus any supporting files it references).

```bash
npx skills add taylorfsteele/clanker-forge
```

## Authoring a skill

Every `SKILL.md` starts with YAML frontmatter:

```markdown
---
name: my-skill
description: One sentence covering WHAT it does and WHEN to use it — this is what the agent matches against to decide whether to trigger.
---

# my-skill

The instructions the agent follows when the skill is invoked...
```

Conventions:

- **`name`** — kebab-case, matches the directory name.
- **`description`** — pack it with trigger phrases ("use when…", "open a PR", etc.). The
  agent only sees the description until the skill fires, so vague descriptions don't trigger.
- Keep skills **small and composable**. One job per skill.
- Reference supporting files by relative path; ship them in the skill's directory.

## Syncing

`pnpm sync` copies every skill directory into each tool's global skill store:

- **Cursor** → `~/.agents/skills/<name>/`
- **Claude Code** → `~/.claude/skills/<name>/`
- **Codex** → skipped (no skills concept)

Skills sync in `--global` mode only. Preview with `pnpm sync --dry-run`, or scope to one tool
with `pnpm sync --target cursor`.

## Local development

`pnpm link` (→ `bin/link-skills.sh`) symlinks every skill into `~/.claude/skills` so you can
test changes against your local Claude Code without publishing. Prefer `pnpm sync` when you
want a plain copy into every tool (including Cursor's `~/.agents/skills`).
