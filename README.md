# clanker-forge

My personal toolkit for working with AI coding agents — skills, commands, subagents, rules,
and MCP config, built to be portable across tools.
(Claude Code, Cursor, Codex).

## Two kinds of things live here

| | What | How it ships |
|---|---|---|
| **Skills** (`skills/`) | Self-contained capabilities in `SKILL.md` format | Installed as-is by the cross-agent [`skills`](https://github.com/vercel-labs/skills) CLI — no generation needed |
| **Assets** (`assets/`) | Rules, commands, subagents, MCP config | Authored once, then **generated** into each tool's native format/location by `pnpm sync` |
| **Repo config** (`repo-config/`, git-ignored) | Per-repo config for the forked engineering skills (issue tracker, triage labels, domain docs) | Copied to the shared `~/.agents/repo-config/` home by `pnpm sync --global` (or symlinked by `pnpm link`) — see [repo-config/README.md](repo-config/README.md) |

Skills are already portable (the `skills` CLI installs them into 60+ agents). Everything else
differs per tool, so it's kept in one canonical place and rendered out.

## Installing skills

```bash
npx skills add taylorfsteele/clanker-forge
```

## Syncing assets across tools

```bash
pnpm install

# Preview what would change, for every tool
pnpm sync --dry-run --target all

# Write Claude Code config into ~/.claude
pnpm sync --target claude --global

# Write project-scoped config (AGENTS.md, .cursor/rules, .mcp.json) into a repo
pnpm sync --target cursor --project /path/to/project

# Symlink all skills into ~/.claude/skills for local development
pnpm link
```

`--global` (default) writes to `~/.claude`, `~/.codex`, `~/.cursor`. `--project [DIR]` writes
into a project directory (default: cwd). Run `pnpm sync --help` for all flags.

### What gets generated where

| Asset | Source | Claude Code | Cursor | Codex |
|---|---|---|---|---|
| Global rules (`--global`) | `assets/rules/global.md` | `~/.claude/CLAUDE.md` | UI-only (paste manually) | `~/.codex/AGENTS.md` |
| Project rules (`--project`) | `assets/rules/project.md` | `CLAUDE.md` | `AGENTS.md` + `.cursor/rules/main.mdc` | `AGENTS.md` |
| Slash commands | `assets/commands/*.md` | `.claude/commands/*.md` | `.cursor/commands/*.md` | `~/.codex/prompts/*.md` |
| Subagents | `assets/subagents/*.md` | `.claude/agents/*.md` | `.cursor/agents/*.md` | `.codex/agents/*.toml` |
| MCP servers | `assets/mcp/servers.json` | `mcpServers` (`.mcp.json` / `~/.claude.json`) | `.cursor/mcp.json` | `~/.codex/clanker-forge.mcp.toml` snippet |
| Per-repo skill config (`--global`) | `repo-config/<slug>/` | `~/.agents/repo-config/<slug>/` — one shared home, all tools | ← same | ← same |

> Tool conventions change often. Each target lives in `src/targets/<tool>.ts` — that's the one
> place to update when a tool moves its files.

### Model selection (per tool)

Commands and subagents pick a **semantic tier** in frontmatter instead of a tool-specific
model name, since each tool names models differently (Claude: `haiku`/`sonnet`/`opus`; Cursor:
`fast`/`inherit`/model-ID; Codex: `gpt-…` IDs):

```yaml
model: fast   # or: default | powerful
```

Each tier resolves to the right per-tool model in `src/lib/models.ts` (`TIER_MODELS`) — the one
place to edit when a tool renames its models. Any value that isn't a tier (e.g. `inherit` or a
concrete model ID) is passed through unchanged, and a tier that maps to nothing emits no `model`
key (the tool uses its own default).

| Tier | Claude | Cursor | Codex |
|---|---|---|---|
| `fast` | `haiku` | `fast` | `gpt-5.4-mini` |
| `default` | `sonnet` | `inherit` | `gpt-5.4` |
| `powerful` | `opus` | `inherit` | `gpt-5.4` |

## Layout

```
skills/      Portable SKILL.md skills (shipped via the `skills` CLI)
assets/      Canonical source for rules, commands, subagents, MCP config
repo-config/ Per-repo config for the forked engineering skills (see repo-config/README.md)
src/         TypeScript generator (cli.ts, check.ts, targets/, lib/)
bin/         link-skills.sh (symlink skills + repo-config for local dev)
```

## Contributing

1. Add a skill under `skills/<category>/<name>/SKILL.md` (see [skills/README.md](skills/README.md)),
   or an asset under `assets/`.
2. Run `pnpm check` — validates frontmatter and that the generator runs clean.
3. Open a PR.
