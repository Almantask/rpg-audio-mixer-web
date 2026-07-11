$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\..\..\..\..

if (Test-Path "package.json") {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm run clean 2>$null
        if ($LASTEXITCODE -ne 0) {
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .next, dist, node_modules\.vite, node_modules\.cache
        }
    } else {
        npm run clean 2>$null
        if ($LASTEXITCODE -ne 0) {
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .next, dist, node_modules\.vite, node_modules\.cache
        }
    }
} else {
    Write-Error "package.json not found."
    exit 1
}
