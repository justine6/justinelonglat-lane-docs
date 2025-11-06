<#
.SYNOPSIS
  Generate sitemap.xml and robots.txt for a static site.

.PARAMETER BaseUrl
  The canonical site origin, e.g. https://jutellane-docs.vercel.app or https://docs.jutellane.com

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Generate-Sitemap.ps1 -BaseUrl "https://jutellane-docs.vercel.app"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  # Optional: file patterns to include (HTML pages)
  [string[]]$Include = @("*.html"),

  # Optional: names/paths to exclude (relative matches)
  [string[]]$Exclude = @(
    "404.html",
    "sitemap.html", "sitemap.xml",
    "robots.txt",
    "_partials", "templates",
    ".vercel", ".github"
  ),

  # Optional: changefreq for non-root pages
  [ValidateSet("always","hourly","daily","weekly","monthly","yearly","never")]
  [string]$ChangeFreq = "weekly",

  # Optional: priority for non-root pages
  [ValidateRange(0.0,1.0)]
  [double]$Priority = 0.7
)

$ErrorActionPreference = 'Stop'

function Say($msg) { Write-Host "› $msg" -ForegroundColor Cyan }
function Good($msg){ Write-Host "✓ $msg" -ForegroundColor Green }
function Bad($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# Normalize base URL (no trailing slash)
if ($BaseUrl.EndsWith('/')) { $BaseUrl = $BaseUrl.TrimEnd('/') }

# Repo root = current directory
$root = Get-Location

# Gather HTML pages
$allHtml = Get-ChildItem -Path $root -Recurse -File -Include $Include

# Exclude anything under excluded directories or matching excluded filenames
$pages = $allHtml | Where-Object {
  $rel = Resolve-Path -LiteralPath $_.FullName -Relative
  # strip leading .\
  if ($rel -like ".\*") { $rel = $rel.Substring(2) }

  $isExcluded = $false
  foreach ($ex in $Exclude) {
    if ($rel -like "$ex" -or
        $rel -like "*\$ex" -or
        $rel -like "$ex\*" -or
        $rel -like "*\$ex\*") {
      $isExcluded = $true; break
    }
  }
  -not $isExcluded
}

if (-not $pages) {
  Bad "No HTML pages found to include."
  exit 1
}

Say "Discovered $($pages.Count) HTML page(s)."

# Build URL entries
$entries = @()

# Always include root "/" (based on index.html at root if present)
$index = $pages | Where-Object {
  $_.Name -ieq "index.html" -and $_.DirectoryName -eq $root.Path
}
if ($index) {
  $entries += [pscustomobject]@{
    loc        = "$BaseUrl/"
    lastmod    = $index.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    changefreq = "weekly"
    priority   = 1.0
  }
}

foreach ($p in $pages) {
  $relPath = Resolve-Path -LiteralPath $p.FullName -Relative
  if ($relPath -like ".\*") { $relPath = $relPath.Substring(2) }

  # Skip root index.html (already added)
  if ($relPath -ieq "index.html") { continue }

  $urlPath = $relPath -replace '\\','/'
  $entries += [pscustomobject]@{
    loc        = "$BaseUrl/$urlPath"
    lastmod    = $p.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    changefreq = $ChangeFreq
    priority   = $Priority
  }
}

# Write sitemap.xml
$sitemapPath = Join-Path $root "sitemap.xml"
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($e in ($entries | Sort-Object loc)) {
  [void]$sb.AppendLine('  <url>')
  [void]$sb.AppendLine("    <loc>$($e.loc)</loc>")
  [void]$sb.AppendLine("    <lastmod>$($e.lastmod)</lastmod>")
  if ($e.changefreq) { [void]$sb.AppendLine("    <changefreq>$($e.changefreq)</changefreq>") }
  if ($e.priority -ne $null) { [void]$sb.AppendLine("    <priority>$([string]::Format('{0:0.0}', $e.priority))</priority>") }
  [void]$sb.AppendLine('  </url>')
}

[void]$sb.AppendLine('</urlset>')
$sb.ToString() | Set-Content -Encoding UTF8 -NoNewline $sitemapPath
Good "Wrote sitemap.xml  → $sitemapPath"

# Write robots.txt
$robotsPath = Join-Path $root "robots.txt"
@"
# robots.txt for $BaseUrl
User-agent: *
Allow: /

Sitemap: $BaseUrl/sitemap.xml
"@ | Set-Content -Encoding UTF8 $robotsPath
Good "Wrote robots.txt → $robotsPath"

Good "Done. Entries: $($entries.Count)."

# Changelog

All notable changes to this project will be documented in this file.  
This project follows [Semantic Versioning](https://semver.org/).

# ---

## [v1.0.0] — 2025-11-05
### Added
# - Deployed on [Vercel](https://jutellane-docs-30wyt8xu8-jutellane.vercel.app)
# - Pages: Home, Getting Started, Tooling Setup, CI/CD Pipelines, Architecture

### Improved
# - Header alignment (brand left, nav right)
# - Sticky translucent header with blur
# - Updated light/dark theme toggle styles

### Fixed
# - CSS cache busting with timestamp versioning
# - Corrected `.vercel/output` static copy pipeline
# - Verified production build in both PowerShell and Bash

### Known Issues
# - Architecture diagrams (`.svg`) may not render due to relative path references.
  Will update to use absolute `/static/diagrams/...` URLs in v1.0.1.

# ---

## [Unreleased]
# - Add build badge and version info footer
# - Add downloadable PDF of docs
# - Add open-graph meta tags and sitemap automation

