# 1) Make sure you're in the docs repo
cd C:\Users\justi\jutellane-docs   # adjust if your path is different

# 2) Ensure tools folder exists
New-Item -ItemType Directory -Path "./tools" -Force | Out-Null

# 3) Create the cleanup script
Set-Content -LiteralPath "./tools/cleanup-branding.docs.ps1" -Value @'
param(
    [string]$Root = "."
)

Write-Host "📘 Docs branding cleanup starting..." -ForegroundColor Cyan

# ---------------------------------------------
# 1. Files to scan (text only)
# ---------------------------------------------
$patterns = @("*.html", "*.md", "*.css", "*.js")

$files = Get-ChildItem -LiteralPath $Root -Recurse -File -Include $patterns

if (-not $files) {
    Write-Host "No matching files found under $Root. Nothing to do." -ForegroundColor Yellow
    return
}

# ---------------------------------------------
# 2. Replacement map (ordered: specific → generic)
# ---------------------------------------------
$replacements = [ordered]@{
    # Repo names
    "jutellane-docs"  = "justinelonglat-lane-docs"
    "jutellane-blogs" = "justinelonglat-lane-blogs"

    # Domains / URLs (most specific first)
    "https://docs.jutellane.com"          = "https://docs.justinelonglat-lane.com"
    "https://blogs.jutellane.com"         = "https://blogs.justinelonglat-lane.com"
    "https://projects.jutellane.com"      = "https://consulting.justinelonglat-lane.com"
    "https://www.jutellane.com"           = "https://www.justinelon glat-lane.com"
    "https://jutellane.com"               = "https://justinelonglat-lane.com"

    "docs.jutellane.com"                  = "docs.justinelonglat-lane.com"
    "blogs.jutellane.com"                 = "blogs.justinelonglat-lane.com"
    "projects.jutellane.com"              = "consulting.justinelonglat-lane.com"
    "jutellane.com"                       = "justinelonglat-lane.com"

    # Brand strings (longer → shorter)
    "Jutellane Solutions"                 = "JustineLonglaT-Lane Consulting"
    "Jutellane Docs"                      = "JustineLonglaT-Lane Docs"
    "Jutellane"                           = "JustineLonglaT-Lane"
}

# ---------------------------------------------
# 3. Apply replacements
# ---------------------------------------------
$changedFiles = @()

foreach ($file in $files) {
    $original = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue

    if ($null -eq $original) {
        Write-Host "⚠️ Skipping unreadable/empty file: $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    if ([string]::IsNullOrWhiteSpace($original)) {
        Write-Host "⚠️ Skipping empty/non-text file: $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    $updated = $original

    foreach ($key in $replacements.Keys) {
        if ($null -ne $updated -and $updated.Contains($key)) {
            $updated = $updated.Replace($key, $replacements[$key])
        }
    }

    if ($updated -ne $original) {
        $updated | Set-Content -LiteralPath $file.FullName -Encoding UTF8
        $changedFiles += $file.FullName
        Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
    }
}

# ---------------------------------------------
# 4. Summary
# ---------------------------------------------
if ($changedFiles.Count -eq 0) {
    Write-Host "No branding strings found to update." -ForegroundColor Yellow
} else {
    Write-Host "`n✨ Cleanup completed!" -ForegroundColor Cyan
    Write-Host "Files changed: $($changedFiles.Count)" -ForegroundColor Cyan
}
'@
