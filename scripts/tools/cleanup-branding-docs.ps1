<#
    cleanup-branding-docs.ps1
    ---------------------------------------
    Applies unified JustineLonglaT-Lane branding
    across all documentation files.

    SAFE:
    - Skips binary files (images, fonts, PDFs)
    - Only rewrites text files (html, md, css, js, txt)
#>

Write-Host "🔧 Starting docs branding cleanup..." -ForegroundColor Cyan

# ---------------------------------------
# 1) Define replacements
# ---------------------------------------
$replacements = @{
    "JustineLonglaT-Lane Solutions"        = "JustineLonglaT-Lane Consulting"
    "JustineLonglaT-Lane Solution"         = "JustineLonglaT-Lane Consulting"
    "JustineLonglaT-Lane"                  = "JustineLonglaT-Lane"
    "blogs.justinelonglat-lane.com"        = "blogs.justinelonglat-lane.com"
    "docs.justinelonglat-lane.com"         = "docs.justinelonglat-lane.com"
    "projects.justinelonglat-lane.com"     = "consulting.justinelonglat-lane.com"
}

# ---------------------------------------
# 2) File types to modify
# ---------------------------------------
$textExtensions = @(".html", ".md", ".css", ".js", ".txt", ".json", ".xml")

# ---------------------------------------
# 3) Gather candidate files
# ---------------------------------------
$files = Get-ChildItem -Recurse -File |
    Where-Object { $textExtensions -contains $_.Extension.ToLower() }

Write-Host "📄 Scanning $($files.Count) text files..." -ForegroundColor DarkCyan

$changedFiles = @()

foreach ($file in $files) {
    try {
        $original = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
    }
    catch {
        Write-Host "⚠️  Skipping unreadable file: $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    if ([string]::IsNullOrWhiteSpace($original)) {
        Write-Host "⚠️  Skipping empty/non-text file: $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    $updated = $original

    foreach ($key in $replacements.Keys) {
        $updated = $updated.Replace($key, $replacements[$key])
    }

    if ($updated -ne $original) {
        $updated | Set-Content -LiteralPath $file.FullName -Encoding UTF8
        $changedFiles += $file.FullName
    }
}

# ---------------------------------------
# 4) Summary
# ---------------------------------------
if ($changedFiles.Count -eq 0) {
    Write-Host "✔ No branding changes were needed." -ForegroundColor Green
}
else {
    Write-Host "✔ Updated $($changedFiles.Count) file(s):" -ForegroundColor Green
    $changedFiles | ForEach-Object { Write-Host "   • $_" }
}

Write-Host "🏁 Branding cleanup complete." -ForegroundColor Cyan

