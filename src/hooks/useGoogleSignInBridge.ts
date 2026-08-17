"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";

interface GoogleSignInBridge {
  /** Set once the backend rejects the exchanged Google ID token. */
  error: ApiError | null;
  /** True while the Google ID token is being exchanged for our own tokens. */
  isExchanging: boolean;
}

// After signIn("google") completes its full-page redirect back to this page,
// Auth.js has a session holding a Google ID token (see the jwt/session
// callbacks in app/api/auth/[...nextauth]/route.ts). This hook picks that
// token up exactly once and exchanges it with the backend for our own
// accessToken/refreshToken — from then on the app runs entirely on
// AuthContext, and the Auth.js session can be ignored.
export function useGoogleSignInBridge(): GoogleSignInBridge {
  const { data: session, status } = useSession();
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const exchangedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const idToken = session?.idToken;
    if (status !== "authenticated" || !idToken || idToken === exchangedTokenRef.current) {
      return;
    }
    exchangedTokenRef.current = idToken;

    setIsExchanging(true);
    setError(null);
    loginWithGoogle(idToken)
      .then(() => {
        router.push("/");
      })
      .catch((caughtError) => {
        if (caughtError instanceof ApiError) {
          setError(caughtError);
        }
      })
      .finally(() => {
        setIsExchanging(false);
      });
  }, [session?.idToken, status, loginWithGoogle, router]);

  return { error, isExchanging };
}
