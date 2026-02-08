#!/bin/bash
# Setup git hooks for this repository

HOOKS_DIR=".git/hooks"

# Copy pre-commit hook
cp pre-commit-hook.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✓ Git pre-commit hook installed"
echo "  Hooks path: $HOOKS_DIR/pre-commit"
echo "  The hook will run 'clew check --staged' before each commit"
