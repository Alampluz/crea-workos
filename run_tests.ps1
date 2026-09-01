# Runs every jsdom suite in tests/ against the built app/index.html.
# The suites read 'index.html' from the working directory and need jsdom
# resolvable from there, so we set up a scratch dir and run from it.
$root = $PSScriptRoot
$run  = Join-Path $env:TEMP 'workos-testrun'
New-Item -ItemType Directory -Force -Path $run | Out-Null
Copy-Item (Join-Path $root 'app\index.html') (Join-Path $run 'index.html') -Force
Push-Location $run
if (-not (Test-Path 'node_modules\jsdom')) { npm install jsdom --no-audit --no-fund --silent }
# suites live outside this dir, so node resolves modules from tests\ - point it here
$env:NODE_PATH = Join-Path $run 'node_modules'
$pass = 0; $fail = 0; $failed = @()
Get-ChildItem (Join-Path $root 'tests\*.cjs') | ForEach-Object {
  node $_.FullName *> $null
  if ($LASTEXITCODE -eq 0) { $pass++ } else { $fail++; $failed += $_.Name }
}
Pop-Location
Write-Host "PASS=$pass FAIL=$fail"
if ($fail -gt 0) { Write-Host "FAILING: $($failed -join ' ')"; exit 1 }
