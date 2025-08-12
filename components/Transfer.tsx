import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { getActor } from '../utils/actor';
import { TransferResult } from '../types/token';
import toast from 'react-hot-toast';

interface TransferProps {
  onTransferComplete: () => void;
}

const Transfer: React.FC<TransferProps> = ({ onTransferComplete }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient.trim() || !amount.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      const recipientPrincipal = Principal.fromText(recipient.trim());
      const actor = await getActor();
      
      const result: TransferResult = await actor.transfer(
        recipientPrincipal, 
        BigInt(Math.floor(amountNum))
      );

      if ('Success' in result) {
        toast.success(`Successfully transferred ${amount} tokens!`);
        setRecipient('');
        setAmount('');
        onTransferComplete();
      } else if ('InsufficientBalance' in result) {
        toast.error('Insufficient balance for this transfer');
      } else if ('SameAccount' in result) {
        toast.error('Cannot transfer to the same account');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid recipient Principal ID');
      } else {
        toast.error('Transfer failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Transfer Tokens</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Principal ID
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient's Principal ID..."
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to transfer..."
            min="1"
            step="1"
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recipient.trim() || !amount.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Transferring...' : 'Send Tokens'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Make sure you have the correct Principal ID. 
          Transfers cannot be reversed once confirmed.
        </p>
      </div>
    </div>
  );
};

export default Transfer;
