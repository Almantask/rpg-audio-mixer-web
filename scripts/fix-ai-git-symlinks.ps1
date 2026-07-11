# Restores git symlink entries for ai/ mirrors.
# Uses git update-index so Windows junctions are not dereferenced by git add.
# Safe to run repeatedly.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

function Add-GitSymlink {
    param(
        [string]$Path,
        [string]$Target
    )

    $hash = ($Target | git hash-object -w --stdin).Trim()
    git update-index --add --cacheinfo "120000", $hash, $Path
    Write-Host "Indexed symlink $Path -> $Target"
}

$symlinks = @(
    @{ Path = ".cursor"; Target = "ai" },
    @{ Path = ".opencode/agents"; Target = "../ai/agents" },
    @{ Path = ".opencode/skills"; Target = "../ai/skills" }
)

foreach ($link in $symlinks) {
    if (git ls-files --stage $link.Path 2>$null) {
        git rm -r --cached -f $link.Path | Out-Null
    }
}

foreach ($link in $symlinks) {
    Add-GitSymlink -Path $link.Path -Target $link.Target
}

Write-Host "`nGit symlink entries:"
git ls-files -s .cursor .opencode/agents .opencode/skills

$addedExpanded = git diff --cached --name-status | Where-Object {
    $_ -match '^A\s+(\.cursor/|\.opencode/agents/|\.opencode/skills/)'
}
if ($addedExpanded) {
    Write-Error "Expanded mirror files are staged as additions. Re-run this script instead of git add on junction paths."
}
