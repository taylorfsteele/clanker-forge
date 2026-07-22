#!/usr/bin/env bash
set -euo pipefail

# Symlinks every skill in this repo into ~/.claude/skills so the local Claude CLI
# picks them up without publishing.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/.claude/skills"

# If ~/.claude/skills is itself a symlink into this repo, per-skill links would write
# back into the source tree. Detect and bail rather than polluting the working copy.
if [ -L "$DEST" ]; then
  resolved="$(readlink "$DEST")"
  case "$resolved" in
    "$REPO" | "$REPO"/*)
      echo "error: $DEST is a symlink into this repo ($resolved)." >&2
      echo "Remove it (rm \"$DEST\") and re-run; it will be recreated as a real dir." >&2
      exit 1
      ;;
  esac
fi

mkdir -p "$DEST"

find "$REPO/skills" -name SKILL.md -not -path '*/node_modules/*' -print0 |
  while IFS= read -r -d '' skill_md; do
    src="$(dirname "$skill_md")"
    name="$(basename "$src")"
    target="$DEST/$name"

    if [ -e "$target" ] && [ ! -L "$target" ]; then
      rm -rf "$target"
    fi

    ln -sfn "$src" "$target"
    echo "linked $name -> $src"
  done

# Link the tool-agnostic per-repo config home the forked skills read from.
RC_DEST="$HOME/.agents/repo-config"
if [ -e "$RC_DEST" ] && [ ! -L "$RC_DEST" ]; then
  echo "error: $RC_DEST exists and is not a symlink." >&2
  echo "Move its contents into $REPO/repo-config and remove it, then re-run." >&2
  exit 1
fi
mkdir -p "$HOME/.agents"
ln -sfn "$REPO/repo-config" "$RC_DEST"
echo "linked repo-config -> $REPO/repo-config"
