import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey, type User } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export const TOKEN_KEY = "customfit_token";

export function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return undefined;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem(TOKEN_KEY));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: user, isLoading, error } = useGetMe({
    request: getAuthHeaders(),
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.clear();
    setLocation("/");
  };

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    error
  };
}

// Higher order component for protected routes
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
