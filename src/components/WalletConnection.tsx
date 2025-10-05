'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/Button';
import { Wallet } from 'lucide-react';

export function WalletConnection() {
  const { 
    connected, 
    connecting, 
    disconnect, 
    publicKey,
    wallet
  } = useWallet();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  console.log('WalletConnection Debug:', {
    connected,
    connecting,
    publicKey: publicKey?.toString(),
    walletName: wallet?.adapter.name,
    mounted
  });

  if (!mounted) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Loading wallet detection...</span>
        </div>
      </div>
    );
  }

  if (connected && wallet) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Connected: {wallet.adapter.name}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Disconnect
          </Button>
        </div>
        {publicKey && (
          <div className="mt-2 text-xs text-green-700 font-mono">
            {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5" />
        Connect Your Wallet
      </h3>
      <p className="text-gray-600 mb-6">
        Connect your wallet to start distributing tokens on the Solana network.
      </p>
      
      <div className="space-y-4">
        {/* Primary Connect Button */}
        <div className="text-center">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !rounded-md !px-4 !py-2 !transition-colors" />
        </div>
        
        {/* Debug Information (Collapsible) */}
        <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <summary className="text-xs text-gray-600 cursor-pointer font-medium">
            Debug Information (Click to expand)
          </summary>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">
              Connected: {connected ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Connecting: {connecting ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Wallet Name: {wallet?.adapter.name || 'None'}
            </p>
            <p className="text-xs text-gray-600">
              Public Key: {publicKey?.toString() || 'None'}
            </p>
            <p className="text-xs text-gray-600">
              Mounted: {mounted ? 'Yes' : 'No'}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
