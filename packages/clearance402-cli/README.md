# @clearance402/cli

Terminal interface to Clearance402 — status, probes, clearance checks, audit export.

```bash
npm install -g @clearance402/cli
export CLEARANCE402_API_URL=https://clearancex402.vercel.app
export CLEARANCE402_WALLET=0xYourAddress

clearance402 status
clearance402 tools list
clearance402 tools probe x402-sepolia-demo
clearance402 clear --agent buyer-agent --tool x402-sepolia-demo --amount 0.001
clearance402 audit --export audit.csv
```
