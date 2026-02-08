# Anton Clew - CLI Submission Guide

> Safety guardrails CLI for AI agents and automation in Git repositories

## 🚀 Quick Start

```bash
npm install
npm run dev -- check --staged
```

## 📦 Project Structure

```
anton-clew/
├── src/                      # TypeScript source code
│   ├── cli.ts               # Main CLI entry point
│   ├── policy.ts            # Policy loader & validator
│   ├── pathEvaluator.ts     # Path evaluation logic
│   ├── check.ts             # Check command implementation
│   └── *.test.ts            # Test suites
├── dist/                    # Compiled JavaScript (generated)
├── templates/               # Example policy templates
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
├── .agentpolicy.yaml        # Example policy file
├── HOOKS.md                 # Git hooks documentation
├── CLEANUP.md               # Cleanup & submission guide
└── *.sh                     # Hook setup scripts
```

## 🔧 Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev -- check --staged
npm run dev -- init
```

### Run Tests
```bash
npm test
```

### Setup Git Hooks
```bash
bash setup-hooks.sh
```

## 📋 What's Included

✅ **Keep for submission:**
- `src/` - Full TypeScript source code
- `templates/` - Policy templates for users
- `package.json` - Project metadata and scripts
- `tsconfig.json` - TypeScript configuration
- Documentation files (*.md)
- `.agentpolicy.yaml` - Example configuration
- `*.sh` - Hook setup scripts

❌ **Remove before submission:**
- `node_modules/` - Installed dependencies (500MB+)
- `dist/` - Compiled output (regeneratable with `npm run build`)
- `.git/` - Version control history (10-50MB)
- `.vscode/`, `.idea/` - IDE-specific settings
- `coverage/`, `*.log` - Build artifacts

## 📦 Create Submission Zip

### PowerShell (Windows)
```powershell
# Automated cleanup and zip creation
.\cleanup.ps1 -CreateZip

# Or manually:
Remove-Item -Path node_modules, dist, .git -Recurse -Force
Compress-Archive -Path . -DestinationPath submission.zip -Exclude '.git/*', 'node_modules/*', 'dist/*'
```

### Bash (Mac/Linux)
```bash
# Run cleanup
bash cleanup.sh --create-zip

# Or manually:
rm -rf node_modules dist .git
zip -r submission.zip . -x 'node_modules/*' 'dist/*' '.git/*'
```

### Expected Sizes
- **Source code only:** ~100-200 KB
- **After npm install:** ~500 MB (judges can do this)
- **Submission zip:** ~150-400 KB (recommended)

## ✅ Verification Checklist

Before submission, verify:

- [ ] `npm run build` completes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run dev -- check --staged` works
- [ ] `npm run dev -- --help` shows CLI help
- [ ] `.gitignore` is properly configured
- [ ] No `node_modules/` in zip
- [ ] No `.git/` folder in zip
- [ ] `package.json` and `tsconfig.json` present
- [ ] `src/` directory included
- [ ] `templates/` directory included

## 🔄 Judges Can Reproduce

After extracting your submission zip, judges can:

```bash
# Extract your submission
unzip submission.zip
cd anton-clew

# Install dependencies
npm install

# Rebuild compiled code
npm run build

# Run CLI
npm run dev -- check --staged
npm run dev -- --help

# Run tests
npm test
```

This takes ~30-60 seconds total and requires only Node.js 18+.

## 📋 Features

### ✨ Policy Validation
- Load `.agentpolicy.yaml` with strict Zod validation
- Support for `deny_paths` and `approval_required_paths`
- Fail-closed with clear error messages

### 🎯 Path Evaluation
- Glob pattern matching with `minimatch`
- Three decision types: ALLOW, DENY, NEEDS_APPROVAL
- Priority-based: DENY > NEEDS_APPROVAL > ALLOW

### 🔒 Pre-commit Hooks
- Automatic checks on staged files
- Blocks commits with policy violations
- Clear feedback messages

### 🧪 Comprehensive Testing
- Unit tests for policy loading
- Path evaluation test coverage
- Edge cases and error scenarios

## 📄 License

This project is a hackathon submission. See HOOKS.md and CLEANUP.md for additional documentation.

---

**Ready to submit?** See [CLEANUP.md](CLEANUP.md) for step-by-step submission instructions.
