$ErrorActionPreference = "Stop"
$shop = "https://brandbyagents.com"
$pages = "https://rockmed888-ship-it.github.io/brand-agents"
$dest = Join-Path $env:LOCALAPPDATA "BrainConnector"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Brain Connector needs Node.js."
  Write-Host "Install it from https://nodejs.org, close this window, then run the install again."
  exit 1
}

function Get-BrainFile([string]$Name) {
  $out = Join-Path $dest $Name
  $urls = @(
    "$shop/downloads/$Name",
    "$shop/$Name",
    "$pages/downloads/$Name"
  )
  $last = $null
  foreach ($url in $urls) {
    try {
      Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
      return $true
    } catch {
      $last = $_
    }
  }
  throw $last
}

Get-BrainFile "brain.mjs" | Out-Null
Get-BrainFile "local-mcp.mjs" | Out-Null
Get-BrainFile "memory-mcp.mjs" | Out-Null
Set-Content -Path (Join-Path $dest "shop.txt") -Value $shop -Encoding ASCII
Set-Content -Path (Join-Path $dest "brain.cmd") -Value "@echo off`r`nnode `"$dest\brain.mjs`" %*`r`n" -Encoding ASCII
foreach ($js in @("brain.mjs", "local-mcp.mjs", "memory-mcp.mjs")) {
  $path = Join-Path $dest $js
  & node --check $path
  if ($LASTEXITCODE -ne 0) {
    Write-Host "$js did not pass a syntax check."
    exit 1
  }
}
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }
if ($userPath -notlike "*${dest}*") {
  [Environment]::SetEnvironmentVariable("Path", ($userPath.TrimEnd(";") + ";" + $dest), "User")
}
Write-Host "Brain Connector is installed from brandbyagents.com."
Write-Host "Open a NEW terminal and type: brain"
Write-Host "Then: brain connect <url or folder>"
Write-Host "Then: brain build --kind website --tier hobby --name ""Your shop"" --source ""What the brain is allowed to know."""
