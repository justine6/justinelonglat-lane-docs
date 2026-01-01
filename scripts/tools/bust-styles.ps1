param(
  [string]$FilePattern = "*.html"
)

$ErrorActionPreference = "Stop"

# 1) New cache-buster token
$ver = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "⇢ Using version: $ver" -ForegroundColor Cyan

# 2) Find all target HTML files
$pages = Get-ChildItem -File -Filter $FilePattern | Select-Object -ExpandProperty FullName
if (-not $pages) {
  Write-Host "No HTML files found matching $FilePattern" -ForegroundColor Yellow
  exit 0
}
Write-Host "⇢ Pages to update: $($pages | Split-Path -Leaf -join ', ')" -ForegroundColor Green

foreach ($f in $pages) {
  Write-Host "  · Updating $(Split-Path $f -Leaf)" -ForegroundColor Yellow
  $html = Get-Content $f -Raw

  # 3) Remove existing ?v=... on styles.css
  $html = $html -replace 'href="/styles\.css\?v=[^"]*"', 'href="/styles.css"'

  # 4) Add new version
  $new  = ('href="/styles.css?v={0}"' -f $ver)
  $html = $html -replace 'href="/styles\.css"', $new

  # 5) Save
  Set-Content -NoNewline -Path $f -Value $html
}

Write-Host "✅ Version-busted all HTML pages → v=$ver" -ForegroundColor Green