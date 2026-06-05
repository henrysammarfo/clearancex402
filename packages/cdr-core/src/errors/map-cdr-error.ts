import { CDRError } from "@piplabs/cdr-sdk";

export type LineStackErrorCode =
  | "CDR_SDK"
  | "WALLET_REQUIRED"
  | "CONFIG"
  | "WASM_INIT"
  | "INVALID_INPUT"
  | "PAYLOAD_TOO_LARGE"
  | "UNKNOWN";

export class LineStackError extends Error {
  readonly code: LineStackErrorCode;
  readonly cause?: unknown;
  readonly cdrCode?: string;

  constructor(
    code: LineStackErrorCode,
    message: string,
    options?: { cause?: unknown; cdrCode?: string },
  ) {
    super(message, { cause: options?.cause });
    this.name = "LineStackError";
    this.code = code;
    this.cause = options?.cause;
    this.cdrCode = options?.cdrCode;
  }
}

export function mapUnknownError(err: unknown): LineStackError {
  if (err instanceof LineStackError) return err;
  if (err instanceof CDRError) {
    return new LineStackError("CDR_SDK", err.message, {
      cause: err,
      cdrCode: err.code,
    });
  }
  if (err instanceof Error) {
    return new LineStackError("UNKNOWN", err.message, { cause: err });
  }
  return new LineStackError("UNKNOWN", String(err), { cause: err });
}

export function isWalletClientRequiredError(err: unknown): boolean {
  return (
    err instanceof CDRError &&
    (err as CDRError & { code?: string }).code === "WALLET_CLIENT_REQUIRED"
  );
}
