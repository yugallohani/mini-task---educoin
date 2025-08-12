const { Actor, HttpAgent } = require('@dfinity/agent');

const idlFactory = ({ IDL }) => {
  const Principal = IDL.Principal;
  const TokenInfo = IDL.Record({
    'name': IDL.Text,
    'symbol': IDL.Text,
    'total_supply': IDL.Nat64,
    'creator': Principal,
  });
  const UserInfo = IDL.Record({
    'user_principal': Principal,
    'balance': IDL.Nat64,
  });
  return IDL.Service({
    'get_token_info': IDL.Func([], [TokenInfo], ['query']),
    'get_all_users': IDL.Func([], [IDL.Vec(UserInfo)], ['query']),
  });
};

async function testConnection() {
  try {
    console.log('🔍 Testing connection to backend...');
    
    const agent = new HttpAgent({
      host: 'http://localhost:4943',
    });
    
    console.log('✅ Agent created');
    
    // Fetch root key for certificate validation when running locally
    await agent.fetchRootKey();
    console.log('✅ Root key fetched');
    
    const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
    console.log(`🎯 Connecting to canister: ${canisterId}`);
    
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
    
    console.log('✅ Actor created');
    
    console.log('📊 Testing get_token_info...');
    const tokenInfo = await actor.get_token_info();
    console.log('Token Info:', tokenInfo);
    
    console.log('👥 Testing get_all_users...');
    const users = await actor.get_all_users();
    console.log('Users:', users);
    
    console.log('🎉 SUCCESS! Connection working perfectly!');
    
  } catch (error) {
    console.log('❌ CONNECTION FAILED:', error);
    console.log('Error details:', error.message);
  }
}

testConnection();
