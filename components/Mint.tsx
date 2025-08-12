import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { getActor } from '../utils/actor';
import { getPrincipal } from '../utils/dev-auth';
import { MintResult } from '../types/token';
import toast from 'react-hot-toast';

interface MintProps {
  onMintComplete: () => void;
}

const Mint: React.FC<MintProps> = ({ onMintComplete }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [checkingCreator, setCheckingCreator] = useState(true);

  useEffect(() => {
    checkCreatorStatus();
  }, []);

  const checkCreatorStatus = async () => {
    try {
      const principal = await getPrincipal();
      if (principal) {
        const actor = await getActor();
        const creatorStatus = await actor.is_creator(principal);
        setIsCreator(creatorStatus);
      }
    } catch (error) {
      console.error('Failed to check creator status:', error);
    } finally {
      setCheckingCreator(false);
    }
  };

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
      
      const result: MintResult = await actor.mint(
        recipientPrincipal, 
        BigInt(Math.floor(amountNum))
      );

      if ('Success' in result) {
        toast.success(`Successfully minted ${amount} tokens!`);
        setRecipient('');
        setAmount('');
        onMintComplete();
      } else if ('Unauthorized' in result) {
        toast.error('Only the token creator can mint new tokens');
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid recipient Principal ID');
      } else {
        toast.error('Minting failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillOwnPrincipal = async () => {
    try {
      const principal = await getPrincipal();
      if (principal) {
        setRecipient(principal.toString());
      }
    } catch (error) {
      console.error('Failed to get own principal:', error);
    }
  };

  if (checkingCreator) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            Only the token creator can mint new tokens. You do not have permission to access this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Mint New Tokens</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
              Recipient Principal ID
            </label>
            <button
              type="button"
              onClick={fillOwnPrincipal}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Use my Principal ID
            </button>
          </div>
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
            Amount to Mint
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to mint..."
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
          {isLoading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-xs text-green-800">
          🌟 <strong>Creator Privilege:</strong> As the token creator, you can mint new tokens 
          to any Principal ID. This will increase the total supply.
        </p>
      </div>
    </div>
  );
};

export default Mint;
