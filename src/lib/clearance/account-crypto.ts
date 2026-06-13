import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Hex } from "viem";

const ALGO = "aes-256-gcm";

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(payload: string, secret: string): string {
  const key = deriveKey(secret);
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid encrypted payload");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function getSessionEncryptionSecret(): string {
  const secret =
    process.env.SESSION_ENCRYPTION_SECRET?.trim() ||
    process.env.CLEARANCE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_ENCRYPTION_SECRET (min 16 chars) required for cross-device agent sessions",
    );
  }
  return secret;
}

export function encryptPrivateKey(privateKey: Hex): string {
  return encryptSecret(privateKey, getSessionEncryptionSecret());
}

export function decryptPrivateKey(encrypted: string): Hex {
  return decryptSecret(encrypted, getSessionEncryptionSecret()) as Hex;
}
