# Sync registry-api + docker-compose and start registry-api on VPS.
param(
  [string]$Host = "64.176.181.71",
  [string]$User = "root",
  [string]$RemoteDir = "/opt/linestack-ipfs"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$key = "$env:USERPROFILE\.ssh\executor_monitor"

scp -i $key -r "$root\infra\registry-api" "${User}@${Host}:${RemoteDir}/"
scp -i $key "$root\infra\docker-compose.yml" "${User}@${Host}:${RemoteDir}/docker-compose.yml"

ssh -i $key "${User}@${Host}" "cd $RemoteDir && docker compose up -d registry-api && curl -sf -H \"Authorization: Bearer \`$REGISTRY_PROXY_SECRET\`\" http://127.0.0.1:8788/health || curl -sf http://127.0.0.1:8788/health"

Write-Host "Registry API should be on http://${Host}:8788 - set REGISTRY_API_URL in .env.local"
