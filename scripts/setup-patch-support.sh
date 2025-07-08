#!/bin/bash

# 1. Ensure Git Initialized and Clean
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

# Stage all existing files and commit a patch baseline
git add .
git commit -m "Initial commit for patchable files" || echo "[Info] Nothing new to commit"

# 2. Standardize Line Endings
echo "* text=auto" > .gitattributes
git add .gitattributes
git commit -m "Add .gitattributes for consistent line endings" || echo "[Info] .gitattributes already tracked"

# Enforce LF line endings on Unix systems
git config --global core.autocrlf input

# 3. Enable Safe Directory Mode (useful for CI, Docker, sandboxes)
REPO_PATH=$(git rev-parse --show-toplevel)
git config --global --add safe.directory "$REPO_PATH"

# 4. Confirm Patch Application Strategy in Backend
# Your backend /api/apply should:
# - Save patch to /tmp/patch.diff
# - Validate: git apply --check /tmp/patch.diff
# - Apply:    git apply --whitespace=fix --unsafe-paths /tmp/patch.diff
# - Handle index SHA lines gracefully (or strip with sed if needed)

echo "[✅] Repo prepared for patch application" 