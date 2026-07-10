param(
    [string]$FeaturePath = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\..\..\..\..

if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Run from the web app repository root."
    exit 1
}

if ($FeaturePath) {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm exec playwright test $FeaturePath
    } else {
        npx playwright test $FeaturePath
    }
} else {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm exec playwright test
    } else {
        npx playwright test
    }
}

exit $LASTEXITCODE
