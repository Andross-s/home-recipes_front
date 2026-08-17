import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Auth.js is used only to perform the Google OAuth handshake and obtain a
// Google ID token — no adapter, no persisted Auth.js session. Once the
// client reads `session.idToken`, it exchanges it with the backend
// (POST /auth/oauth/google) for our own accessToken/refreshToken, which is
// the app's actual source of truth from then on.
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // `account` (and its id_token) is only present on the initial sign-in
      // callback, not on subsequent JWT refreshes — so idToken naturally
      // disappears from the session again after the client consumes it once.
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
