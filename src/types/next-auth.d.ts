import "next-auth";
import "next-auth/jwt";

// The Google ID token, passed through only long enough for the client to
// exchange it with the backend (see app/api/auth/[...nextauth]/route.ts).
declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
  }
}
