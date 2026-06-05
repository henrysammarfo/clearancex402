# Discord submission — copy-paste

Post in the **CDR Hackathon** Discord when your demo is ready. Replace `@YourDiscord` if needed.

---

## Short post (recommended)

```
**Line Stack** — confidential data marketplace on Story Aeneid (CDR + PIL)

Two products on one stack:
• **Vaultline** — encrypt files → Story IP → license → decrypt
• **Queryline** — private datasets → licensed answers only (result vault; dataset never exposed)

Live: https://linestack.vercel.app
Architecture (8-step CDR map): https://linestack.vercel.app/architecture
Repo: https://github.com/henrysammarfo/linestack
Demo video: <YOUR_YOUTUBE_URL>

Agents: SDK + CLI + MCP (17 tools) — same registry as the web app.
Honest note: Queryline fulfill is publisher-side today (CDR SDK has no enclave executeQuery yet); we use EIP-712 + Automata DCAP on fulfill.

Track: Technical Implementation · @jacob-tucker added on GitHub
```

---

## Thread reply (if asked “how does it use CDR?”)

```
1. allocate/write/accessCDR for vaults, dataset vaults, result vaults
2. OwnerWrite + LicenseRead + Line Stack custom conditions (deployed.aeneid.json)
3. Vaultline = marketplace for files (encrypt → IP → license → decrypt)
4. Queryline = marketplace for answers (template allow-list → fulfill → unlock result)
5. Shared registry + IPFS for web, CLI, SDK, MCP
6. Automata verifyAndAttestOnChain on Queryline fulfill (real tx on 1315)
```

---

## After npm publish (optional add-on line)

```
npm: @line-stack/cli @line-stack/sdk @line-stack/mcp-server @line-stack/cdr-core
npx -y @line-stack/mcp-server  # MCP stdio
```
