#!/bin/bash
set -e

echo "🔍 Running clew checks on staged files..."
npm run dev -- check --staged

if [ $? -eq 0 ]; then
  echo "✓ Checks passed"
else
  echo "✗ Checks failed. Commit blocked."
  exit 1
fi
