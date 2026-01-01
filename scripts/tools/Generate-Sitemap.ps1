<#
.SYNOPSIS
  Generate sitemap.xml and robots.txt for a static site.

.PARAMETER BaseUrl
  The canonical site origin, e.g. https://justinelonglat-lane-docs.vercel.app
  or https://docs.justinelonglat-lane.com

.PARAMETER Source
  Directory containing the built HTML site (relative to current directory or absolute).

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

  # Where to scan for HTML (relative to *current* directory, or absolute)
  [string]$Source = ".",

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
  [string]$ChangeFreq = "weekly",

  # Optional: priority for non-root pages
  [double]$Priority = 0.7
)

$ErrorActionPreference = 'Stop'

function Say($msg)  { Write-Host "› $msg" -ForegroundColor Cyan }
function Good($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Bad($msg)  { Write-Host "✗ $msg" -ForegroundColor Red }

# --- Debug: show what parameters we actually received ---
Write-Host "DEBUG BaseUrl = [$BaseUrl]" -ForegroundColor Yellow
Write-Host "DEBUG Source  = [$Source]"  -ForegroundColor Yellow

# Normalize base URL (no trailing slash)
if ($BaseUrl.EndsWith('/')) { $BaseUrl = $BaseUrl.TrimEnd('/') }

# --------- Resolve Source folder in a very explicit way ---------
try {
    $resolved = Resolve-Path -Path $Source -ErrorAction Stop
    $scanRoot = $resolved.ProviderPath
} catch {
    Bad "Source path not found: $Source"
    exit 1
}

Write-Host "DEBUG scanRoot = [$scanRoot]" -ForegroundColor Yellow
Say "Scanning for HTML under: $scanRoot"

# Gather HTML pages under scanRoot
$allHtml = Get-ChildItem -Path $scanRoot -Recurse -File -Include $Include

# Compute relative path from scanRoot and apply excludes
$pages = $allHtml | ForEach-Object {
    $full = $_.FullName
    $rel  = $full.Substring($scanRoot.Length).TrimStart('\','/')

    $isExcluded = $false
    foreach ($ex in $Exclude) {
        if ($rel -like "$ex" -or
            $rel -like "*\$ex" -or
            $rel -like "$ex\*" -or
            $rel -like "*\$ex\*") {
            $isExcluded = $true; break
        }
    }

    if (-not $isExcluded) {
        [pscustomobject]@{
            File    = $_
            RelPath = $rel
        }
    }
}

if (-not $pages -or $pages.Count -eq 0) {
    Bad "No HTML pages found to include under: $scanRoot"
    exit 1
}

Say "Discovered $($pages.Count) HTML page(s)."

# Build URL entries
$entries = @()

# Root index.html (relative path == 'index.html')
$index = $pages | Where-Object { $_.RelPath -ieq "index.html" }
if ($index) {
    $file = $index.File
    $entries += [pscustomobject]@{
        loc        = "$BaseUrl/"
        lastmod    = $file.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
        changefreq = "weekly"
        priority   = 1.0
    }
}

# All other pages
foreach ($p in $pages) {
    if ($p.RelPath -ieq "index.html") { continue }

    $urlPath = $p.RelPath -replace '\\','/'
    $entries += [pscustomobject]@{
        loc        = "$BaseUrl/$urlPath"
        lastmod    = $p.File.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
        changefreq = $ChangeFreq
        priority   = $Priority
    }
}

# Write sitemap.xml next to scanRoot
$sitemapPath = Join-Path $scanRoot "sitemap.xml"
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
        [void]$sb.AppendLine(
            "    <priority>$([string]::Format('{0:0.0}', $e.priority))</priority>"
        )
    }
    [void]$sb.AppendLine('  </url>')
}

[void]$sb.AppendLine('</urlset>')
$sb.ToString() | Set-Content -Encoding UTF8 -NoNewline $sitemapPath
Good "Wrote sitemap.xml  → $sitemapPath"

# Write robots.txt next to scanRoot
$robotsPath = Join-Path $scanRoot "robots.txt"
@"
# robots.txt for $BaseUrl
User-agent: *
Allow: /

Sitemap: $BaseUrl/sitemap.xml
"@ | Set-Content -Encoding UTF8 $robotsPath
Good "Wrote robots.txt → $robotsPath"

Good "Done. Entries: $($entries.Count)."

<#
Changelog (for humans only; ignored by PowerShell)
- v1.0.0 — initial docs deployment and sitemap automation.
#>
