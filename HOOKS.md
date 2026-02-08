# Git Hooks Setup

This project includes a `pre-commit` hook that runs safety checks before allowing commits.

## Installation

### Option 1: Automatic Setup (Recommended)
```bash
bash setup-hooks.sh
```

### Option 2: Manual Setup
```bash
# Copy the hook to git
cp pre-commit-hook.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

## What the Hook Does

The pre-commit hook:
- Runs `npm run dev -- check --staged` to validate staged files
- Blocks commits if the check fails (non-zero exit status)
- Allows commits only when all checks pass

## Bypass (if needed)

To skip the pre-commit hook temporarily:
```bash
git commit --no-verify
```

## Troubleshooting

If the hook isn't running:
1. Verify it exists: `ls -la .git/hooks/pre-commit`
2. Verify it's executable: `chmod +x .git/hooks/pre-commit`
3. Check for shell errors: `bash .git/hooks/pre-commit`
