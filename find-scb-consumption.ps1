$ErrorActionPreference = "Stop"

$apiUrl = "https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB5644/data?lang=sv"

Write-Host ""
Write-Host "Checking SCB table TAB5644..." -ForegroundColor Cyan
Write-Host ""

$response = & curl.exe `
    --globoff `
    -s `
    -X GET `
    $apiUrl `
    -H "Accept: application/json"

if ($LASTEXITCODE -ne 0) {
    throw "curl failed"
}

$response