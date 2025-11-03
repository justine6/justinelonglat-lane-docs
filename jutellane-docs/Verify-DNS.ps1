# Verify-DNS.ps1
# ----------------------------------------
# Automated DNS status check for Jutellane subdomains
# ----------------------------------------

$Subdomains = @(
    "jutellane.com",
    "www.jutellane.com",
    "docs.jutellane.com",
    "projects.jutellane.com",
    "blogs.jutellane.com"
)

Write-Host "`n🔍 Checking DNS records for Jutellane..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------`n"

foreach ($sub in $Subdomains) {
    try {
        $result = Resolve-DnsName $sub -ErrorAction Stop
        $resolved = $result | Where-Object { $_.QueryType -in @('A', 'CNAME') }
        if ($resolved) {
            Write-Host ("✅  {0,-30} {1,-10} {2}" -f $sub, $resolved.QueryType, $resolved.NameHost) -ForegroundColor Green
        } else {
            Write-Host ("⚠️  {0,-30} No A/CNAME record found" -f $sub) -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host ("❌  {0,-30} Failed to resolve" -f $sub) -ForegroundColor Red
    }
}

Write-Host "`n--------------------------------------------------"
Write-Host "✔️  DNS verification complete." -ForegroundColor Cyan
