'use client';

import { useState } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { TokenSelection } from '@/components/TokenSelection';
import { CSVUpload } from '@/components/CSVUpload';
import { AirdropExecution } from '@/components/AirdropExecution';
import { Gift } from 'lucide-react';

interface AirdropRecipient {
  address: string;
  amount: string;
  row: number;
}

interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string;
  balance: number;
  tokenAccount?: string;
}

export default function Home() {
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);

  const handleRecipientsChange = (newRecipients: AirdropRecipient[]) => {
    setRecipients(newRecipients);
  };

  const handleTokenSelect = (tokenInfo: TokenInfo) => {
    setSelectedToken(tokenInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Solana Airdrop Tool</h1>
            </div>
            <p className="text-lg text-gray-600">
              Distribute tokens to multiple addresses on the Solana network
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-6">
            {/* Step 1: Wallet Connection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 1: Connect Your Wallet
                </h2>
                <WalletConnection />
              </div>
            </div>

            {/* Step 2: Token Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 2: Select Token to Distribute
                </h2>
                <TokenSelection onTokenSelect={handleTokenSelect} />
              </div>
            </div>

            {/* Step 3: CSV Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 3: Upload Recipients CSV
                </h2>
                <CSVUpload onRecipientsChange={handleRecipientsChange} />
              </div>
            </div>

            {/* Step 4: Execute Airdrop */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 4: Execute Airdrop
                </h2>
                <AirdropExecution
                  selectedToken={selectedToken}
                  recipients={recipients}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Built with Next.js and Solana Web3.js. Use at your own risk.
            </p>
            <p className="mt-2">
              Make sure you have sufficient SOL for transaction fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
