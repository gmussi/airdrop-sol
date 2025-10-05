'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from './ui/Button';
import { Coins, Wallet } from 'lucide-react';
import Image from 'next/image';

interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string;
  balance: number;
  tokenAccount?: string;
}

interface TokenSelectionProps {
  onTokenSelect: (tokenInfo: TokenInfo) => void;
}

// Whitelisted tokens (popular Solana tokens)
const WHITELISTED_TOKENS = [
  {
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    iconUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    iconUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    iconUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
  },
  {
    mint: 'J9SXKctbZVws65vjBHL91mqStzq5an1xZxdi6a4h853o',
    symbol: 'HODL',
    name: 'Half Orange Drinking Lemonade',
    decimals: 6,
    iconUrl: undefined // Add icon URL if available
  }
];

export function TokenSelection({ onTokenSelect }: TokenSelectionProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [rpcError, setRpcError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!publicKey || !connected) {
      console.log('Cannot fetch tokens - missing publicKey or not connected:', { publicKey: !!publicKey, connected });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching tokens for address:', publicKey.toString());
      
      const tokenInfos: TokenInfo[] = [];
      
      // Get SOL balance
      console.log('Fetching SOL balance...');
      const solBalance = await connection.getBalance(publicKey);
      console.log('SOL balance (lamports):', solBalance);
      
      const solInfo: TokenInfo = {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        iconUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        balance: solBalance / 1e9
      };
      
      console.log('SOL info:', solInfo);
      
      if (solInfo.balance > 0) {
        tokenInfos.push(solInfo);
        console.log('Added SOL to token list');
      }
      
      // Get SPL token accounts
      console.log('Fetching SPL token accounts...');
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      
      console.log('Found', tokenAccounts.value.length, 'token accounts');
      
      for (const { account } of tokenAccounts.value) {
        const tokenAccount = account.data.parsed.info;
        const mint = tokenAccount.mint;
        const balance = tokenAccount.tokenAmount.uiAmount;
        
        console.log('Processing token:', { mint, balance, symbol: tokenAccount.tokenAmount.symbol });
        
        // Check if this token is whitelisted
        const whitelistedToken = WHITELISTED_TOKENS.find(t => t.mint === mint);
        if (whitelistedToken && balance > 0) {
          const tokenInfo: TokenInfo = {
            mint,
            symbol: whitelistedToken.symbol,
            name: whitelistedToken.name,
            decimals: whitelistedToken.decimals,
            iconUrl: whitelistedToken.iconUrl,
            balance: balance,
            tokenAccount: tokenAccount.address
          };
          tokenInfos.push(tokenInfo);
          console.log('Added whitelisted token:', tokenInfo);
        } else if (balance > 0) {
          console.log('Skipped non-whitelisted token with balance:', { mint, balance });
        }
      }
      
      console.log('Final token list:', tokenInfos);
      setTokens(tokenInfos);
      
    } catch (error) {
      console.error('Error fetching tokens:', error);
      
      // Handle specific RPC errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('403')) {
        const errorMsg = 'RPC Access Forbidden - try using a different RPC endpoint or API key';
        console.error(errorMsg);
        setRpcError(errorMsg);
      } else if (errorMessage.includes('429')) {
        const errorMsg = 'Rate limit exceeded - try again later';
        console.error(errorMsg);
        setRpcError(errorMsg);
      } else if (errorMessage.includes('500')) {
        const errorMsg = 'RPC server error - try again later';
        console.error(errorMsg);
        setRpcError(errorMsg);
      } else {
        setRpcError(`RPC Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    if (publicKey && connected) {
      fetchTokens();
    }
  }, [publicKey, connected, fetchTokens]);

  const formatBalance = (balance: number, decimals: number) => {
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals > 6 ? 6 : decimals
    });
  };

  if (!publicKey || !connected) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <Wallet className="w-5 h-5" />
          <span>Please connect your wallet first</span>
        </div>
        
        {/* Debug Information */}
        <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <summary className="text-xs text-gray-600 cursor-pointer font-medium">
            Debug Information (Click to expand)
          </summary>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">
              Connected: {connected ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Public Key: {publicKey?.toString() || 'None'}
            </p>
          </div>
        </details>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Loading your tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Select Token to Distribute
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTokens}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {tokens.length === 0 ? (
          <div className="space-y-2">
            {rpcError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">RPC Error</span>
                </div>
                <p className="text-sm text-red-700">{rpcError}</p>
                <p className="text-xs text-red-600 mt-2">
                  Try refreshing the page or check your internet connection.
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">Need better RPC access?</p>
                  <p className="text-xs text-blue-700">
                    Get a free API key from{' '}
                    <a href="https://helius.xyz/" target="_blank" rel="noopener noreferrer" className="underline">
                      Helius
                    </a>
                    {' '}or{' '}
                    <a href="https://quicknode.com/" target="_blank" rel="noopener noreferrer" className="underline">
                      QuickNode
                    </a>
                    {' '}for unlimited requests.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No tokens found in your wallet</p>
            )}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Manual token fetch triggered');
                  setRpcError(null); // Clear previous error
                  fetchTokens();
                }}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Manual Fetch'}
              </Button>
            </div>
            <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <summary className="text-xs text-gray-600 cursor-pointer font-medium">
                Debug Token Fetching (Click to expand)
              </summary>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  Public Key: {publicKey?.toString() || 'None'}
                </p>
                <p className="text-xs text-gray-600">
                  Connected: {connected ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-gray-600">
                  Loading: {loading ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-gray-600">
                  Tokens Array Length: {tokens.length}
                </p>
                <p className="text-xs text-gray-600">
                  Network: mainnet
                </p>
                <p className="text-xs text-gray-600">
                  Last Fetch Attempt: {loading ? 'In Progress' : 'Completed'}
                </p>
                {tokens.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <p>Found Tokens:</p>
                    <ul className="ml-2">
                      {tokens.map((token, index) => (
                        <li key={index}>
                          {token.symbol}: {token.balance.toFixed(6)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.mint}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedToken?.mint === token.mint
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedToken(token);
                  onTokenSelect(token);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.iconUrl ? (
                      <Image
                        src={token.iconUrl}
                        alt={token.symbol}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Coins className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {token.symbol}
                      </div>
                      <div className="text-sm text-gray-500">
                        {token.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatBalance(token.balance, token.decimals)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedToken?.mint === token.mint ? 'Selected' : 'Click to select'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
