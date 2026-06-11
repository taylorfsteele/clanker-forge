# 0001 — Canonical source + generators for cross-tool assets

- **Status:** accepted
- **Date:** 2026-06-10

## Context

This repo serves two goals: share AI-agent assets with co-workers, and let one person move
between Claude Code, Cursor, and Codex without re-authoring config. Those tools disagree on
where things live and in what format:

| Asset | Claude Code | Cursor | Codex |
|---|---|---|---|
| Rules/memory | `CLAUDE.md` | `AGENTS.md` + `.cursor/rules/*.mdc` | `AGENTS.md` |
| Commands | `.claude/commands/*.md` (frontmatter) | `.cursor/commands/*.md` (plain) | `~/.codex/prompts/*.md` (plain) |
| Subagents | `.claude/agents/*.md` | `.cursor/agents/*.md` | — |
| MCP | JSON `mcpServers` | JSON `mcpServers` | TOML `[mcp_servers.*]` |

**Skills are the exception** — the [`vercel-labs/skills`](https://github.com/vercel-labs/skills)
CLI already installs `SKILL.md` files into all of these tools, so skills need no generation
and are distributed as-is.

## Decision

Keep one **canonical source** for non-skill assets in `assets/` and **generate** each tool's
native files with a TypeScript CLI (`pnpm sync`). One module per tool in `src/targets/` so a
new tool is one new file. Generated files are tool-owned and never edited by hand; `.gitignore`
keeps generated copies out of the repo.

## Consequences

- Edit once in `assets/`, run `pnpm sync` — every tool stays in step. `--dry-run` doubles as a
  CI drift check.
- Some asset/tool combinations have no equivalent (Codex subagents); the generator records an
  explicit `skip` with a reason rather than silently dropping them.
- Codex MCP is emitted as a standalone `~/.codex/clanker-forge.mcp.toml` snippet rather than
  rewriting the user's `config.toml`, since we don't ship a full TOML parser/merger.
- Tool conventions change; the per-tool modules are the single place to update when they do.
