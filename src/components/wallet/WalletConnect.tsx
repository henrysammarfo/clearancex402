import { ConnectButton } from "@rainbow-me/rainbowkit";

/** RainbowKit modal — pick MetaMask, Coinbase, Rainbow, WalletConnect, etc. */
export function WalletConnect() {
  return (
    <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
  );
}
