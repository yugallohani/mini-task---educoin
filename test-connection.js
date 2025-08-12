// Quick test to verify frontend can connect to backend
const { Actor, HttpAgent } = require('@dfinity/agent');

const idlFactory = ({ IDL }) => {
  const Principal = IDL.Principal;
  const TokenInfo = IDL.Record({
    'name': IDL.Text,
    'symbol': IDL.Text,
    'total_supply': IDL.Nat64,
    'creator': Principal,
  });
  return IDL.Service({
    'get_token_info': IDL.Func([], [TokenInfo], ['query']),
  });
};

async function testConnection() {
  try {
    const agent = new HttpAgent({
      host: 'http://localhost:4943',
    });
    
    // Fetch root key for certificate validation when running locally
    await agent.fetchRootKey();
    
    const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
    
    const tokenInfo = await actor.get_token_info();
    console.log('✅ Connection successful!');
    console.log('Token Info:', tokenInfo);
    
  } catch (error) {
    console.log('❌ Connection failed:', error);
  }
}

testConnection();
