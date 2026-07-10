$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\..\..\..\..

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    pnpm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    pnpm exec playwright test --list
} else {
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npx playwright test --list
}

exit $LASTEXITCODE
