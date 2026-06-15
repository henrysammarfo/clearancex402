/** JSON.stringify replacer — BigInt and other non-JSON values from MetaMask / viem. */
export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, jsonReplacer)) as T;
}

export function jsonStringify(value: unknown, space?: number): string {
  return JSON.stringify(value, jsonReplacer, space);
}
