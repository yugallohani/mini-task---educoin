import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Transfer from '../components/Transfer';
import Mint from '../components/Mint';
import Explorer from '../components/Explorer';
import BalanceChecker from '../components/BalanceChecker';
import Debug from '../components/Debug';

export default function Home() {
  const [activeTab, setActiveTab] = useState('explorer');
  const { isAuth, isLoading } = useAuth();

  const handleDataUpdate = () => {
    // Force refresh of data by triggering re-renders
    // This will be called after transfers and mints to update displays
    setActiveTab(prev => prev); // Trigger re-render
  };

  const tabs = [
    { id: 'explorer', name: 'Token Explorer', icon: '🔍', description: 'View all token holders' },
    { id: 'balance', name: 'Check Balance', icon: '💰', description: 'Check any user\'s balance' },
    { id: 'transfer', name: 'Transfer', icon: '📤', description: 'Send tokens to others', requiresAuth: true },
    { id: 'mint', name: 'Mint', icon: '⚡', description: 'Create new tokens', requiresAuth: true },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'explorer':
        return <Explorer key="explorer" />;
      case 'balance':
        return <BalanceChecker key="balance" />;
      case 'transfer':
        return isAuth ? <Transfer key="transfer" onTransferComplete={handleDataUpdate} /> : <LoginRequired />;
      case 'mint':
        return isAuth ? <Mint key="mint" onMintComplete={handleDataUpdate} /> : <LoginRequired />;
      default:
        return <Explorer key="explorer" />;
    }
  };

  const LoginRequired = () => (
    <div className="card">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-4">
          Please log in with your Internet Identity to access this feature.
        </p>
        <p className="text-sm text-gray-500">
          Click the "Login with Internet Identity" button in the top right corner.
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>EduCoin Token System</title>
        <meta name="description" content="A fungible token system built on the Internet Computer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduCoin Token System</h1>
          <p className="text-lg text-gray-600">
            A decentralized fungible token built on the Internet Computer Protocol
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled = tab.requiresAuth && !isAuth;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${isActive 
                        ? 'border-primary-500 text-primary-600' 
                        : isDisabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    disabled={isDisabled}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                    {isDisabled && <span className="text-xs">🔒</span>}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>

        {/* Debug Panel (optional) */}
        {process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' && (
          <div className="mb-8">
            <Debug />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-8 border-t border-gray-200">
          <p>Built on the Internet Computer Protocol</p>
          <p className="mt-1">
            Powered by Internet Identity for secure authentication
          </p>
        </footer>
      </main>
    </div>
  );
}
