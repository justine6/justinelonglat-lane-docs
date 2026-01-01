[CmdletBinding(DefaultParameterSetName = "Run")]
param(
    # Logical tool name, e.g. "build-docs", "cut-release", "gen-sitemap"
    [Parameter(Position = 0)]
    [string]$Name,

    # Extra arguments to pass through to the underlying script
    [Parameter(Position = 1)]
    [hashtable]$ToolArgs = @{},   # we will always splat this

    # Show available tools
    [switch]$List
)

$ErrorActionPreference = "Stop"

# Locate script directories relative to this file
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDir  = Join-Path $scriptDir "tools"
$ciDir     = Join-Path $scriptDir "ci"

# Map logical names to specific scripts that actually exist
$toolMap = @{
    "bust-styles"           = Join-Path $toolsDir "bust-styles.ps1"
    "check-homepage"        = Join-Path $ciDir    "Check-DocsHomepagePatch.ps1"
    "cleanup-branding"      = Join-Path $toolsDir "cleanup-branding.ps1"
    "cleanup-branding-docs" = Join-Path $toolsDir "cleanup-branding-docs.ps1"
    "cleanup-branding-repos"= Join-Path $toolsDir "cleanup-branding.repos.ps1"
    "fix-home-sections"     = Join-Path $toolsDir "fix-home-sections.ps1"
    "gen-sitemap"           = Join-Path $toolsDir "Generate-Sitemap.ps1"
}

if ($List -or -not $Name) {
    Write-Host "Available tools:" -ForegroundColor Cyan
    $toolMap.GetEnumerator() |
        Sort-Object Key |
        ForEach-Object {
            $logical = $_.Key
            $target  = $_.Value
            "{0,-24} -> {1}" -f $logical, (Split-Path $target -Leaf)
        } | Write-Host

    Write-Host ""
    Write-Host "Usage:" -ForegroundColor DarkGray
    Write-Host "  .\scripts\Invoke-Tool.ps1 -List"
    Write-Host "  .\scripts\Invoke-Tool.ps1 -Name gen-sitemap -ToolArgs @{ BaseUrl='https://docs.justinelonglat-lane.com'; Source='docs' }"
    return
}

if (-not $toolMap.ContainsKey($Name)) {
    Write-Host "✗ Unknown tool: $Name" -ForegroundColor Red
    Write-Host "  Run with -List to see valid names."
    return
}

$scriptPath = $toolMap[$Name]

if (-not (Test-Path $scriptPath)) {
    Write-Host "✗ Script not found at: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "▶ Running '$Name' via $scriptPath" -ForegroundColor Green

# Forward arguments transparently (splat the hashtable)
if ($ToolArgs.Count -gt 0) {
    & $scriptPath @ToolArgs
} else {
    & $scriptPath
}
