import * as React from "react";
import { useAccount, useChainId } from "wagmi";
import { CLEARANCE_CHAIN_ID, CLEARANCE_DEFAULTS } from "@/lib/clearance/network";
import { getClientEnv } from "@/lib/env/client";

export type Network = "base-sepolia";
export type Environment = "development" | "staging" | "production";

export type ConnectionConfig = {
  rpcUrl: string;
  explorerBaseUrl: string;
  network: Network;
  environment: Environment;
};

export const DEFAULT_EXPLORER_BASE_URL = CLEARANCE_DEFAULTS.explorerTxBaseUrl;

function configFromEnv(): ConnectionConfig {
  const env = getClientEnv();
  return {
    rpcUrl: env.rpcUrl,
    explorerBaseUrl: env.explorerTxBaseUrl,
    network: "base-sepolia",
    environment:
      import.meta.env.VITE_APP_ENV === "production"
        ? "production"
        : import.meta.env.VITE_APP_ENV === "staging"
          ? "staging"
          : "development",
  };
}

export const BASE_SEPOLIA_DEFAULT_CONFIG: ConnectionConfig = configFromEnv();

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "failed";

type Ctx = {
  config: ConnectionConfig;
  status: ConnectionStatus;
  walletAddress: string | null;
  isConnected: boolean;
  isWrongChain: boolean;
  /** Session-only override; not persisted (no localStorage). */
  save: (cfg: ConnectionConfig) => void;
  clear: () => void;
};

const ConnectionContext = React.createContext<Ctx | null>(null);

function ConnectionProviderInner({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<ConnectionConfig>(configFromEnv);
  const { address, isConnected: walletConnected, isConnecting, status: accountStatus } = useAccount();
  const chainId = useChainId();

  const isWrongChain = walletConnected && chainId !== CLEARANCE_CHAIN_ID;

  const status: ConnectionStatus = React.useMemo(() => {
    if (isConnecting || accountStatus === "reconnecting") return "connecting";
    if (walletConnected && isWrongChain) return "failed";
    if (walletConnected && chainId === CLEARANCE_CHAIN_ID) return "connected";
    return "disconnected";
  }, [isConnecting, accountStatus, walletConnected, isWrongChain, chainId]);

  const save = React.useCallback((cfg: ConnectionConfig) => {
    setConfig(cfg);
  }, []);

  const clear = React.useCallback(() => {
    setConfig(configFromEnv());
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

/** @deprecated use BASE_SEPOLIA_DEFAULT_CONFIG */
export const AENEID_DEFAULT_CONFIG = BASE_SEPOLIA_DEFAULT_CONFIG;
