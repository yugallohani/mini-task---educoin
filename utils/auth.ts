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

  // Choose identity provider based on environment
  // - When running locally with dfx (localhost:4943), use the local II canister
  // - Otherwise use the production Internet Identity
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('.localhost'));
  const identityProvider = isLocal
    ? `http://${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}.localhost:4943` // Local II
    : 'https://identity.ic0.app'; // Production II
  
  return new Promise((resolve) => {
    client.login({
      identityProvider,
      onSuccess: () => {
        console.log('✅ Internet Identity login successful');
        resolve(true);
      },
      onError: (error) => {
        console.error('❌ Internet Identity login failed:', error);
        resolve(false);
      },
    });
  });
};

export const logout = async (): Promise<void> => {
  const client = await initAuth();
  await client.logout();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const client = await initAuth();
  return await client.isAuthenticated();
};

export const getIdentity = async (): Promise<Identity | null> => {
  const client = await initAuth();
  if (await client.isAuthenticated()) {
    return client.getIdentity();
  }
  return null;
};

export const getPrincipal = async (): Promise<Principal | null> => {
  const identity = await getIdentity();
  return identity ? identity.getPrincipal() : null;
};
