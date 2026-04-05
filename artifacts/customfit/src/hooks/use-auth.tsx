import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  getGetMeQueryKey,
  loginPhone,
  type User,
} from "@workspace/api-client-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export const TOKEN_KEY = "customfit_token";

/** When true, no sign-in UI: guest session is created automatically (or mock user if API fails). Set `VITE_DISABLE_AUTH=false` to require real login. */
export const AUTH_DISABLED = import.meta.env.VITE_DISABLE_AUTH === "true";

const GUEST_PHONE = "guest-demo";

const MOCK_USER: User = {
  id: 1,
  phone: "Guest",
  name: null,
  isAdmin: false,
  createdAt: new Date().toISOString(),
};

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
  const [token, setToken] = useState<string | null>(() =>
    typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const [guestFallback, setGuestFallback] = useState(false);
  const bypassStartedRef = useRef(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem(TOKEN_KEY));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(
    (newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setGuestFallback(false);
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    },
    [queryClient],
  );

  const [bypassWaiting, setBypassWaiting] = useState(
    () => AUTH_DISABLED && !localStorage.getItem(TOKEN_KEY),
  );

  useEffect(() => {
    if (!AUTH_DISABLED) return;
    if (localStorage.getItem(TOKEN_KEY)) {
      setBypassWaiting(false);
      return;
    }
    if (bypassStartedRef.current) return;
    bypassStartedRef.current = true;
    setBypassWaiting(true);
    void loginPhone({ phone: GUEST_PHONE })
      .then((d) => {
        login(d.token);
        setBypassWaiting(false);
      })
      .catch(() => {
        setGuestFallback(true);
        setBypassWaiting(false);
      });
  }, [AUTH_DISABLED, login, token]);

  const { data: user, isLoading: meLoading, error } = useGetMe({
    request: getAuthHeaders(),
    query: {
      enabled: Boolean(token) && !guestFallback,
      retry: false,
    },
  });

  const effectiveUser =
    AUTH_DISABLED && guestFallback ? MOCK_USER : user;

  const isAuthenticated =
    AUTH_DISABLED && guestFallback
      ? true
      : Boolean(effectiveUser && token);

  const isLoading =
    bypassWaiting || (Boolean(token) && !guestFallback && meLoading);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setGuestFallback(false);
    bypassStartedRef.current = false;
    queryClient.setQueryData(getGetMeQueryKey(), null);
    queryClient.clear();
    setLocation("/");
  };

  return {
    user: effectiveUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (AUTH_DISABLED) return;
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (AUTH_DISABLED) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
