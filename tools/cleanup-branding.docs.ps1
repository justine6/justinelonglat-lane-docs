[CmdletBinding()]
param(
  [string]$Root = "."
)

Write-Host "📘 Docs branding cleanup starting..." -ForegroundColor Cyan

# Map of old → new branding strings (longer/more specific first)
$replacements = [ordered]@{
  "JustineLonglaT-Lane Docs"                     = "JustineLonglaT-Lane Docs"
  "JustineLonglaT-Lane Consulting"                = "JustineLonglaT-Lane Consulting"
  "https://justinelonglat-lane.com"          = "https://justinelonglat-lane.com"
  "https://justinelonglat-lane.com"             = "https://justinelonglat-lane.com"
  "justinelonglat-lane-docs.vercel.app"         = "justinelonglat-lane-docs.vercel.app"
  "blogs.justinelonglat-lane.com"               = "blogs.justinelonglat-lane.com"
  "consulting.justinelonglat-lane.com"            = "consulting.justinelonglat-lane.com"
  "docs.justinelonglat-lane.com"                = "docs.justinelonglat-lane.com"
  # Plain brand last so we don’t break phrases above
  "justinelonglat-lane"                          = "justinelonglat-lane"
}

# Text file extensions we care about
$textExtensions = @(
  ".html", ".htm",
  ".md",
  ".css",
  ".ps1", ".psm1",
  ".js",
  ".json",
  ".xml",
  ".txt",
  ".yml", ".yaml"
)

# Collect candidate files
$files = Get-ChildItem -Path $Root -Recurse -File |
  Where-Object { $textExtensions -contains $_.Extension.ToLowerInvariant() }

if (-not $files) {
  Write-Host "No candidate text files found under $Root – nothing to do." -ForegroundColor Yellow
  return
}

$changedFiles = @()

foreach ($file in $files) {
  try {
    $original = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  }
  catch {
    Write-Host "⚠️  Skipping unreadable file: $($file.FullName)" -ForegroundColor Yellow
    continue
  }

  if ([string]::IsNullOrWhiteSpace($original)) {
    Write-Host "⚠️  Skipping empty/non-text file: $($file.FullName)" -ForegroundColor DarkYellow
    continue
  }

  $updated = $original

  foreach ($key in $replacements.Keys) {
    $value = $replacements[$key]
    if ($null -ne $value -and $updated.Contains($key)) {
      $updated = $updated.Replace($key, $value)
    }
  }

  if ($updated -ne $original) {
    $updated | Set-Content -LiteralPath $file.FullName -Encoding UTF8
    $changedFiles += $file.FullName
    Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
  }
}

if ($changedFiles.Count -eq 0) {
  Write-Host "ℹ️  No branding strings found to update." -ForegroundColor Yellow
} else {
  Write-Host ""
  Write-Host "🎉 Cleanup completed!" -ForegroundColor Cyan
  Write-Host "Files changed: $($changedFiles.Count)" -ForegroundColor Cyan
}

