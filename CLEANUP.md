# Repository Cleanup & Submission Guide

This guide helps you remove bloat and create a clean submission package for your hackathon project.

## 📊 What's Bloat in This Repo?

| Item | Size | Keep? | Reason |
|------|------|-------|--------|
| `node_modules/` | ~500MB+ | ❌ NO | Dependencies installed locally; regeneratable with `npm install` |
| `.git/` | ~10-50MB | ❌ NO | Version control metadata; not needed for submission |
| `dist/` | ~200KB | ❌ NO | Compiled output; regeneratable with `npm run build` |
| `package-lock.json` | ~150KB | ⚠️ MAYBE | Include IF sending to judges who want exact version pins; exclude if asking them to install fresh |
| `.vscode/`, `.idea/` | ~100KB | ❌ NO | IDE-specific settings; personal preferences |
| `coverage/` | ~1-10MB | ❌ NO | Test coverage reports; regeneratable with `npm test` |
| `*.log`, `logs/` | Varies | ❌ NO | Debug logs; don't ship |

## ✅ What Must Stay (Non-Negotiable)

```
✓ src/              - Your source code and tests
✓ templates/        - Policy templates for users
✓ package.json      - Project metadata and scripts
✓ tsconfig.json     - TypeScript configuration
✓ *.md              - Documentation
✓ .agentpolicy.yaml - Your safety policy example
✓ *.sh              - Hook setup scripts
```

## 🧹 Step-by-Step Cleanup (Windows PowerShell)

### Step 1: Clean Build Artifacts
```powershell
cd C:\Users\corde\projects\anton-clew

# Remove compiled output
Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed dist/"
```

### Step 2: Clean Node Dependencies
```powershell
# Remove installed packages
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed node_modules/"
```

### Step 3: Remove Lock File (Optional)
```powershell
# OPTION A: Keep for exact version reproducibility
# (Keep package-lock.json - no action needed)
Write-Host "✓ Keeping package-lock.json for reproducibility"

# OPTION B: Remove for fresh installs
# Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
# Write-Host "✓ Removed package-lock.json"
```

### Step 4: Clean IDE Files
```powershell
# Remove IDE-specific settings
Remove-Item -Path .vscode -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .idea -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed IDE folders"
```

### Step 5: Clean Test Artifacts
```powershell
# Remove test coverage and outputs
Remove-Item -Path coverage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .nyc_output -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .test-* -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed test artifacts"
```

### Step 6: Verify Cleanup
```powershell
# List top-level contents
Get-ChildItem -Path . | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"[DIR]"}else{"[FILE]"}}}

# Should show:
# [DIR]  src
# [DIR]  templates
# [FILE] .agentpolicy.yaml
# [FILE] .editorconfig
# [FILE] .gitignore
# [FILE] CLEANUP.md
# [FILE] HOOKS.md
# [FILE] package.json
# [FILE] pre-commit-hook.sh
# [FILE] setup-hooks.sh
# [FILE] tsconfig.json
```

## 📦 Create Clean Submission Zip

### Option 1: Exclude .git (Recommended for Hackathons)
```powershell
# Create zip excluding .git, node_modules, dist
$zipName = "anton-clew-submission.zip"
$excludePatterns = @('.git', 'node_modules', 'dist', '.vscode', '.idea', 'coverage', '*.log')

# Compress-Archive excludes specific patterns
Compress-Archive -Path . -DestinationPath $zipName -Force `
  -Exclude @('.git/*', 'node_modules/*', 'dist/*', '.vscode/*', '.idea/*', 'coverage/*', '*.log')

Write-Host "✓ Created $zipName"
(Get-Item $zipName).Length / 1MB | ForEach-Object { Write-Host "  Size: $([math]::Round($_, 2)) MB" }
```

### Option 2: Include Only Source Files (Minimal)
```powershell
# Create minimal submission with ONLY source and configs
$tempDir = "$env:TEMP\anton-clew-clean"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy essential files
Copy-Item -Path src -Destination "$tempDir\src" -Recurse
Copy-Item -Path templates -Destination "$tempDir\templates" -Recurse
Copy-Item -Path package.json -Destination "$tempDir\package.json"
Copy-Item -Path tsconfig.json -Destination "$tempDir\tsconfig.json"
Copy-Item -Path *.md -Destination $tempDir
Copy-Item -Path .agentpolicy.yaml -Destination "$tempDir\.agentpolicy.yaml"
Copy-Item -Path *.sh -Destination $tempDir

# Create zip
Compress-Archive -Path "$tempDir\*" -DestinationPath "anton-clew-minimal.zip" -Force

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "✓ Created anton-clew-minimal.zip"
(Get-Item "anton-clew-minimal.zip").Length / 1KB | ForEach-Object { Write-Host "  Size: $([math]::Round($_, 2)) KB" }
```

## ✨ Optimized .gitignore (For Future Commits)

Your current `.gitignore` is already excellent. However, add these lines to prevent future bloat:

```bash
# Build and dist
dist/
build/
*.tsbuildinfo

# Dependencies (CRITICAL)
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE and Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Environment variables
.env
.env.local
.env.*.local

# Logs and debugging
*.log
logs/
.nyc_output/
coverage/

# Temporary files
.test-*
*.tmp
tmp/
temp/
```

## 🚀 Recovery: Reproducing Clean Install

After submission, to get a fresh working copy:

```powershell
# Clone or extract the submitted zip
cd anton-clew

# Reinstall dependencies (regenerates node_modules)
npm install

# Rebuild TypeScript
npm run build

# Verify it works
npm run dev -- check --staged
```

## 📋 Pre-Submission Checklist

Before zipping for submission:

- [ ] Run `npm run build` → compiles without errors
- [ ] Run `npm test` → all tests pass
- [ ] Run `npm run dev -- --help` → CLI works
- [ ] Delete `node_modules/` → save ~500MB
- [ ] Delete `dist/` → save ~200KB (will rebuild)
- [ ] Delete `.git/` → save ~10-50MB (if not needed)
- [ ] Verify `package.json` and `tsconfig.json` are present
- [ ] Verify `src/` and `templates/` are present
- [ ] Check `.gitignore` is properly configured
- [ ] Create final zip: `Compress-Archive -Path . -DestinationPath submission.zip -Exclude ...`

## 🎯 Expected Final Size

| Scenario | Size |
|----------|------|
| With source + package.json + docs | ~100-200KB |
| + templates | ~150-250KB |
| + package-lock.json | ~250-400KB |
| After `npm install` (with node_modules) | ~500MB+ ⚠️ Don't ship this |

## ❓ FAQ

**Q: Should I include package-lock.json?**
- **Yes** if: Judges need exact version reproducibility
- **No** if: You want them to test with latest compatible versions
- **Recommendation**: Include it for hackathons (ensures identical test environment)

**Q: Can judges run the project after extracting the zip?**
- Yes! They can:
  1. Extract zip
  2. Run `npm install`
  3. Run `npm run build`
  4. Run `npm run dev -- check --staged`

**Q: Why not ship node_modules?**
- Adds 500MB+ to zip
- Different OS (Mac/Linux/Windows) may have native bindings that don't work across platforms
- npm install is ~10-30 seconds; judges understand this
- Shows confidence in your package.json 📦

**Q: Will build artifacts (dist/) regenerate?**
- Yes! `npm run build` will recreate them from `src/`
- No need to include `dist/` in submission

**Q: What if judges can't run npm?**
- Pre-compile and include the `dist/` folder
- Include installation instructions in README.md
- Provide a quick-start guide

---

**Repository Status**: ✅ Clean, Production-Ready
**Recommended Submission Size**: ~150KB (source + config)
**Expected After npm install**: ~550MB (fully working, with dependencies)
