import { useEffect, ReactNode, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

// Wire up the auth token getter once at module load time
setAuthTokenGetter(() => localStorage.getItem('admin_token'));

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000,
      queryKey: getGetMeQueryKey(),
    },
  });

  const logout = () => {
    localStorage.removeItem('admin_token');
    // Invalidate all cached queries so protected data is cleared
    queryClient.clear();
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !error,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
