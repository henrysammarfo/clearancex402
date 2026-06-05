# Self-hosted IPFS (Vultr / Azure / Docker)

Large Vaultline files use CDR `uploadFile` with encrypted blobs on **your** IPFS node — no Storacha console.

## Architecture

```text
Browser → Line Stack /api/ipfs/pin|get → Vercel/server
       → http://YOUR_VPS:8787 (Bearer secret) → Kubo on localhost:5001
Public reads: http://YOUR_VPS:8080/ipfs/{cid}
```

## 1. Deploy on VPS

```bash
# From repo root (requires SSH to your VM)
./scripts/deploy-ipfs-vps.sh root@64.176.181.71
```

Or manually:

```bash
scp -r infra/* root@YOUR_VPS:/opt/linestack-ipfs/
ssh root@YOUR_VPS
cd /opt/linestack-ipfs
echo "IPFS_PROXY_SECRET=$(openssl rand -hex 32)" > .env
docker compose up -d
ufw allow 8787/tcp
ufw allow 8080/tcp
```

## 2. App env (`.env.local` / Vercel server only)

```env
IPFS_PROXY_URL=http://YOUR_VPS:8787
IPFS_PROXY_SECRET=same-as-vm-.env
IPFS_GATEWAY_URL=http://YOUR_VPS:8080/ipfs
```

## 3. Verify

```bash
npm run build:core
npm run test:ipfs
```

## VMs found on this machine

| IP | SSH | Notes |
|----|-----|-------|
| `64.176.181.71` | `root` + `~/.ssh/executor_monitor` | Vultr — **Line Stack IPFS target** |
| `20.208.46.195` | needs `azureuser` + correct key | Azure |
| `84.8.x.x` | host key changed / key mismatch | fix `known_hosts` or new key |

Do not commit `IPFS_PROXY_SECRET`.
