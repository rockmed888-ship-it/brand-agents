$ErrorActionPreference = "Stop"
$name = Read-Host "Business name"
if (-not $name) { $name = "My business" }
$do = Read-Host "What you do, in one sentence"
$reach = Read-Host "How people reach you"
$dest = Join-Path $env:USERPROFILE "Documents\BookedOut"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$html = @"
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>$name</title></head>
<body style="font-family:Georgia,serif;background:#10120f;color:#f4f1e8;padding:32px;max-width:40rem;margin:auto">
<p style="letter-spacing:.14em;text-transform:uppercase;color:#ffd08a">Booked Out</p>
<h1>$name</h1>
<p>$do</p>
<p>$reach</p>
<p>This page is the business presence. Brand Agents follow up. Brain Connector answers. This file is only the social card.</p>
</body></html>
"@
Set-Content -Path (Join-Path $dest "index.html") -Value $html -Encoding UTF8
Write-Host "Booked Out card: $dest\index.html"
Start-Process (Join-Path $dest "index.html")
