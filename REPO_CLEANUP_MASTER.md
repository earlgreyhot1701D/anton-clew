# 🎯 Repository Bloat Cleanup - Master Guide

## TL;DR (30 seconds)

```powershell
# PowerShell - Windows
.\cleanup.ps1 -CreateZip

npm install && npm run build
npm test
```

Your repo goes from **550+ MB** → **150-400 KB** submission zip. ✅

---

## 📊 What I Found

### Bloat Identified
| Item | Size | Problem |
|------|------|---------|
| `node_modules/` | ~500 MB | Package dependencies (don't ship!) |
| `.git/` | ~10-50 MB | Version control (not needed for judges) |
| `dist/` | ~200 KB | Compiled output (regeneratable) |
| IDE files | ~100 KB | `.vscode/`, `.idea/` (personal settings) |
| Build artifacts | ~10 MB | `coverage/`, `*.log` (temporary) |
| **Total** | **~550 MB** | **This is bloat** |

### Essentials Identified (Keep!)
| Item | Size | Reason |
|------|------|--------|
| `src/` | ~50 KB | Source code (critical) |
| `templates/` | ~20 KB | User-facing templates |
| `package.json` | ~1 KB | Project metadata (critical) |
| `tsconfig.json` | ~1 KB | TypeScript config (critical) |
| `package-lock.json` | ~150 KB | Ensures reproducibility |
| Documentation | ~100 KB | Professionalism |
| **Total** | **~150-200 KB** | **Keep all of this** |

---

## 📋 Detailed Analysis

### ✅ What Should Be Committed to Git (Stay in repo)

```
src/                  # Source TypeScript files
├── cli.ts           # CLI entry point
├── policy.ts        # Policy loader/validator
├── pathEvaluator.ts # Path evaluation logic
├── check.ts         # Check command
└── *.test.ts        # Test files

templates/            # Policy templates for users
package.json         # Project configuration (CRITICAL)
tsconfig.json        # TypeScript config (CRITICAL)
.gitignore          # Already well-configured ✓
.agentpolicy.yaml   # Example policy file
*.md                # Documentation
*.sh                # Setup scripts
```

### ❌ What Should NOT Be Committed (Remove)

```
node_modules/        # Installed packages (500 MB+)
                     # → Install with npm install
                     
dist/                # Compiled JS output (200 KB)
                     # → Regenerate with npm run build
                     
.git/                # Version control metadata (10-50 MB)
                     # → Not needed for judges
                     
.vscode/, .idea/     # IDE-specific settings (100 KB)
                     # → Personal to your machine
                     
coverage/, logs/     # Build/test artifacts
.test-*              # Temporary directories
```

### ⚠️ Optional (Depends on Use Case)

```
package-lock.json    # Lock file
  → Include if: You want exact version reproducibility ✓ RECOMMENDED
  → Exclude if: You want flexible dependency versions
```

---

## 🚀 Step-by-Step Cleanup (Windows PowerShell)

### Method 1: Automated Script (Recommended)

```powershell
# Navigate to repo
cd C:\Users\corde\projects\anton-clew

# Run interactive cleanup
.\cleanup.ps1

# Shows what will be deleted, lets you review
# Creates zip automatically if you choose

# Then verify
npm install
npm run build
npm test
```

### Method 2: Manual Steps

**Step 1: Remove build artifacts**
```powershell
Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed dist/"
```

**Step 2: Remove installed packages**
```powershell
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed node_modules/"
```

**Step 3: Remove IDE settings**
```powershell
Remove-Item -Path .vscode -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .idea -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed IDE folders"
```

**Step 4: Remove test artifacts**
```powershell
Remove-Item -Path coverage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .test-* -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path logs -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed test artifacts"
```

**Step 5: Optional - Remove version control metadata**
```powershell
# Only if submitting without git history
Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Removed .git/"
```

**Step 6: Create submission zip**
```powershell
Compress-Archive -Path . -DestinationPath submission.zip -Force `
  -Exclude '.git/*','node_modules/*','dist/*','.vscode/*','.idea/*','coverage/*'

$size = (Get-Item submission.zip).Length / 1KB
Write-Host "✓ Created submission.zip ($size KB)"
```

---

## 🧪 Verify Judges Can Build Your Project

After cleanup, test that the submission is reproducible:

```powershell
# Create test directory
$testDir = "$env:TEMP\submission-test"
New-Item -ItemType Directory -Path $testDir -Force | Out-Null

# Extract submission
Expand-Archive -Path submission.zip -DestinationPath $testDir

# Navigate and build
cd "$testDir"
npm install    # Recreates node_modules (~30 seconds)
npm run build  # Recreates dist/ (~5 seconds)
npm test       # Runs all tests (~10 seconds)

# If all pass ✓ you're good!
# If all fail ❌ something wrong with package.json
```

This takes ~2-3 minutes but **proves reproducibility**.

---

## 📦 Three Submission Options

### Option A: Minimal (150 KB) - Fastest
```powershell
Compress-Archive -Path . -DestinationPath submission.zip -Force `
  -Exclude '.git/*','node_modules/*','dist/*','.vscode/*','.idea/*','coverage/*','package-lock.json'
```
- **Size:** ~150 KB
- **Judges experience:** Extract → npm install → npm run build
- **Pro:** Smallest file, forces fresh install
- **Con:** Judges might get different versions than you tested

### Option B: Standard (300 KB) - RECOMMENDED ⭐
```powershell
Compress-Archive -Path . -DestinationPath submission.zip -Force `
  -Exclude '.git/*','node_modules/*','dist/*','.vscode/*','.idea/*','coverage/*'
```
- **Size:** ~300-400 KB
- **Judges experience:** Extract → npm install (exact versions) → npm run build
- **Pro:** Exact reproducibility, small file, professional
- **Con:** None!

### Option C: Full (550+ MB) - DON'T DO THIS ❌
```powershell
# Don't do this!
Compress-Archive -Path . -DestinationPath submission.zip -Force
```
- **Size:** ~550 MB
- **Judges experience:** 😡 "Why is this 550 MB?"
- **Shows:** You don't understand package management

**Recommendation: Use Option B (Standard)**

---

## 🎯 What Judges Will See

After you submit and they extract `submission.zip`:

```
submission.zip (300 KB)
  ↓ unzip
anton-clew/
  ├── src/                        ✓ Source code
  ├── templates/                  ✓ Templates
  ├── package.json               ✓ Config (critical)
  ├── package-lock.json          ✓ Reproducibility
  ├── tsconfig.json              ✓ TypeScript config
  ├── .agentpolicy.yaml          ✓ Example
  ├── HOOKS.md, CLEANUP.md, etc   ✓ Docs
  ├── *.sh                        ✓ Setup scripts
  ├── .gitignore                 ✓ Config
  └── dist/, node_modules/       ❌ NOT INCLUDED
      ↓ npm install (30 sec)
anton-clew/
  └── node_modules/              ✓ Auto-created
      ↓ npm run build (5 sec)
anton-clew/
  └── dist/                       ✓ Auto-created
      ↓ npm test (10 sec)
  PASS ✓ All tests pass
```

This is **completely normal** and shows you understand Node.js projects.

---

## ✅ Pre-Submission Checklist

- [ ] Source code verified
  - [ ] `npm run build` → compiles without errors
  - [ ] `npm test` → all tests pass
  - [ ] `npm run dev -- --help` → CLI works

- [ ] Files to keep verified
  - [ ] `src/` directory with all files
  - [ ] `templates/` directory with templates
  - [ ] `package.json` present
  - [ ] `tsconfig.json` present
  - [ ] `*.md` documentation files
  - [ ] `.agentpolicy.yaml` example

- [ ] Bloat removed
  - [ ] `node_modules/` deleted
  - [ ] `dist/` deleted
  - [ ] `.git/` deleted (optional)
  - [ ] `.vscode/`, `.idea/` deleted
  - [ ] `coverage/` deleted
  - [ ] `*.log` deleted

- [ ] Submission package created
  - [ ] ZIP file created successfully
  - [ ] ZIP file < 1 MB (expect 150-400 KB)
  - [ ] Verified by extracting in temp folder
  - [ ] Can run `npm install && npm run build && npm test`

- [ ] Final verification
  - [ ] README/docs explain how to build (judges will check)
  - [ ] package.json is correct (judges will read)
  - [ ] .gitignore is present and correct
  - [ ] No compiled code in package (judges will notice)

---

## 📄 Reference Files Created

I've created these guides in your repo:

| File | Purpose |
|------|---------|
| **BLOAT_ANALYSIS.md** | Complete analysis of what's bloat |
| **CLEANUP.md** | Detailed cleanup instructions |
| **QUICK_REFERENCE.md** | Quick command reference |
| **SUBMISSION.md** | Hackathon submission guide |
| **cleanup.ps1** | Automated cleanup PowerShell script |

**Start with:** `QUICK_REFERENCE.md` (fastest path)  
**Deep dive:** `BLOAT_ANALYSIS.md` (complete analysis)  
**Automated:** `cleanup.ps1` (easiest execution)

---

## 🎓 Why This Matters

For hackathons:

1. **Shows professionalism** - Judges see you understand your tech stack
2. **Easy to test** - They can quickly run your code
3. **Fast to download** - 300 KB vs 550 MB
4. **Reproducible** - Judges get exact same environment as you
5. **Professional standard** - This is how real projects ship

Shipping `node_modules/`:
- ❌ Shows inexperience with Node.js
- ❌ Makes file huge and slow to download
- ❌ Might not work on judges' systems (platform-specific binaries)
- ❌ Wastes everyone's time

---

## 🚀 Final Command

```powershell
# One-liner to clean everything and verify
cd C:\Users\corde\projects\anton-clew; `
.\cleanup.ps1 -CreateZip; `
npm install; `
npm run build; `
npm test; `
"✓ Ready to submit!"
```

**Time required:** ~3-5 minutes  
**Result:** Professional-grade submission  
**Judges' reaction:** 👍 "This is how Node.js projects should be shipped"

---

## 💡 Questions?

- **Q: Will judges think I broke something?**
  - A: No. Seeing empty node_modules and dist is expected.

- **Q: What if judges don't have npm?**
  - A: They will. npm is part of Node.js. If concerned, add a note in README.

- **Q: Should I include .env files?**
  - A: No. Your .gitignore already prevents this. ✓

- **Q: What if there's private data in .git?**
  - A: Remove .git/ entirely (saves space too).

- **Q: Are src/*.test.ts files needed?**
  - A: Yes! Shows you write tests (very professional).

---

**Status:** ✅ **Ready to Clean**  
**Expected Time:** 5 minutes  
**Result Size:** 150-400 KB (down from 550+ MB)  
**Reproducibility:** Perfect ⭐⭐⭐⭐⭐  

**Execute**: `.\cleanup.ps1 -CreateZip`
