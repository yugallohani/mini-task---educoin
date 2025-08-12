import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { getActor } from '../utils/actor';
import { getPrincipal } from '../utils/auth';
import toast from 'react-hot-toast';

const BalanceChecker: React.FC = () => {
  const [principalId, setPrincipalId] = useState('');
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedPrincipal, setCheckedPrincipal] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!principalId.trim()) {
      toast.error('Please enter a Principal ID');
      return;
    }

    setIsLoading(true);
    setBalance(null);

    try {
      const principal = Principal.fromText(principalId.trim());
      const actor = await getActor();
      
      const userBalance = await actor.get_balance(principal);
      setBalance(userBalance);
      setCheckedPrincipal(principalId.trim());
    } catch (error: any) {
      console.error('Balance check error:', error);
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid Principal ID format');
      } else {
        toast.error('Failed to check balance. Please try again.');
      }
      setBalance(null);
      setCheckedPrincipal('');
    } finally {
      setIsLoading(false);
    }
  };

  const fillOwnPrincipal = async () => {
    try {
      const principal = await getPrincipal();
      if (principal) {
        setPrincipalId(principal.toString());
      } else {
        toast.error('Please log in first');
      }
    } catch (error) {
      console.error('Failed to get own principal:', error);
      toast.error('Failed to get your Principal ID');
    }
  };

  const formatBalance = (balance: bigint) => {
    return balance.toLocaleString();
  };

  const truncatePrincipal = (principal: string) => {
    return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Principal ID copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Check Balance</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="principalId" className="block text-sm font-medium text-gray-700">
              Principal ID
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
            id="principalId"
            value={principalId}
            onChange={(e) => setPrincipalId(e.target.value)}
            placeholder="Enter Principal ID to check balance..."
            className="input-field"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !principalId.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Check Balance'}
        </button>
      </form>

      {/* Balance Result */}
      {balance !== null && checkedPrincipal && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Balance Result</h3>
            <button
              onClick={() => copyToClipboard(checkedPrincipal)}
              className="text-blue-600 hover:text-blue-700 text-xs"
              title="Copy Principal ID"
            >
              📋 Copy ID
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-blue-700">Principal ID:</p>
              <code className="text-sm font-mono text-blue-900">
                {truncatePrincipal(checkedPrincipal)}
              </code>
            </div>
            
            <div>
              <p className="text-xs text-blue-700">Balance:</p>
              <p className="text-lg font-semibold text-blue-900">
                {formatBalance(balance)} Tokens
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> You can check the balance of any Principal ID, 
          including your own or other users' addresses.
        </p>
      </div>
    </div>
  );
};

export default BalanceChecker;
