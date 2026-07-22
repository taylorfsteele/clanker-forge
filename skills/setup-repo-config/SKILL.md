---
name: setup-repo-config
description: Configure a repo for the engineering skills without committing anything to it — scaffold its issue tracker, triage label vocabulary, and domain doc layout in the external config home (~/.agents/repo-config). Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Repo Config

Scaffold the per-repo configuration that the engineering skills assume, in the **external
config home** — `~/.agents/repo-config/<slug>/` — so nothing needs committing to the target
repo:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## The config home

The slug is derived from `git remote get-url origin`: `<owner>--<repo>`
(e.g. `git@github.com:colonylabs/colony.git` → `colonylabs--colony`). A repo without a remote
uses its directory name.

The engineering skill forks resolve each config file as `~/.agents/repo-config/<slug>/<file>`
first, then the repo's committed `docs/agents/<file>`. This skill only ever writes to the
external home — never to the repo, and never to the repo's `AGENTS.md`/`CLAUDE.md`.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` — derive the slug; is this a GitHub repo? Which one?
- `~/.agents/repo-config/<slug>/` — does this skill's prior output already exist? Is `~/.agents/repo-config` a symlink into a toolkit repo (matters for step 5)?
- `docs/agents/` in the repo — committed config from the upstream setup skill; the external home overrides it, so flag any overlap to the user
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- Committed doc conventions that would conflict with skill-written files (spec systems, constitutions, ADR tooling) — a sign the domain-docs **write** location should be the external home, not the repo
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.) This decides whether Section B runs at all.
- Monorepo signals — a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order — one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A — Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, and `to-spec` read from and write to it — they need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub** — issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `~/.agents/repo-config/<slug>/issue-tracker.md`. The GitHub and GitLab templates carry a "PRs as a request surface" flag, defaulted **off** — leave it off and don't raise it; a user who wants external PRs in the triage queue can flip the flag in the file later.

**Section B — Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you) — an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no — usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`) — collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section C — Domain docs.** Two decisions: layout, and **write location**.

Layout: default to **single-context** — one `CONTEXT.md` + `docs/adr/`. This fits almost every repo; write it without asking. Offer **multi-context** — a `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files — only when exploration found monorepo signals. Then confirm which layout they want.

Write location: default to the **repo root** (the upstream convention). Recommend the **external home** (`~/.agents/repo-config/<slug>/domain/`) instead when exploration found conflicting committed doc conventions, or when the user can't commit skill-generated files to this repo. In that case `domain.md` must say so explicitly: skills never create `CONTEXT.md`/`CONTEXT-MAP.md`/ADRs in the repo, the glossary lives at `<slug>/domain/CONTEXT.md`, ADRs at `<slug>/domain/adr/`, and the repo's own committed docs are listed as read-only sources.

### 3. Confirm and edit

Show the user a draft of the contents of `issue-tracker.md`, `domain.md`, and `triage-labels.md` (the last only when `triage` is installed).

Let them edit before writing.

### 4. Write

Write the files into `~/.agents/repo-config/<slug>/`, using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown issue tracker
- [triage-labels.md](./triage-labels.md) — label mapping (only if `triage` is installed)
- [domain.md](./domain.md) — domain doc consumer rules + layout

For "other" issue trackers, write `issue-tracker.md` from scratch using the user's description.

Do **not** edit the repo's `AGENTS.md` or `CLAUDE.md`, and do not create anything under the repo's `docs/agents/` — the skill forks find the config through the resolution order, no in-repo pointer needed.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. If `~/.agents/repo-config` is a symlink into a toolkit repo (e.g. clanker-forge), remind them to commit the new `<slug>/` directory there. Mention they can edit the files directly later — re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
