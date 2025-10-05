'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { PublicKey } from '@solana/web3.js';
import { Button } from './ui/Button';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface AirdropRecipient {
  address: string;
  amount: string;
  row: number;
}

interface CSVUploadProps {
  onRecipientsChange: (recipients: AirdropRecipient[]) => void;
}

export function CSVUpload({ onRecipientsChange }: CSVUploadProps) {
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAddress = (address: string): boolean => {
    try {
      // Try to create a PublicKey to validate the address
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const validateAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const newRecipients: AirdropRecipient[] = [];
        const newErrors: string[] = [];

        data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because CSV is 1-indexed and we skip header
          
          // Detect CSV format - support both formats:
          // Format 1 (Standard): wallet, amount
          // Format 2 (Legacy): solanaWalletAddr, solanaTokens
          const addressKey = Object.keys(row).find(key => 
            key.toLowerCase() === 'wallet' || key.toLowerCase() === 'solanawalletaddr'
          );
          const amountKey = Object.keys(row).find(key => 
            key.toLowerCase() === 'amount' || key.toLowerCase() === 'solanatokens'
          );

          if (!addressKey) {
            newErrors.push(`Row ${rowNumber}: No valid address column found. Please include either 'wallet' or 'solanaWalletAddr' column.`);
            return;
          }

          if (!amountKey) {
            newErrors.push(`Row ${rowNumber}: No valid amount column found. Please include either 'amount' or 'solanaTokens' column.`);
            return;
          }

          const address = row[addressKey]?.toString().trim();
          const amount = row[amountKey]?.toString().trim();

          // Skip rows where address is missing
          if (!address) {
            console.log(`Row ${rowNumber}: Skipping row - address is missing`);
            return;
          }

          // Skip rows where amount is missing or 0
          if (!amount || amount === '0' || amount === '') {
            console.log(`Row ${rowNumber}: Skipping row - amount is missing or 0`);
            return;
          }

          if (!validateAddress(address)) {
            newErrors.push(`Row ${rowNumber}: Invalid Solana address format: ${address}`);
            return;
          }

          if (!validateAmount(amount)) {
            newErrors.push(`Row ${rowNumber}: Invalid amount: ${amount}`);
            return;
          }

          newRecipients.push({
            address,
            amount,
            row: rowNumber,
          });
        });

        setRecipients(newRecipients);
        setErrors(newErrors);
        onRecipientsChange(newRecipients);
      },
      error: (error) => {
        setErrors([`CSV parsing error: ${error.message}`]);
      }
    });
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['Please select a CSV file']);
      return;
    }
    parseCSV(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearData = () => {
    setRecipients([]);
    setErrors([]);
    onRecipientsChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalAmount = recipients.reduce((sum, recipient) => {
    return sum + parseFloat(recipient.amount);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Recipients CSV
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a CSV file with recipient addresses and amounts. The CSV must have these columns:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li><strong>wallet</strong> - Solana wallet addresses (Base58 format) - rows with missing values will be skipped</li>
            <li><strong>amount</strong> - Token amounts to distribute - rows with missing or 0 values will be skipped</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Example CSV format: wallet,amount
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {recipients.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">
                CSV Successfully Parsed
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• {recipients.length} valid recipients found</p>
                <p>• Total amount to distribute: {totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearData}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {recipients.length > 0 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Recipients Preview (First 10)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Address</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recipients.slice(0, 10).map((recipient, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-mono text-xs">
                      {recipient.address.slice(0, 8)}...{recipient.address.slice(-8)}
                    </td>
                    <td className="text-right py-2">{recipient.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipients.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                ... and {recipients.length - 10} more recipients
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
