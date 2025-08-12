import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { login, logout } from '../utils/dev-auth';
import { getActor, resetActor } from '../utils/actor';
import { TokenInfo } from '../types/token';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { isAuth, principal, refreshAuth } = useAuth();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (principal) {
      loadUserData(principal);
    }
  }, [principal]);

  const loadUserData = async (userPrincipal: Principal) => {
    try {
      const actor = await getActor();
      const [userBalance, info] = await Promise.all([
        actor.get_balance(userPrincipal),
        actor.get_token_info()
      ]);
      setBalance(userBalance);
      setTokenInfo(info);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login();
      if (success) {
        resetActor(); // Reset actor to use authenticated identity
        toast.success('Successfully logged in!');
        await refreshAuth(); // Refresh the global auth state
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetActor();
      setBalance(null);
      setTokenInfo(null);
      toast.success('Successfully logged out!');
      await refreshAuth(); // Refresh the global auth state
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const formatBalance = (balance: bigint) => {
    return balance.toLocaleString();
  };

  const truncatePrincipal = (principal: Principal) => {
    const text = principal.toString();
    return `${text.slice(0, 5)}...${text.slice(-5)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Token Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {tokenInfo?.symbol || 'T'}
                </span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  {tokenInfo?.name || 'Token System'}
                </h1>
                {tokenInfo && (
                  <p className="text-sm text-gray-500">
                    Total Supply: {formatBalance(tokenInfo.total_supply)} {tokenInfo.symbol}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Info and Auth */}
          <div className="flex items-center space-x-4">
            {isAuth && principal ? (
              <div className="flex items-center space-x-4">
                {/* User Balance */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {balance !== null ? formatBalance(balance) : '---'} {tokenInfo?.symbol || 'Tokens'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {truncatePrincipal(principal)}
                  </p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Login with Internet Identity'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
