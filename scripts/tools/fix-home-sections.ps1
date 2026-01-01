$ErrorActionPreference = "Stop"

function Read-Text([string]$Path) {
  Get-Content -LiteralPath $Path -Raw -Encoding UTF8
}
function Write-Text([string]$Path, [string]$Content) {
  Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
  Write-Host "✓ wrote $Path" -ForegroundColor Green
}

# helper: convert a Windows relative path like ".\docs\page.html" -> "/docs/page.html"
function To-WebPath([string]$rel) {
  if ($rel -like ".\*") { $rel = $rel.Substring(2) }
  $rel = $rel -replace "\\","/"
  if ($rel -notmatch "^/") { $rel = "/" + $rel }
  return $rel
}

# ---------------- 1) Collect HTML pages (exclude partials/templates/etc.) ----
$pages = Get-ChildItem -Path . -File -Filter *.html -Recurse | Where-Object {
  $full = $_.FullName
  # exclude well-known non-pages and special folders
  $base = $_.Name
  $isTemplateOrPartial = ($full -match "(^|\\)_(partials|templates)(\\|$)") `
                      -or ($full -match "(^|\\)templates?(\\|$)")
  $isNonPageName = $base -in @('404.html','sitemap.html','docs.html','header.html','footer.html')
  -not $isTemplateOrPartial -and -not $isNonPageName
}

# ---------------- Title extraction (H1 > Title > filename) -------------------
function Get-Title([string]$file) {
  $html = Read-Text $file
  $h1 = [regex]::Match($html, '(?is)<h1[^>]*>(.+?)</h1>').Groups[1].Value.Trim()
  if ($h1) { return ($h1 -replace '\s+',' ').Trim() }
  $t  = [regex]::Match($html, '(?is)<title[^>]*>(.+?)</title>').Groups[1].Value.Trim()
  if ($t) { return ($t -replace '\s+',' ').Trim() }
  return [IO.Path]::GetFileNameWithoutExtension($file)
}

# ---------------- 2) Build "Latest updates" (top 10 by mtime) ----------------
$lis = foreach ($p in ($pages | Sort-Object LastWriteTime -Descending | Select-Object -First 10)) {
  $rel = Resolve-Path -LiteralPath $p.FullName -Relative
  $href  = To-WebPath $rel
  $title = Get-Title $p.FullName
  $date  = $p.LastWriteTime.ToString('yyyy-MM-dd')
  "  <li><a href=""$href"">$title</a> <span class=""updated-on"">$date</span></li>"
}

$updatesHtml = @"
<section class="updates" aria-label="Latest updates">
  <div class="updates-head">
    <h2>Latest updates</h2>
    <a class="updates-more" href="/sitemap.xml" target="_blank" rel="noopener">View all</a>
  </div>
  <ul class="updates-list">
$(($lis -join "`r`n"))
  </ul>
</section>
"@

# ---------------- 3) Build "All Pages" (prefer sitemap.xml) ------------------
$allLis = @()
if (Test-Path "sitemap.xml") {
  $smap = Read-Text "sitemap.xml"
  $locs = [regex]::Matches($smap, '(?is)<loc>(.+?)</loc>') | ForEach-Object { $_.Groups[1].Value }
  $allLis = foreach ($u in ($locs | Sort-Object)) {
    $label = ($u -replace '.*/','') -replace '\.html?$','' -replace '[-_/]+',' '
    if (-not $label) { $label = $u }
    "  <li><a href=""$u"">$label</a></li>"
  }
} else {
  $allLis = foreach ($p in ($pages | Sort-Object FullName)) {
    $rel = Resolve-Path -LiteralPath $p.FullName -Relative
    $href  = To-WebPath $rel
    $label = ($p.BaseName -replace '[-_]+',' ')
    "  <li><a href=""$href"">$label</a></li>"
  }
}

$allPagesHtml = @"
<section class="all-pages" aria-label="All pages">
  <div class="updates-head">
    <h2>All Pages</h2>
  </div>
  <ul class="updates-list">
$(($allLis -join "`r`n"))
  </ul>
</section>
"@

# ---------------- 4) Patch index.html (idempotent) ---------------------------
$homePath = "index.html"
if (-not (Test-Path $homePath)) {
  Write-Host "✗ index.html not found at project root." -ForegroundColor Red
  exit 1
}

$homeHtml = Read-Text $homePath
# remove any previously injected sections by class
$homeHtml = [regex]::Replace($homeHtml, '(?is)<section[^>]*\bupdates\b[^>]*>.*?</section>', '')
$homeHtml = [regex]::Replace($homeHtml, '(?is)<section[^>]*\ball-pages\b[^>]*>.*?</section>', '')
$combined = "$updatesHtml`r`n$allPagesHtml"

if ([regex]::IsMatch($homeHtml, '(?is)(<div[^>]+class="hero[^"]*"[^>]*>.*?</div>)')) {
  $homeHtml = [regex]::Replace($homeHtml, '(?is)(<div[^>]+class="hero[^"]*"[^>]*>.*?</div>)',
    { param($m) $m.Groups[1].Value + "`r`n$combined" }, 1)
}
elseif ([regex]::IsMatch($homeHtml, '(?is)<h1[^>]*>\s*Welcome to JustineLonglaT-Lane Docs')) {
  $homeHtml = [regex]::Replace($homeHtml, '(?is)(<h1[^>]*>\s*Welcome to JustineLonglaT-Lane Docs)',
    "<!-- home-sections -->`r`n$combined`r`n$1", 1)
}
elseif ([regex]::IsMatch($homeHtml, '(?is)(<main[^>]*>)')) {
  $homeHtml = [regex]::Replace($homeHtml, '(?is)(<main[^>]*>)',
    { param($m) $m.Groups[1].Value + "`r`n$combined" }, 1)
}
else {
  $homeHtml = [regex]::Replace($homeHtml, '(?is)</body>', "$combined`r`n</body>", 1)
}

Write-Text $homePath $homeHtml
Write-Host "✓ Homepage patched: SINGLE updates + SINGLE all-pages section." -ForegroundColor Green

