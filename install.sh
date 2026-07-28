#!/usr/bin/env bash
# Install the Reel Studio skill into your Claude Code skills directory.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/reel-studio"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

if [ ! -d "$SRC" ]; then
  echo "error: can't find the skill folder at $SRC" >&2
  exit 1
fi

mkdir -p "$DEST"

if [ -e "$DEST/reel-studio" ]; then
  printf "reel-studio already exists at %s/reel-studio — overwrite? [y/N] " "$DEST"
  read -r ans
  case "$ans" in
    y|Y) rm -rf "$DEST/reel-studio" ;;
    *) echo "aborted."; exit 0 ;;
  esac
fi

cp -R "$SRC" "$DEST/reel-studio"
echo "✓ installed to $DEST/reel-studio"
echo "  Restart Claude Code, then ask for a reel or run /reel-studio."
