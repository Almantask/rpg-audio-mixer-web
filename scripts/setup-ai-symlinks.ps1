# Restores Windows directory junctions for git-tracked symlinks under ai/.
# Run after clone/checkout on Windows when core.symlinks is false (default).
# Linux/macOS checkouts use real symlinks and do not need this script.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ai = Join-Path $root "ai"
$hooksSource = Join-Path $root ".githooks\pre-commit"
$hooksTarget = Join-Path $root ".git\hooks\pre-commit"

function Set-JunctionLink {
    param(
        [string]$Path,
        [string]$Target
    )

    if (Test-Path $Path) {
        Remove-Item $Path -Recurse -Force
    }

    New-Item -ItemType Junction -Path $Path -Target $Target | Out-Null
    git -C $root update-index --skip-worktree $Path 2>$null
    Write-Host "Linked $Path -> $Target"
}

& (Join-Path $PSScriptRoot "fix-ai-git-symlinks.ps1")

Set-JunctionLink (Join-Path $root ".cursor") $ai
Set-JunctionLink (Join-Path $root ".opencode\agents") (Join-Path $ai "agents")
Set-JunctionLink (Join-Path $root ".opencode\skills") (Join-Path $ai "skills")

if (Test-Path $hooksSource) {
    Copy-Item $hooksSource $hooksTarget -Force
    Write-Host "Installed pre-commit hook to .git/hooks/pre-commit"
}

Write-Host "AI symlinks ready. Edit agents/skills/workflows only under ai/."
