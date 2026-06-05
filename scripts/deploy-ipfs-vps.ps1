# Sync ipfs-proxy to VPS (preserves existing .env secrets).
param(
  [string]$VpsHost = "64.176.181.71",
  [string]$User = "root",
  [string]$RemoteDir = "/opt/linestack-ipfs"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$key = "$env:USERPROFILE\.ssh\executor_monitor"

scp -i $key -r "$root\infra\ipfs-proxy" "${User}@${VpsHost}:${RemoteDir}/"
ssh -i $key "${User}@${VpsHost}" "cd $RemoteDir && docker compose restart ipfs-proxy && sleep 2 && docker compose ps ipfs-proxy"

Write-Host "IPFS proxy on http://${VpsHost}:8787 — run: npm run test:ipfs"
