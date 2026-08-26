$ErrorActionPreference = "Stop"

# ============================================
# SCB Electricity Production Downloader
# Table: TAB5644
# Period: 2017M01 - 2026M06
# ============================================

$apiUrl = "https://api.scb.se/OV0104/v2beta/api/v2/tables/TAB5644/data?lang=sv"

$outputDir = Join-Path $PSScriptRoot "data"
$outputFile = Join-Path $outputDir "electricity-production.csv"

New-Item -ItemType Directory -Force $outputDir | Out-Null

# ============================================
# Production types
# ============================================

$productionTypes = @(
    "Total",
    "VarmekrEjF",
    "VarmekrF",
    "Vindkraft",
    "Vattenkraft",
    "Karnkraft",
    "Solkraft"
)

# ============================================
# Generate months
# ============================================

$months = @()

for ($year = 2017; $year -le 2026; $year++) {

    $lastMonth = 12

    if ($year -eq 2026) {
        $lastMonth = 6
    }

    for ($month = 1; $month -le $lastMonth; $month++) {
        $months += "{0}M{1:D2}" -f $year, $month
    }
}

Write-Host ""
Write-Host "SCB electricity production downloader" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Table: TAB5644"
Write-Host "Months: $($months.Count)"
Write-Host "Production types: $($productionTypes.Count)"
Write-Host ""

$rows = @()

# ============================================
# Download
# ============================================

foreach ($month in $months) {

    Write-Host "Downloading $month ..." -NoNewline

    $bodyObject = @{
        selection = @(
            @{
                variableCode = "Produktionsslag"
                valueCodes = $productionTypes
            },
            @{
                variableCode = "ContentsCode"
                valueCodes = @("000004DF")
            },
            @{
                variableCode = "Tid"
                valueCodes = @($month)
            }
        )
    }

    $body = $bodyObject | ConvertTo-Json -Depth 10

    $tempFile = Join-Path $env:TEMP "scb-query.json"

    [System.IO.File]::WriteAllText(
        $tempFile,
        $body,
        (New-Object System.Text.UTF8Encoding($false))
    )

    $px = & curl.exe `
        --globoff `
        -s `
        -X POST `
        $apiUrl `
        -H "Content-Type: application/json" `
        -H "Accept: text/plain" `
        --data-binary "@$tempFile"

    if ($LASTEXITCODE -ne 0) {
        Write-Host " ERROR" -ForegroundColor Red
        throw "curl failed for $month"
    }

    # ========================================
    # PX response
    # ========================================

    $pxText = ($px -join "`n")

    $dataStart = $pxText.IndexOf("DATA=")

    if ($dataStart -lt 0) {
        Write-Host " ERROR" -ForegroundColor Red
        throw "Could not find DATA section for $month"
    }

    $dataText = $pxText.Substring($dataStart + 5)

    $semicolon = $dataText.IndexOf(";")

    if ($semicolon -lt 0) {
        Write-Host " ERROR" -ForegroundColor Red
        throw "Could not find end of DATA section for $month"
    }

    $dataText = $dataText.Substring(0, $semicolon).Trim()

    $values = $dataText -split '\s+' |
        Where-Object {
            $_ -ne ""
        }

    if ($values.Count -ne 7) {
        Write-Host " ERROR" -ForegroundColor Red
        throw "Expected 7 values for $month but received $($values.Count)"
    }

    # ========================================
    # Convert values
    # ========================================

    for ($i = 0; $i -lt 7; $i++) {

        $type = $productionTypes[$i]

        $value = $values[$i].Trim().Trim('"').Trim("'")

        if (
            [string]::IsNullOrWhiteSpace($value) -or
            $value -eq "." -or
            $value -eq ".." -or
            $value -eq "..."
        ) {
            $gwh = $null
        }
        else {
            try {
                $gwh = [int]$value
            }
            catch {
                Write-Host " ERROR" -ForegroundColor Red
                throw "Could not convert '$value' to integer for $month / $type"
            }
        }

        $rows += [PSCustomObject]@{
            month = $month
            production_type = $type
            gwh = $gwh
        }
    }

    Write-Host " OK" -ForegroundColor Green
}

# ============================================
# Cleanup
# ============================================

if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force
}

# ============================================
# Save CSV
# ============================================

$rows |
    Export-Csv `
        -Path $outputFile `
        -NoTypeInformation `
        -Encoding UTF8

# ============================================
# Validate
# ============================================

$expectedRows = $months.Count * $productionTypes.Count

if ($rows.Count -ne $expectedRows) {
    throw "Expected $expectedRows rows but received $($rows.Count)"
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DONE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Months downloaded: $($months.Count)"
Write-Host "Production types: $($productionTypes.Count)"
Write-Host "Rows: $($rows.Count)"
Write-Host "File: $outputFile"
Write-Host ""