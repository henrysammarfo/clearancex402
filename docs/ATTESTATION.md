# Queryline fulfill attestation (technical track)

Line Stack implements **verifiable publisher fulfill** on Story Aeneid without waiting for Story’s enclave execute API.

## Layers

| Layer | What it proves |
|--------|----------------|
| **CDR vault layout** | Buyer never gets dataset vault; only result vault after fulfill |
| **EIP-712 fulfill binding** | Publisher signed `(requestId, templateId, vault UUIDs, resultHash)` on chain 1315 |
| **Automata DCAP (required)** | Intel quote verified on-chain at every fulfill (`USE_AUTOMATA_DCAP_FIXTURE=1` or `AUTOMATA_DCAP_QUOTE_HEX`) |

## Automata on Aeneid (1315)

| Contract | Address |
|----------|---------|
| AutomataDcapAttestationFee | `0xB8621Da79b42A62E576408995155D48E9f856489` |
| PCCSRouter | `0xcb1934EA19c6650a8cC9888c0306D39f0BeBc2AB` |

Set in `.env.local` for publisher fulfill via SDK/CLI:

```bash
# Option A: your TEE-generated Intel DCAP quote
AUTOMATA_DCAP_QUOTE_HEX=0x...

# Option B: bundled fixture (Intel DCAP V5, verified on Aeneid — see fixtures/automata/)
USE_AUTOMATA_DCAP_FIXTURE=1
# or: AUTOMATA_DCAP_QUOTE_FILE=fixtures/automata/alibaba-v5-quote.hex
```

SDK calls `verifyAndAttestOnChain` (~4–5M gas + fee %) and stores `attestation.automata.txHash` on the registry request.

### One-shot demo (terminal)

```bash
npm run demo:automata
# → standalone Automata tx + fulfill; writes .automata-demo-last.json with results URL

npm run test:e2e:automata
# → full Queryline smoke including on-chain DCAP attestation
```

## Verify as a buyer

1. Open `/queryline/results/:id` after fulfill.
2. Check **Attestation** rows (signer, binding hash, optional Automata tx).
3. Recompute `resultPayloadHash` from decrypted JSON and verify EIP-712 signature off-chain, or use `@line-stack/cdr-core` `verifyFulfillAttestation`.

## Run full terminal smoke

```bash
npm run test:e2e              # Vaultline (if STORACHA_PROOF) + Queryline
npm run test:e2e:queryline    # Queryline only (generates + funds buyer wallet)
```

Buyer key is written to `.buyer-wallet.generated.json` (gitignored) when not provided.
