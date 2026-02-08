# 📋 Quick Reference Card

## Remove Before Submission

```powershell
# Windows PowerShell - Copy & Paste
Remove-Item -Path dist,node_modules,.vscode,.idea,coverage,.test-* -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path *.log,logs -Recurse -Force -ErrorAction SilentlyContinue
```

## Create Submission Zip

```powershell
# Option A: Standard submission (150-400 KB)
Compress-Archive -Path . -DestinationPath submission.zip -Force `
  -Exclude '.git/*','node_modules/*','dist/*','.vscode/*','.idea/*','coverage/*'

# Option B: Minimal submission (150 KB)
Compress-Archive -Path . -DestinationPath submission.zip -Force `
  -Exclude '.git/*','node_modules/*','dist/*','.vscode/*','.idea/*','coverage/*','package-lock.json'

# Check size
(Get-Item submission.zip).Length / 1KB
```

## Verify It Works

```powershell
# Create temp test folder
$tmp = "$env:TEMP\test-submission"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

# Extract and test
Expand-Archive -Path submission.zip -DestinationPath $tmp\anton-clew
cd $tmp\anton-clew
npm install    # ~30 seconds
npm run build  # ~5 seconds
npm test       # ~10 seconds

# Clean up
cd C:\Users\corde\projects\anton-clew
Remove-Item -Path $tmp -Recurse -Force
```

## What to Include/Exclude

✅ **KEEP in zip:**
- `src/` - source code
- `templates/` - templates
- `package.json` - critical
- `tsconfig.json` - critical
- `*.md` - documentation
- `.agentpolicy.yaml` - example
- `*.sh` - setup scripts
- `.gitignore` - important
- `.editorconfig` - optional

❌ **REMOVE from zip:**
- `node_modules/` - 500 MB!
- `.git/` - 10-50 MB
- `dist/` - regeneratable
- `.vscode/`, `.idea/` - IDE-specific
- `coverage/`, `.nyc_output/` - test artifacts
- `*.log`, `logs/` - debug files
- `.test-*` - temp test directories

## Size Expectations

| Item | Size | Ship? |
|------|------|-------|
| Source (src/) | 50 KB | ✅ Yes |
| Config (JSON, YAML) | 10 KB | ✅ Yes |
| Templates | 20 KB | ✅ Yes |
| Docs (.md) | 20-30 KB | ✅ Yes |
| node_modules/ | 500+ MB | ❌ No |
| dist/ | 200 KB | ❌ No |
| .git/ | 10-50 MB | ❌ No |

**Expected submission zip: 150-400 KB**

## Judges' Workflow

```bash
# What judges will do after extracting your zip
unzip submission.zip
cd anton-clew
npm install        # Creates node_modules (~30 sec)
npm run build      # Creates dist/ (~5 sec)
npm test           # Runs tests (~10 sec)
npm run dev -- check --staged  # Tries your CLI
```

This is **normal and expected**. You don't ship node_modules.

## Automated Cleanup Script

```powershell
# Use the provided cleanup.ps1
.\cleanup.ps1                    # Interactive review
.\cleanup.ps1 -Dry              # Dry run (see what would be deleted)
.\cleanup.ps1 -CreateZip        # Auto cleanup + create zip
.\cleanup.ps1 -Full -CreateZip  # Also removes .git and package-lock.json
```

## Most Important Rules

1. ❌ Never ship `node_modules/` (500 MB is red flag)
2. ✅ Always ship `package.json` (judges need this)
3. ❌ Never ship `.git/` (version control not needed)
4. ✅ Always ship `src/` (source code is critical)
5. ✅ Ship `package-lock.json` (ensures reproducibility)
6. ✅ Ship documentation (shows professionalism)

## Size Check Command

```powershell
# Check folder sizes
Get-ChildItem -Force | Sort-Object -Property @{Expression={$_.GetType().Name}},@{Expression={$_.FullName.Length}} | `
  Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"<DIR>"}else{"<FILE>"}}}, `
  @{Name="Size";Expression={if($_.PSIsContainer){"[DIR]"}else{"{0:N0}" -f $_.Length}}}

# Check specific large folders
(Get-ChildItem -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
```

## Final Checklist (5 mins)

- [ ] `npm run build` → ✓ Success
- [ ] `npm test` → ✓ All pass  
- [ ] `npm run dev -- --help` → ✓ Works
- [ ] Delete `node_modules/`
- [ ] Delete `dist/`
- [ ] Delete `.vscode/`, `.idea/`
- [ ] Create submission zip
- [ ] Zip size < 1 MB? (should be 150-400 KB)
- [ ] Extract zip in new folder
- [ ] Run `npm install && npm run build` in extracted folder
- [ ] Verify it works

**Then submit! 🎉**
