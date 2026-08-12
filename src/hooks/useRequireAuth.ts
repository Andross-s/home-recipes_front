"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";

/**
 * Redirects to /login once the auth bootstrap finishes and no user is
 * signed in. Returns the same {user, isLoading} pair as useAuth() so a page
 * can render a loading state until the redirect (or the real content) lands.
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  return { user, isLoading };
}
