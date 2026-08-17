import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { User, UserRole } from "@/types/auth";

export interface UserListParams {
  role?: UserRole;
  search?: string;
  page?: number;
  perPage?: number;
}

export async function getUsers(params: UserListParams = {}): Promise<PaginatedResult<User>> {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  const qs = query.toString();
  return api.get<PaginatedResult<User>>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const { user } = await api.patch<{ user: User }>(`/admin/users/${id}/role`, { role });
  return user;
}

export async function updateUserBlockStatus(id: string, isBlocked: boolean): Promise<User> {
  const { user } = await api.patch<{ user: User }>(`/admin/users/${id}/block`, { isBlocked });
  return user;
}

export async function updateUserVerifiedStatus(id: string, isVerified: boolean): Promise<User> {
  const { user } = await api.patch<{ user: User }>(`/admin/users/${id}/verify`, { isVerified });
  return user;
}

export function deleteUser(id: string): Promise<void> {
  return api.delete<void>(`/admin/users/${id}`);
}
