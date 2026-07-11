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

$mirrorPaths = @(
    ".cursor",
    ".opencode/agents",
    ".opencode/skills"
)

$tracked = git ls-files
$toRemove = $tracked | Where-Object {
    $_ -eq ".cursor" -or $_ -like ".cursor/*" -or
    $_ -eq ".opencode/agents" -or $_ -like ".opencode/agents/*" -or
    $_ -eq ".opencode/skills" -or $_ -like ".opencode/skills/*"
}

foreach ($path in $toRemove) {
    git rm --cached -f $path | Out-Null
}

Add-GitSymlink -Path ".cursor" -Target "ai"
Add-GitSymlink -Path ".opencode/agents" -Target "../ai/agents"
Add-GitSymlink -Path ".opencode/skills" -Target "../ai/skills"

Write-Host "`nGit symlink entries:"
git ls-files -s .cursor .opencode/agents .opencode/skills

$remaining = git ls-files | Where-Object {
    $_ -like ".cursor/*" -or $_ -like ".opencode/agents/*" -or $_ -like ".opencode/skills/*"
}
if ($remaining) {
    Write-Error "Expanded mirror files remain in the index: $($remaining -join ', ')"
}

$addedExpanded = git diff --cached --name-status | Where-Object {
    $_ -match '^A\s+(\.cursor/|\.opencode/agents/|\.opencode/skills/)'
}
if ($addedExpanded) {
    Write-Error "Expanded mirror files are staged as additions. Do not git add junction paths on Windows."
}
