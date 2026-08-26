$ErrorActionPreference = "Stop"

$apiUrl = "https://api.scb.se/OV0104/v2beta/api/v2/tables?lang=sv"

$response = Invoke-RestMethod -Uri $apiUrl -Method Get

$response | ConvertTo-Json -Depth 20 |
    Out-File ".\scb-tables.json" -Encoding UTF8

Write-Host ""
Write-Host "SCB tables downloaded." -ForegroundColor Green
Write-Host "Saved to scb-tables.json"
Write-Host ""

$response |
    Where-Object {
        $_.text -match "el|El|kraft|Kraft|energi|Energi"
    } |
    Select-Object id, text |
    Format-Table -AutoSize