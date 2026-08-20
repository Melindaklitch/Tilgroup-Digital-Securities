"use client";

import { ReactNode, useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Use environment variable for endpoint (better for production)
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
  }, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  useEffect(() => {
    console.log("WalletProvider mounted");
}, []);

  useEffect(() => {
  console.log("========== WALLET PROVIDER ==========");
  console.log("mounted");
  console.log("endpoint:", endpoint);
  console.log(
    "wallet adapters:",
    wallets.map(w => w.name)
  );

  setMounted(true);
}, [endpoint, wallets]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  console.log("Rendering SolanaWalletProvider...");

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider
         wallets={wallets}
         autoConnect
         onError={(error) => console.error("WalletProvider:", error)}
         >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
