import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { getIdentity } from './dev-auth';
import { TokenActor } from '../types/token';

// IDL factory for the token canister
const idlFactory = ({ IDL }: any) => {
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
  const TransferResult = IDL.Variant({
    'Success': IDL.Null,
    'InsufficientBalance': IDL.Null,
    'SameAccount': IDL.Null,
  });
  const MintResult = IDL.Variant({
    'Success': IDL.Null,
    'Unauthorized': IDL.Null,
  });
  return IDL.Service({
    'get_token_info': IDL.Func([], [TokenInfo], ['query']),
    'get_balance': IDL.Func([Principal], [IDL.Nat64], ['query']),
    'get_total_supply': IDL.Func([], [IDL.Nat64], ['query']),
    'get_all_users': IDL.Func([], [IDL.Vec(UserInfo)], ['query']),
    'is_creator': IDL.Func([Principal], [IDL.Bool], ['query']),
    'transfer': IDL.Func([Principal, IDL.Nat64], [TransferResult], []),
    'mint': IDL.Func([Principal, IDL.Nat64], [MintResult], []),
  });
};

let actor: TokenActor | null = null;

export const getActor = async (): Promise<TokenActor> => {
  try {
    console.log('🚀 Starting actor creation...');
    
    // Use environment variable or fallback to hardcoded canister ID
    const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_FUNGIBLE_TOKEN_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
    console.log('🎯 Using canister ID:', canisterId);
    
    // Get identity (may be null for anonymous)
    let identity;
    try {
      identity = await getIdentity();
      console.log('🔑 Identity status:', identity ? 'authenticated' : 'anonymous');
    } catch (authError) {
      console.warn('⚠️ Authentication failed, using anonymous identity:', authError);
      identity = null;
    }
    
    // Create agent with proper configuration for local development
    const agent = new HttpAgent({
      identity: identity || undefined,
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false,
      // Add retries for network issues
      retryTimes: 3,
    });

    console.log('🌐 Created agent with 127.0.0.1:4943');

    // Fetch root key for local development
    try {
      await agent.fetchRootKey();
      console.log('✅ Root key fetched successfully');
    } catch (rootKeyError) {
      console.error('❌ Failed to fetch root key:', rootKeyError);
      // Continue anyway, as some queries might still work
    }

    // Create the actor
    const newActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    }) as TokenActor;

    console.log('🎭 Actor created successfully');
    actor = newActor;
    return actor;
  } catch (error) {
    console.error('❌ Failed to create actor:', error);
    throw new Error(`Actor creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const resetActor = () => {
  actor = null;
};
