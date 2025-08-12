import React, { useState } from 'react';
import { getActor } from '../utils/actor';
import { getIdentity, isAuthenticated } from '../utils/auth';
import toast from 'react-hot-toast';

const Debug: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testConnection = async () => {
    addResult('🔧 Starting connection test...');
    
    try {
      // Test authentication status
      const authenticated = await isAuthenticated();
      addResult(`🔑 Authentication status: ${authenticated ? 'Authenticated' : 'Anonymous'}`);
      
      // Test identity
      const identity = await getIdentity();
      addResult(`👤 Identity: ${identity ? 'Present' : 'None'}`);
      
      if (identity) {
        addResult(`📝 Principal: ${identity.getPrincipal().toString()}`);
      }
      
      // Test actor creation
      addResult('🎭 Creating actor...');
      const actor = await getActor();
      addResult('✅ Actor created successfully');
      
      // Test simple query
      addResult('📊 Testing get_token_info...');
      const tokenInfo = await actor.get_token_info();
      addResult(`✅ Token info retrieved: ${tokenInfo.name} (${tokenInfo.symbol})`);
      
      // Test get_all_users
      addResult('👥 Testing get_all_users...');
      const users = await actor.get_all_users();
      addResult(`✅ Users retrieved: ${users.length} users found`);
      
      toast.success('All tests passed!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`❌ Error: ${errorMessage}`);
      console.error('Debug test error:', error);
      toast.error('Test failed - check console for details');
    }
  };

  const testJustActor = async () => {
    addResult('🎭 Testing just actor creation and token info...');
    
    try {
      const actor = await getActor();
      const tokenInfo = await actor.get_token_info();
      addResult(`✅ Basic test successful: ${tokenInfo.name}`);
      toast.success('Basic test passed!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`❌ Basic test failed: ${errorMessage}`);
      toast.error('Basic test failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Tools</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testJustActor}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Basic Connection
        </button>
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Full Connection Test
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="font-medium mb-2">Test Results:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500 text-sm">No tests run yet</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Debug;
