# Deploy Line Stack contracts on Vultr. Usage: powershell -File scripts/deploy-contracts-vps.ps1
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Key = "$env:USERPROFILE\.ssh\executor_monitor"
$Target = "root@64.176.181.71"
$Remote = "/opt/linestack-deploy"

if (-not (Test-Path "$Root\.env.local")) { throw "Missing $Root\.env.local" }

Write-Host "Syncing to VPS..."
ssh -i $Key -o StrictHostKeyChecking=accept-new $Target "mkdir -p $Remote/contracts $Remote/scripts"
scp -i $Key -o StrictHostKeyChecking=accept-new `
  "$Root\contracts\foundry.toml" `
  "${Target}:${Remote}/contracts/"
scp -i $Key -r -o StrictHostKeyChecking=accept-new `
  "$Root\contracts\src" `
  "${Target}:${Remote}/contracts/"
scp -i $Key -o StrictHostKeyChecking=accept-new `
  "$Root\scripts\deploy-linestack-contracts.mjs" `
  "$Root\scripts\deploy-linestack-vps.sh" `
  "${Target}:${Remote}/scripts/"
scp -i $Key -o StrictHostKeyChecking=accept-new `
  "$Root\.env.local" `
  "${Target}:${Remote}/.env.deploy"

Write-Host "Foundry install + compile + deploy (may take 3-8 min)..."
ssh -i $Key -o StrictHostKeyChecking=accept-new $Target "sed -i 's/\r$//' $Remote/scripts/*.sh; chmod +x $Remote/scripts/*.sh; bash $Remote/scripts/deploy-linestack-vps.sh" 2>&1

$jsonPath = Join-Path $Root "contracts\deployed.aeneid.json"
scp -i $Key -o StrictHostKeyChecking=accept-new "${Target}:${Remote}/contracts/deployed.aeneid.json" $jsonPath

$deployed = Get-Content $jsonPath -Raw | ConvertFrom-Json
$envFile = "$Root\.env.local"
$lines = Get-Content $envFile
$keys = @{
  "VITE_LINESTACK_DATASET_REGISTRY" = $deployed.datasetRegistry
  "VITE_LINESTACK_TEMPLATE_REGISTRY" = $deployed.templateRegistry
  "LINESTACK_DATASET_REGISTRY" = $deployed.datasetRegistry
  "LINESTACK_TEMPLATE_REGISTRY" = $deployed.templateRegistry
  "LINESTACK_PUBLISHER_WRITE_CONDITION" = $deployed.publisherWriteCondition
  "LINESTACK_BUYER_READ_CONDITION" = $deployed.buyerReadCondition
  "LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION" = $deployed.merkleAllowlistReadCondition
}
foreach ($k in $keys.Keys) {
  $v = $keys[$k]
  $found = $false
  $lines = $lines | ForEach-Object {
    if ($_ -match "^$([regex]::Escape($k))=") { $found = $true; "$k=$v" } else { $_ }
  }
  if (-not $found) { $lines += "$k=$v" }
}
$lines | Set-Content $envFile
Write-Host "Deployed. Updated .env.local. Restart: npm run dev"
Write-Host "datasetRegistry=$($deployed.datasetRegistry)"
Write-Host "templateRegistry=$($deployed.templateRegistry)"
