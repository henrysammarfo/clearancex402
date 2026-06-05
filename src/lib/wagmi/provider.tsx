import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { createWagmiConfig } from "./config";

import "@rainbow-me/rainbowkit/styles.css";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [config] = useState(() => createWagmiConfig());

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={lightTheme({ accentColor: "#18181b" })} modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
