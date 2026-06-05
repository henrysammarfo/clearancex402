import * as React from "react";
import { useAccount, useChainId } from "wagmi";
import { AENEID_CHAIN_ID, AENEID_DEFAULTS } from "@line-stack/cdr-core";
import { getClientEnv, resolveBrowserStoryApiUrl } from "@/lib/env/client";

export type Network = "story-testnet" | "story-mainnet";
export type Environment = "development" | "staging" | "production";

export type ConnectionConfig = {
  rpcUrl: string;
  cdrUrl: string;
  explorerBaseUrl: string;
  network: Network;
  environment: Environment;
  apiKey?: string;
};

export const DEFAULT_EXPLORER_BASE_URL = AENEID_DEFAULTS.explorerTxBaseUrl;

function defaultCdrUrl(): string {
  if (typeof window === "undefined") return AENEID_DEFAULTS.storyApiUrl;
  return getClientEnv().storyApiUrl;
}

export const AENEID_DEFAULT_CONFIG: ConnectionConfig = {
  rpcUrl: AENEID_DEFAULTS.rpcUrl,
  cdrUrl: defaultCdrUrl(),
  explorerBaseUrl: AENEID_DEFAULTS.explorerTxBaseUrl,
  network: "story-testnet",
  environment: "development",
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "failed";

type Ctx = {
  config: ConnectionConfig | null;
  status: ConnectionStatus;
  walletAddress: string | null;
  isConnected: boolean;
  isWrongChain: boolean;
  save: (cfg: ConnectionConfig) => void;
  clear: () => void;
};

const ConnectionContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "linestack.connection.v1";

function sanitizeConnectionConfig(cfg: ConnectionConfig): ConnectionConfig {
  return { ...cfg, cdrUrl: resolveBrowserStoryApiUrl(cfg.cdrUrl) };
}

function ConnectionProviderInner({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<ConnectionConfig | null>(null);
  const { address, isConnected: walletConnected, isConnecting, status: accountStatus } = useAccount();
  const chainId = useChainId();

  const isWrongChain = walletConnected && chainId !== AENEID_CHAIN_ID;

  const status: ConnectionStatus = React.useMemo(() => {
    if (
      isConnecting ||
      accountStatus === "connecting" ||
      accountStatus === "reconnecting"
    ) {
      return "connecting";
    }
    if (walletConnected && isWrongChain) return "failed";
    if (walletConnected && chainId === AENEID_CHAIN_ID) return "connected";
    return config ? "disconnected" : "disconnected";
  }, [isConnecting, accountStatus, walletConnected, isWrongChain, chainId, config]);

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as ConnectionConfig;
        const migrated = sanitizeConnectionConfig(parsed);
        setConfig(migrated);
        if (migrated.cdrUrl !== parsed.cdrUrl) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      } else {
        setConfig(sanitizeConnectionConfig(AENEID_DEFAULT_CONFIG));
      }
    } catch {
      setConfig(sanitizeConnectionConfig(AENEID_DEFAULT_CONFIG));
    }
  }, []);

  const save = React.useCallback((cfg: ConnectionConfig) => {
    const sanitized = sanitizeConnectionConfig(cfg);
    setConfig(sanitized);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      /* ignore */
    }
  }, []);

  const clear = React.useCallback(() => {
    const defaults = sanitizeConnectionConfig(AENEID_DEFAULT_CONFIG);
    setConfig(defaults);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      /* ignore */
    }
  }, []);

  const value: Ctx = {
    config,
    status,
    walletAddress: address ?? null,
    isConnected: status === "connected",
    isWrongChain,
    save,
    clear,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  return <ConnectionProviderInner>{children}</ConnectionProviderInner>;
}

export function useConnection() {
  const ctx = React.useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection must be used within ConnectionProvider");
  return ctx;
}
