export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isBlocked: boolean;
  isVerified: boolean;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
