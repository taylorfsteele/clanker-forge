# clanker-forge

My personal toolkit for working with AI coding agents — skills, commands, subagents, rules,
and MCP config, built to be portable across tools.
(Claude Code, Cursor, Codex).

## Two kinds of things live here

| | What | How it ships |
|---|---|---|
| **Skills** (`skills/`) | Self-contained capabilities in `SKILL.md` format | Installed as-is by the cross-agent [`skills`](https://github.com/vercel-labs/skills) CLI — no generation needed |
| **Assets** (`assets/`) | Rules, commands, subagents, MCP config | Authored once, then **generated** into each tool's native format/location by `pnpm sync` |

Skills are already portable (the `skills` CLI installs them into 60+ agents). Everything else
differs per tool, so it's kept in one canonical place and rendered out. See
[docs/adr/0001](docs/adr/0001-canonical-source-and-generators.md) for the reasoning.

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
| Subagents | `assets/subagents/*.md` | `.claude/agents/*.md` | — | — |
| MCP servers | `assets/mcp/servers.json` | `mcpServers` (`.mcp.json` / `~/.claude.json`) | `.cursor/mcp.json` | `~/.codex/clanker-forge.mcp.toml` snippet |

> Tool conventions change often. Each target lives in `src/targets/<tool>.ts` — that's the one
> place to update when a tool moves its files.

## Layout

```
skills/      Portable SKILL.md skills (shipped via the `skills` CLI)
assets/      Canonical source for rules, commands, subagents, MCP config
src/         TypeScript generator (cli.ts, check.ts, targets/, lib/)
bin/         link-skills.sh (symlink skills into ~/.claude for local dev)
docs/adr/    Architecture decision records
```

## Contributing

1. Add a skill under `skills/<category>/<name>/SKILL.md` (see [skills/README.md](skills/README.md)),
   or an asset under `assets/`.
2. Run `pnpm check` — validates frontmatter and that the generator runs clean.
3. Open a PR.
