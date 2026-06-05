#!/usr/bin/env bash
# Deploy infra/docker-compose.yml to a VPS. Usage: ./scripts/deploy-ipfs-vps.sh root@64.176.181.71
set -euo pipefail
TARGET="${1:?Usage: $0 root@host}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRET="${IPFS_PROXY_SECRET:-$(openssl rand -hex 32)}"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)

echo "Deploying to $TARGET ..."
ssh "${SSH_OPTS[@]}" "$TARGET" "mkdir -p /opt/linestack-ipfs"
scp -r "${SSH_OPTS[@]}" "$ROOT/infra/docker-compose.yml" "$ROOT/infra/ipfs-proxy" "$TARGET:/opt/linestack-ipfs/"
ssh "${SSH_OPTS[@]}" "$TARGET" "echo IPFS_PROXY_SECRET=$SECRET > /opt/linestack-ipfs/.env"
ssh "${SSH_OPTS[@]}" "$TARGET" bash -s <<'REMOTE'
set -e
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker.io docker-compose-v2
  systemctl enable --now docker
fi
cd /opt/linestack-ipfs
docker compose pull
docker compose up -d
REMOTE
echo ""
echo "Deployed. Add to .env.local:"
echo "IPFS_PROXY_URL=http://$(echo "$TARGET" | cut -d@ -f2):8787"
echo "IPFS_PROXY_SECRET=$SECRET"
echo "IPFS_GATEWAY_URL=http://$(echo "$TARGET" | cut -d@ -f2):8080/ipfs"
