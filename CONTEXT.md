# CONTEXT

Shared vocabulary for this repo, so docs and skills stay consistent.

- **Skill** — a self-contained capability in `skills/<category>/<name>/SKILL.md`, distributed
  as-is via the `skills` CLI. Portable across agents with no generation step.
- **Asset** — a non-skill thing that differs per tool: rules/memory, commands, subagents, MCP
  config. Authored once in `assets/`, rendered per tool by the generator.
- **Global rules** vs **project rules** — `assets/rules/global.md` is personal user-level rules
  synced in `--global` mode; `assets/rules/project.md` is per-project rules synced in
  `--project` mode.
- **Canonical source** — `assets/`. The one place an asset is edited.
- **Target** — a coding agent we generate for: `claude`, `cursor`, `codex`. One module each in
  `src/targets/`.
- **Generator / sync** — the `pnpm sync` CLI (`src/cli.ts`) that reads `assets/` and writes each
  target's native files.
- **Mode** — `--global` (writes to `~/.claude`, `~/.codex`, `~/.cursor`) vs `--project` (writes
  into a project directory: `.claude/`, `.cursor/`, root `AGENTS.md`/`CLAUDE.md`).

See [docs/adr/0001](docs/adr/0001-canonical-source-and-generators.md) for why the canonical +
generator design was chosen.
