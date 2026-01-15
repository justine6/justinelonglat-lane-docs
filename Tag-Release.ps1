<#
.SYNOPSIS
  Commit + Tag + Push with version bump, date/hash suffix, and optional GitHub Release.

.DESCRIPTION
  - If -Version is provided, use it.
  - Else if -Bump is provided, bump from latest tag (vX.Y.Z).
  - Optional -AppendDate and/or -AppendHash suffixes.
  - Creates an annotated tag and pushes it (and branch).
  - If -GitHubRelease is set and GitHub CLI is present, creates a Release.

.EXAMPLES
  pwsh ./Tag-Release.ps1 -Version "v1.0-docs-reference" -Message "Reference build"
  pwsh ./Tag-Release.ps1 -Bump patch -AppendDate -Message "fixes + polish"
  pwsh ./Tag-Release.ps1 -Bump minor -AppendDate -AppendHash -GitHubRelease -Message "New features"
#>

param(
  [ValidateSet('patch','minor','major')]
  [string]$Bump,

  [string]$Version,

  [Parameter(Mandatory=$true)]
  [ValidateNotNullOrEmpty()]
  [string]$Message,

  [ValidateNotNullOrEmpty()]
  [string]$Branch = 'main',

  [switch]$AppendDate,
  [switch]$AppendHash,
  [switch]$GitHubRelease,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Say($m){ Write-Host "› $m" -ForegroundColor Cyan }
function Good($m){ Write-Host "✓ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠ $m" -ForegroundColor Yellow }
function Bad($m){ Write-Host "✗ $m" -ForegroundColor Red }

function Ensure-Git {
  try { git --version | Out-Null } catch {
    Bad "Git is not available in PATH."
    exit 1
  }
}

function Ensure-Origin {
  $originUrl = (git remote get-url origin 2>$null)
  if (-not $originUrl) {
    Bad "Remote 'origin' not found. Add it first: git remote add origin <url>"
    exit 1
  }
}

function Ensure-Branch([string]$expected) {
  $current = (git rev-parse --abbrev-ref HEAD).Trim()
  if ($current -ne $expected) {
    Bad "You are on '$current' but this release is configured to push '$expected'. Switch branch or pass -Branch."
    exit 1
  }
}

function Get-LatestTag {
  try {
    $t = (git describe --tags --abbrev=0 2>$null).Trim()
    if (-not $t) { return $null }
    return $t
  } catch { return $null }
}

function Bump-Version([string]$current,[string]$kind){
  # expect vX.Y.Z ; if none, start v1.0.0 and then bump
  if (-not $current -or $current -notmatch '^v(\d+)\.(\d+)\.(\d+).*$'){
    switch ($kind) {
      'patch' { return 'v1.0.1' }
      'minor' { return 'v1.1.0' }
      'major' { return 'v2.0.0' }
    }
  }
  $maj = [int]$Matches[1]; $min=[int]$Matches[2]; $pat=[int]$Matches[3]
  switch ($kind) {
    'patch' { $pat++ }
    'minor' { $min++; $pat=0 }
    'major' { $maj++; $min=0; $pat=0 }
  }
  return "v$maj.$min.$pat"
}

function Build-Tag([string]$base,[switch]$AppendDate,[switch]$AppendHash){
  $tag = $base
  if ($AppendDate) {
    $tag += "-$(Get-Date -Format 'yyyyMMdd')"
  }
  if ($AppendHash) {
    $sha = (git rev-parse --short HEAD).Trim()
    $tag += "-g$sha"
  }
  return $tag
}

function Tag-ExistsRemote([string]$tag){
  # returns $true if tag exists on origin
  try {
    $out = (git ls-remote --tags origin $tag) 2>$null
    return [bool]$out
  } catch { return $false }
}

# --- sanity ---------------------------------------------------------------
if (-not (Test-Path .git)) {
  Bad "Run from repo root (no .git found)."
  exit 1
}

Ensure-Git
Ensure-Origin
Ensure-Branch $Branch

Say "Checking working tree status..."
$dirty = (git status --porcelain)
if ($dirty) {
  Say "Staging and committing changes..."
  if ($DryRun) {
    Warn "DRY RUN: would run git add . && git commit -m '$Message'"
  } else {
    git add .
    git commit -m $Message | Out-Null
  }
} else {
  Say "No unstaged changes."
}

# --- compute version ------------------------------------------------------
if ($Version) {
  $base = $Version
} elseif ($Bump) {
  $latest = Get-LatestTag
  Say ("Latest tag: {0}" -f ($latest ?? '<none>'))
  $base = Bump-Version $latest $Bump
} else {
  Bad "Provide -Version or -Bump (patch|minor|major)."
  exit 1
}

$finalTag = Build-Tag $base $AppendDate $AppendHash
Say "Final tag → $finalTag"

# --- create tag -----------------------------------------------------------
if ($DryRun) {
  Warn "DRY RUN: would create annotated tag $finalTag"
} else {
  # Local existence
  $existsLocal = (git tag --list $finalTag)
  if ($existsLocal) {
    Warn "Tag '$finalTag' already exists locally; will push it."
  } else {
    # Remote collision check (prevents surprises)
    if (Tag-ExistsRemote $finalTag) {
      Bad "Tag '$finalTag' already exists on origin. Choose a new tag (change -Version or suffix flags)."
      exit 1
    }
    Say "Creating annotated tag..."
    git tag -a $finalTag -m $Message
  }
}

# --- push branch + tag ----------------------------------------------------
if ($DryRun) {
  Warn "DRY RUN: would push branch '$Branch' and tag '$finalTag'"
} else {
  Say "Pushing $Branch and $finalTag..."
  git push origin $Branch
  git push origin $finalTag
}

# --- GitHub Release (optional) -------------------------------------------
if ($GitHubRelease) {
  $hasGh = (Get-Command gh -ErrorAction SilentlyContinue) -ne $null
  if (-not $hasGh) {
    Warn "GitHub CLI (gh) not found. Skipping release."
  } else {
    Say "Creating GitHub Release for $finalTag..."
    $notes = $Message
    if (Test-Path CHANGELOG.md) {
      try {
        $chg = Get-Content CHANGELOG.md -Raw
        if ($chg) { $notes = $chg }
      } catch { }
    }
    if ($DryRun) {
      Warn "DRY RUN: would run gh release create $finalTag -t $finalTag -n <notes>"
    } else {
      gh release create $finalTag -t $finalTag -n $notes
      Good "GitHub Release created."
    }
  }
}

Good "Release workflow complete ✔"
