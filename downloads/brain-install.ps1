$ErrorActionPreference = "Stop"
$shop = "https://brandbyagents.com"
$dest = Join-Path $env:LOCALAPPDATA "BrainConnector"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Brain Connector needs Node.js."
  Write-Host "Install it from https://nodejs.org, close this window, then run the install again."
  exit 1
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Invoke-WebRequest -Uri "$shop/downloads/brain.mjs" -OutFile (Join-Path $dest "brain.mjs") -UseBasicParsing
Invoke-WebRequest -Uri "$shop/downloads/local-mcp.mjs" -OutFile (Join-Path $dest "local-mcp.mjs") -UseBasicParsing
Set-Content -Path (Join-Path $dest "shop.txt") -Value $shop -Encoding ASCII
Set-Content -Path (Join-Path $dest "brain.cmd") -Value "@echo off`r`nnode `"$dest\brain.mjs`" %*`r`n" -Encoding ASCII
& node --check (Join-Path $dest "brain.mjs")
& node --check (Join-Path $dest "local-mcp.mjs")
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }
if ($userPath -notlike "*${dest}*") {
  [Environment]::SetEnvironmentVariable("Path", ($userPath.TrimEnd(";") + ";" + $dest), "User")
}
Write-Host "Brain Connector is installed from brandbyagents.com."
Write-Host "Open a new terminal and type: brain"
Write-Host "Then: brain build --kind website --tier hobby --name ""Your shop"" --source ""What the brain is allowed to know."""
