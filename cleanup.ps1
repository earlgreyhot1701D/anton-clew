# Cleanup script for anton-clew repository
# Removes bloat: node_modules, dist, .git, IDE files, test artifacts
# Use before creating submission zip

param(
    [switch]$Full = $false,      # If set, also removes .git and package-lock.json
    [switch]$CreateZip = $false, # If set, creates submission zip after cleanup
    [switch]$Dry = $false        # If set, shows what would be deleted without deleting
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "🧹 Anton-Clew Repository Cleanup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($Dry) {
    Write-Host "⚠️  DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

# Define cleanup tasks
$cleanupTasks = @(
    @{ Name = "Build output"; Path = "dist"; Size = "~200KB"; Always = $true },
    @{ Name = "Node dependencies"; Path = "node_modules"; Size = "~500MB+"; Always = $true },
    @{ Name = "IDE - VS Code"; Path = ".vscode"; Size = "~50KB"; Always = $true },
    @{ Name = "IDE - JetBrains"; Path = ".idea"; Size = "~50KB"; Always = $true },
    @{ Name = "Test artifacts"; Path = ".test-*"; Size = "~varies"; Always = $true },
    @{ Name = "Test coverage"; Path = "coverage"; Size = "~1-10MB"; Always = $true },
    @{ Name = "NYC output"; Path = ".nyc_output"; Size = "~varies"; Always = $true },
    @{ Name = "Git metadata"; Path = ".git"; Size = "~10-50MB"; Always = ($Full) },
    @{ Name = "Lock file"; Path = "package-lock.json"; Size = "~150KB"; Always = ($Full) }
)

# Perform cleanup
$deletedCount = 0
$skippedCount = 0
$totalSize = 0

foreach ($task in $cleanupTasks) {
    if (-not $task.Always) { continue }
    
    $itemExists = Test-Path -Path $task.Path
    
    if ($itemExists) {
        $status = if ($Dry) { "WOULD DELETE" } else { "Deleting" }
        Write-Host "  $status: $($task.Name)" -ForegroundColor Yellow
        Write-Host "         Path: $($task.Path)" -ForegroundColor Gray
        Write-Host "         Est. Size: $($task.Size)" -ForegroundColor Gray
        
        if (-not $Dry) {
            try {
                Remove-Item -Path $task.Path -Recurse -Force
                Write-Host "         ✓ Success" -ForegroundColor Green
                $deletedCount++
            } catch {
                Write-Host "         ✗ Failed: $_" -ForegroundColor Red
            }
        } else {
            $deletedCount++
        }
    } else {
        Write-Host "  ⊘ Skipped: $($task.Name) (not found)" -ForegroundColor Gray
        $skippedCount++
    }
}

Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "  Items processed: $deletedCount"
Write-Host "  Items not found: $skippedCount"
Write-Host ""

# Show what's left
Write-Host "📋 Remaining files (should match submission contents):" -ForegroundColor Cyan
Get-ChildItem -Path . -Force | Where-Object { 
    $_.Name -notmatch '^\.' -or $_.Name -in @('.gitignore', '.editorconfig', '.agentpolicy.yaml') 
} | ForEach-Object {
    $type = if ($_.PSIsContainer) { "[DIR]" } else { "[FILE]" }
    Write-Host "   $type  $($_.Name)" -ForegroundColor Green
}

Write-Host ""

# Create zip if requested
if ($CreateZip) {
    Write-Host "📦 Creating submission zip..." -ForegroundColor Cyan
    $zipName = "anton-clew-submission.zip"
    
    try {
        # Exclude patterns that should not be in zip
        $excludePatterns = @('.git/*', 'node_modules/*', 'dist/*', '.vscode/*', '.idea/*', 'coverage/*', '*.log')
        
        Compress-Archive -Path . -DestinationPath $zipName -Force -Exclude $excludePatterns
        
        $zipSize = (Get-Item $zipName).Length / 1MB
        Write-Host "✓ Created $zipName" -ForegroundColor Green
        Write-Host "  Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to create zip: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✨ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm install          # Restore dependencies"
Write-Host "  2. npm run build        # Rebuild TypeScript"
Write-Host "  3. npm run dev -- --help  # Verify CLI works"
Write-Host ""
