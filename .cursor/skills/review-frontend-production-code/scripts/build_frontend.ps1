# Build and typecheck the frontend. Run from repository root.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\..\..\..

if (Test-Path "pnpm-lock.yaml") {
    pnpm typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    pnpm build
} elseif (Test-Path "package-lock.json") {
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npm run build
} else {
    Write-Error "No package.json lockfile found. Bootstrap the web app first."
    exit 1
}
