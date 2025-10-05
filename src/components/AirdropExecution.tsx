'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Button } from './ui/Button';
import { Send, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

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

interface AirdropExecutionProps {
  selectedToken: TokenInfo | null;
  recipients: AirdropRecipient[];
}

interface TransactionResult {
  recipient: AirdropRecipient;
  success: boolean;
  txId?: string;
  error?: string;
}

export function AirdropExecution({ selectedToken, recipients }: AirdropExecutionProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  const canExecute = selectedToken && recipients.length > 0 && publicKey && signTransaction;

  const executeAirdrop = async () => {
    if (!canExecute || !selectedToken || !publicKey || !signTransaction) return;

    setIsExecuting(true);
    setResults([]);
    const newResults: TransactionResult[] = [];

    try {
      // Check if we have enough balance
      const totalRequired = recipients.reduce((sum, recipient) => {
        return sum + parseFloat(recipient.amount);
      }, 0);

      if (selectedToken.balance < totalRequired) {
        throw new Error('Insufficient token balance for airdrop');
      }

      // Execute transfers in batches
      const batchSize = 5; // Process 5 recipients at a time for Solana
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        setCurrentStep(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(recipients.length / batchSize)}`);

        try {
          const transaction = new Transaction();
          
          for (const recipient of batch) {
            const recipientPublicKey = new PublicKey(recipient.address);
            const amount = Math.floor(parseFloat(recipient.amount) * Math.pow(10, selectedToken.decimals));

            if (selectedToken.mint === 'So11111111111111111111111111111111111111112') {
              // SOL transfer
              transaction.add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: recipientPublicKey,
                  lamports: amount,
                })
              );
            } else {
              // SPL token transfer
              if (!selectedToken.tokenAccount) {
                newResults.push({
                  recipient,
                  success: false,
                  error: 'Token account not found',
                });
                continue;
              }

              const sourceTokenAccount = new PublicKey(selectedToken.tokenAccount);
              const destinationTokenAccount = await getAssociatedTokenAddress(
                new PublicKey(selectedToken.mint),
                recipientPublicKey
              );

              transaction.add(
                createTransferInstruction(
                  sourceTokenAccount,
                  destinationTokenAccount,
                  publicKey,
                  amount
                )
              );
            }
          }

          // Sign and send transaction
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          const signedTransaction = await signTransaction(transaction);
          const txId = await connection.sendRawTransaction(signedTransaction.serialize());

          // Wait for confirmation
          await connection.confirmTransaction(txId);

          // Mark all recipients in this batch as successful
          batch.forEach((recipient) => {
            newResults.push({
              recipient,
              success: true,
              txId,
            });
          });

        } catch (error) {
          // Mark all recipients in this batch as failed
          batch.forEach((recipient) => {
            newResults.push({
              recipient,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          });
        }

        setResults([...newResults]);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error('Airdrop execution error:', error);
      // Mark all remaining recipients as failed
      const remainingRecipients = recipients.slice(results.length);
      remainingRecipients.forEach((recipient) => {
        newResults.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
      setResults([...newResults]);
    } finally {
      setIsExecuting(false);
      setCurrentStep('');
    }
  };

  const successfulTransfers = results.filter(r => r.success).length;
  const failedTransfers = results.filter(r => !r.success).length;

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Execute Airdrop
        </h3>

        {!canExecute ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-800">
                Please connect your wallet, select a token, and upload recipients CSV to proceed.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Airdrop Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Token: {selectedToken.symbol}</p>
                <p>• Recipients: {recipients.length}</p>
                <p>• Total Amount: {recipients.reduce((sum, r) => sum + parseFloat(r.amount), 0).toLocaleString()}</p>
                <p>• Available Balance: {selectedToken.balance.toLocaleString()}</p>
              </div>
            </div>

            <Button
              onClick={executeAirdrop}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing Airdrop...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Airdrop
                </>
              )}
            </Button>

            {isExecuting && currentStep && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-700">{currentStep}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Execution Results</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-800 font-medium">
                  Successful: {successfulTransfers}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-800 font-medium">
                  Failed: {failedTransfers}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-mono text-xs">
                      {result.recipient.address.slice(0, 8)}...{result.recipient.address.slice(-8)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({result.recipient.amount})
                    </span>
                  </div>
                  {result.success && result.txId && (
                    <a
                      href={`https://explorer.solana.com/tx/${result.txId}?cluster=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View TX
                    </a>
                  )}
                </div>
                {!result.success && result.error && (
                  <div className="mt-1 text-xs text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
