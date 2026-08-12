"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearTokens, getAccessToken, setTokens, subscribeToAccessToken } from "@/lib/api";
import { addFavorite, removeFavorite } from "@/lib/recipes";
import type { User, UserRole } from "@/types/auth";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  // Mirrors lib/api.ts's in-memory token into React state — apiFetch is the
  // source of truth (it also rewrites the token during a background 401
  // refresh), this just makes that value observable to components.
  useEffect(() => subscribeToAccessToken(setAccessTokenState), []);

  useEffect(() => {
    let cancelled = false;

    // No access token exists yet on load (it's memory-only); this call 401s
    // and lets apiFetch's built-in refresh flow try the stored refresh token —
    // this is the "silent login" that survives a page reload.
    api
      .get<{ user: User }>("/users/me")
      .then(({ user: me }) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      { auth: false },
    );
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser(result.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.post("/auth/register", { name, email, password }, { auth: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Session may already be gone server-side; local state clears regardless.
    }
    clearTokens();
    setUser(null);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await api.get<void>(`/auth/verify-email/${encodeURIComponent(token)}`, { auth: false });
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await api.post("/auth/resend-verification", { email }, { auth: false });
  }, []);

  // Optimistic toggle so the heart flips instantly; rolls back on failure.
  // Kept in AuthContext (not the favorite button) since `user.favorites` is
  // the single source of truth other pages (e.g. a future favorites list)
  // will also read from.
  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) return;

      const wasFavorited = user.favorites.includes(recipeId);
      const previousUser = user;
      setUser({
        ...user,
        favorites: wasFavorited
          ? user.favorites.filter((id) => id !== recipeId)
          : [...user.favorites, recipeId],
      });

      try {
        await (wasFavorited ? removeFavorite(recipeId) : addFavorite(recipeId));
      } catch (error) {
        setUser(previousUser);
        throw error;
      }
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: user !== null,
      isLoading,
      role: user?.role ?? null,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      toggleFavorite,
    }),
    [
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout,
      verifyEmail,
      resendVerification,
      toggleFavorite,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
