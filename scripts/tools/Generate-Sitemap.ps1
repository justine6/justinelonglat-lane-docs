<#
.SYNOPSIS
  Generate sitemap.xml and robots.txt for a static site.

.PARAMETER BaseUrl
  The canonical site origin, e.g. https://docs.justinelonglat-lane.com

.PARAMETER Source
  Directory containing the built HTML site (relative to repo root or absolute).

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\tools\Generate-Sitemap.ps1 `
    -BaseUrl "https://docs.justinelonglat-lane.com" `
    -Source "docs"
#>

[CmdletBinding()]
param(
  # Required: canonical origin
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  # Where to scan for HTML (relative to repo root, or absolute)
  [string]$Source = "docs",

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

function Say($msg)  { Write-Host "› $msg" -ForegroundColor Cyan }
function Good($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Bad($msg)  { Write-Host "✗ $msg" -ForegroundColor Red }

# Normalize base URL (no trailing slash)
if ($BaseUrl.EndsWith('/')) { $BaseUrl = $BaseUrl.TrimEnd('/') }

# Repo root = current directory when script is invoked
$root = Get-Location

# Resolve Source to an absolute folder
if ([System.IO.Path]::IsPathRooted($Source)) {
  $scanRoot = $Source
} else {
  $scanRoot = Join-Path $root $Source
}

if (-not (Test-Path $scanRoot)) {
  Bad "Source path not found: $scanRoot"
  exit 1
}

Say "Scanning for HTML under: $scanRoot"

# Gather HTML pages
$allHtml = Get-ChildItem -Path $scanRoot -Recurse -File -Include $Include

# Exclude anything under excluded directories or matching excluded filenames
$pages = $allHtml | Where-Object {
  $rel = Resolve-Path -LiteralPath $_.FullName -Relative
  if ($rel -like ".\*") { $rel = $rel.Substring(2) }

  $isExcluded = $false
  foreach ($ex in $Exclude) {
    if ($rel -like "$ex" -or
        $rel -like "*\$ex" -or
        $rel -like "$ex\*" -or
        $rel -like "*\$ex\*") {
      $isExcluded = $true
      break
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

# Always include site root "/" if there's an index.html directly under $scanRoot
$index = $pages | Where-Object {
  $_.Name -ieq "index.html" -and $_.DirectoryName -eq $scanRoot
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

  # Skip the root index we already added
  if ($index -and $p.FullName -eq $index.FullName) { continue }

  $urlPath = $relPath -replace '\\','/'

  $entries += [pscustomobject]@{
    loc        = "$BaseUrl/$urlPath"
    lastmod    = $p.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    changefreq = $ChangeFreq
    priority   = $Priority
  }
}

# 👉 IMPORTANT: write outputs at repo root (which is your deployed site root)
$sitemapPath = Join-Path $root "sitemap.xml"
$robotsPath  = Join-Path $root "robots.txt"

# Write sitemap.xml
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($e in ($entries | Sort-Object loc)) {
  [void]$sb.AppendLine('  <url>')
  [void]$sb.AppendLine("    <loc>$($e.loc)</loc>")
  [void]$sb.AppendLine("    <lastmod>$($e.lastmod)</lastmod>")
  if ($e.changefreq) {
    [void]$sb.AppendLine("    <changefreq>$($e.changefreq)</changefreq>")
  }
  if ($e.priority -ne $null) {
    [void]$sb.AppendLine("    <priority>$([string]::Format('{0:0.0}', $e.priority))</priority>")
  }
  [void]$sb.AppendLine('  </url>')
}

[void]$sb.AppendLine('</urlset>')
$sb.ToString() | Set-Content -Encoding UTF8 -NoNewline $sitemapPath
Good "Wrote sitemap.xml  → $sitemapPath"

# Write robots.txt
@"
# robots.txt for $BaseUrl
User-agent: *
Allow: /

Sitemap: $BaseUrl/sitemap.xml
"@ | Set-Content -Encoding UTF8 $robotsPath
Good "Wrote robots.txt → $robotsPath"

Good "Done. Entries: $($entries.Count)."
