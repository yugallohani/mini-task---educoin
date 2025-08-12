import { AuthClient } from '@dfinity/auth-client';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

let authClient: AuthClient | null = null;

export const initAuth = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

export const login = async (): Promise<boolean> => {
  const client = await initAuth();

  // For local development, let's use a more explicit approach
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname.includes('.localhost') ||
     window.location.hostname === '127.0.0.1');

  console.log('🔐 Environment check:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    isLocal,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  });

  const identityProvider = isLocal
    ? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
    : 'https://identity.ic0.app';
  
  console.log('🌐 Using identity provider:', identityProvider);
  
  return new Promise((resolve) => {
    client.login({
      identityProvider,
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
      onSuccess: () => {
        console.log('✅ Internet Identity login successful');
        resolve(true);
      },
      onError: (error) => {
        console.error('❌ Internet Identity login failed:', error);
        console.error('🔍 Error details:', {
          error,
          identityProvider,
          isLocal,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
        });
        resolve(false);
      },
    });
  });
};

// Alternative simple login for development
export const devLogin = async (): Promise<boolean> => {
  try {
    console.log('🧪 Attempting development login...');
    
    const client = await initAuth();
    
    // Check if already authenticated
    if (await client.isAuthenticated()) {
      console.log('✅ Already authenticated');
      return true;
    }
    
    // For local development, try different approaches
    const identityProviders = [
      'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943',
      'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
      'http://127.0.0.1:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai'
    ];
    
    for (const provider of identityProviders) {
      console.log(`🔄 Trying provider: ${provider}`);
      
      try {
        const result = await new Promise<boolean>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.log('⏰ Login timeout for provider:', provider);
            resolve(false);
          }, 10000); // 10 second timeout
          
          client.login({
            identityProvider: provider,
            maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
            onSuccess: () => {
              clearTimeout(timeoutId);
              console.log('✅ Login successful with provider:', provider);
              resolve(true);
            },
            onError: (error) => {
              clearTimeout(timeoutId);
              console.log('❌ Login failed with provider:', provider, error);
              resolve(false);
            },
          });
        });
        
        if (result) {
          return true;
        }
      } catch (error) {
        console.log('🚫 Provider failed:', provider, error);
        continue;
      }
    }
    
    console.log('❌ All providers failed');
    return false;
    
  } catch (error) {
    console.error('🚨 Development login failed:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  const client = await initAuth();
  await client.logout();
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const client = await initAuth();
    return await client.isAuthenticated();
  } catch (error) {
    console.warn('Auth check failed:', error);
    return false;
  }
};

export const getIdentity = async (): Promise<Identity | null> => {
  try {
    const client = await initAuth();
    if (await client.isAuthenticated()) {
      return client.getIdentity();
    }
    return null;
  } catch (error) {
    console.warn('Get identity failed:', error);
    return null;
  }
};

export const getPrincipal = async (): Promise<Principal | null> => {
  try {
    const identity = await getIdentity();
    return identity ? identity.getPrincipal() : null;
  } catch (error) {
    console.warn('Get principal failed:', error);
    return null;
  }
};
