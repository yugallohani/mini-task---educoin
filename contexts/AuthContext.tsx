import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Principal } from '@dfinity/principal';
import { isAuthenticated, getPrincipal } from '../utils/dev-auth';
import { getActor } from '../utils/actor';

interface AuthContextType {
  isAuth: boolean;
  principal: Principal | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refreshing authentication state...');
      const authenticated = await isAuthenticated();
      console.log('🔐 Authentication result:', authenticated);
      
      setIsAuth(authenticated);
      
      if (authenticated) {
        const userPrincipal = await getPrincipal();
        console.log('👤 User principal:', userPrincipal?.toString());
        setPrincipal(userPrincipal);
        
        // Initialize user with welcome bonus (1000 EDU tokens)
        try {
          const actor = await getActor();
          const balance = await actor.init_user();
          console.log('🎁 User initialized with balance:', balance.toString(), 'EDU tokens');
        } catch (initError) {
          console.warn('⚠️ Failed to initialize user with welcome bonus:', initError);
        }
      } else {
        setPrincipal(null);
      }
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      setIsAuth(false);
      setPrincipal(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    
    // Set up periodic auth check
    const interval = setInterval(refreshAuth, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    isAuth,
    principal,
    isLoading,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
