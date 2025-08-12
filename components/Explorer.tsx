import React, { useState, useEffect } from 'react';
import { getActor } from '../utils/actor';
import { getIdentity } from '../utils/dev-auth';
import { UserInfo, TokenInfo } from '../types/token';
import toast from 'react-hot-toast';

const Explorer: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Starting to load data...');
      const actor = await getActor();
      console.log('✅ Actor created successfully');
      
      console.log('📊 Fetching token info and users...');
      const [allUsers, info] = await Promise.all([
        actor.get_all_users(),
        actor.get_token_info()
      ]);
      
      console.log('📈 Raw data received:');
      console.log('- Users:', allUsers);
      console.log('- Token Info:', info);
      
      // Sort users by balance (highest first)
      const sortedUsers = allUsers.sort((a, b) => 
        Number(b.balance) - Number(a.balance)
      );
      
      console.log('✅ Setting state with sorted users:', sortedUsers.length);
      setUsers(sortedUsers);
      setTokenInfo(info);
      toast.success('Data loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load explorer data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      toast.error('Failed to load user data: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAccount = async () => {
    try {
      const actor = await getActor();
      const identity = await getIdentity();
      if (identity) {
        // Try to get balance first - this will create the user if they don't exist
        await actor.get_balance(identity.getPrincipal());
        toast.success('Account initialized! Refreshing data...');
        loadData();
      } else {
        toast.error('Please log in first');
      }
    } catch (error) {
      console.error('Failed to initialize account:', error);
      toast.error('Failed to initialize account');
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

  const filteredUsers = users.filter(user =>
    user.user_principal.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHolders = users.length;
  const activeHolders = users.filter(user => user.balance > 0n).length;

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading explorer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Token Explorer</h2>
        <button
          onClick={loadData}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
        >
          <span className="mr-1">🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Supply</p>
          <p className="text-lg font-semibold text-gray-900">
            {tokenInfo ? formatBalance(tokenInfo.total_supply) : '---'} {tokenInfo?.symbol}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Holders</p>
          <p className="text-lg font-semibold text-gray-900">{totalHolders}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active Holders</p>
          <p className="text-lg font-semibold text-gray-900">{activeHolders}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Principal ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Principal ID
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Share %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No users found matching your search.' : 'No token holders found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => {
                const sharePercentage = tokenInfo 
                  ? ((Number(user.balance) / Number(tokenInfo.total_supply)) * 100).toFixed(2)
                  : '0';
                
                const isCreator = tokenInfo && user.user_principal.toString() === tokenInfo.creator.toString();
                
                return (
                  <tr key={user.user_principal.toString()} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{index + 1}
                      {isCreator && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Creator
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm text-gray-900 font-mono">
                          {truncatePrincipal(user.user_principal.toString())}
                        </code>
                        <button
                          onClick={() => copyToClipboard(user.user_principal.toString())}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy full Principal ID"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                      {formatBalance(user.balance)} {tokenInfo?.symbol}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {sharePercentage}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing {filteredUsers.length} of {totalHolders} holders
        </div>
      )}
    </div>
  );
};

export default Explorer;
