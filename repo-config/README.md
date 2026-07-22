# repo-config/

Per-repo configuration for the engineering skills (forked from
[mattpocock/skills](https://github.com/mattpocock/skills)), kept **outside** the repos it
configures. This exists for repos where committing skill config (`docs/agents/*.md`,
`CONTEXT.md`, ADRs) isn't welcome — the workflow still works, the target repo stays clean.

Everything here except this README is **git-ignored**: clanker-forge is public, and per-repo
config can reference employer-internal details (tracker conventions, team names, working
notes). Config directories live only on this machine — back them up privately if needed.

## Layout

One directory per repo, keyed by a slug derived from `git remote get-url origin`:
`<owner>--<repo>` (e.g. `git@github.com:acmeinc/acme.git` → `acmeinc--acme`).
Repos without a remote use the repo directory name.

```
repo-config/
└── acmeinc--acme/
    ├── issue-tracker.md    # where issues live + MCP/CLI conventions
    ├── triage-labels.md    # canonical triage roles → actual label strings
    ├── domain.md           # where domain docs live (read + write locations)
    └── domain/             # skill-written glossary + ADRs (created lazily)
        ├── CONTEXT.md
        └── adr/
```

## Resolution order

The forked skills in `skills/` resolve each config file as:

1. `~/.agents/repo-config/<slug>/<file>` — this directory, symlinked by `pnpm link`
2. `docs/agents/<file>` committed in the target repo

So a repo that *does* commit config still works, and this directory wins when both exist.

## Setup

- `pnpm link` symlinks this directory to `~/.agents/repo-config`.
- Run `/setup-repo-config` inside a repo to scaffold a new `<slug>/` directory here.
