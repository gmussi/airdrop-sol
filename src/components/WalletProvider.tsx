'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WalletContextType {
  // Future: Add wallet-specific context values here
  // For example: selectedToken, transactionHistory, etc.
}

const WalletContext = createContext<WalletContextType>({});

export const useWalletContext = () => useContext(WalletContext);

interface AppWalletProviderProps {
  children: ReactNode;
}

export function AppWalletProvider({ children }: AppWalletProviderProps) {
  // Using mainnet for production deployment

  // Use Helius RPC endpoint with API key for better reliability
  const endpoint = useMemo(() => {
    // Using Helius RPC with API key for unlimited requests and better performance
    return 'https://mainnet.helius-rpc.com/?api-key=5109e041-bdb2-4d79-a330-afacf4eac699';
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <WalletContext.Provider value={{}}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
