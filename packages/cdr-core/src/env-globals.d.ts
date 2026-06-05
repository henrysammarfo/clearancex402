/** Minimal Node globals for package build without requiring @types/node at compile time. */
declare const process: {
  env: Record<string, string | undefined>;
};

declare const console: {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
};
