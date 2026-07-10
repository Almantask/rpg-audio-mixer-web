<#
.SYNOPSIS
    Converts all .mp3 files in the res/raw directory to .ogg (Opus) while maintaining filenames.

.DESCRIPTION
    Iterates through all .mp3 files in the current and subdirectories, converts them using FFmpeg
    with libopus codec at 96k VBR, and deletes the original .mp3 files upon success.

.EXAMPLE
    cd app/src/main/res/raw
    pwsh ai/skills/engineer-audio-playback/scripts/convert_to_ogg.ps1
#>

$root = Get-Location
Write-Host "Starting audio conversion in $root..." -ForegroundColor Cyan

Get-ChildItem -Recurse -Filter *.mp3 | ForEach-Object {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $outputFile = Join-Path $_.DirectoryName "${baseName}.ogg"
    
    Write-Host "Converting: $($_.Name) -> ${baseName}.ogg" -ForegroundColor Gray
    
    # Convert to Ogg/Opus at 96k (high quality, low size)
    ffmpeg -loglevel error -i $_.FullName -c:a libopus -b:a 96k -vbr on "$outputFile"
    
    # Only remove if the conversion was successful (exit code 0)
    if ($LASTEXITCODE -eq 0) {
        Remove-Item $_.FullName
        Write-Host "Success: Original removed." -ForegroundColor Green
    } else {
        Write-Host "Error: Conversion failed for $($_.Name). Original preserved." -ForegroundColor Red
    }
}

Write-Host "Audio conversion process complete." -ForegroundColor Cyan
