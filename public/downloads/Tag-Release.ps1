<#
.SYNOPSIS
  Automates commit + tag + push workflow for JustineLonglaT-Lane Docs releases.

.DESCRIPTION
  This script simplifies version management for your docs site:
  1. Stages and commits all tracked changes.
  2. Tags the commit with a version label (e.g. v1.1, v1.0-docs-reference).
  3. Pushes both commit and tag to origin.

.EXAMPLE
  ./Tag-Release.ps1 -Version "v1.0-docs-reference" -Message "Reference Build: Centered hero, gradient CTA, favicon fixed"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Version,

  [Parameter(Mandatory = $true)]
  [string]$Message
)

$ErrorActionPreference = 'Stop'

function Say($msg) { Write-Host "› $msg" -ForegroundColor Cyan }
function Good($msg){ Write-Host "✓ $msg" -ForegroundColor Green }
function Bad($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# 0️⃣ Sanity check
if (-not (Test-Path .git)) {
  Bad "Run this script from your repository root (no .git folder found)."
  exit 1
}

Say "Checking working tree status..."
$gitStatus = git status --porcelain
if ($gitStatus) {
  Say "Changes detected — staging for commit..."
  git add .
  git commit -m $Message
} else {
  Say "No unstaged changes found."
}

Say "Creating annotated tag $Version..."
git tag -a $Version -m $Message

Say "Pushing main branch and tag to remote..."
git push origin main
git push origin $Version

Good "Release $Version successfully tagged and pushed 🚀"

