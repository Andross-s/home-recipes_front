import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export async function updateName(name: string): Promise<User> {
  const { user } = await api.patch<{ user: User }>("/users/me", { name });
  return user;
}

export async function updateAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);
  const { user } = await api.patch<{ user: User }>("/users/me/avatar", formData);
  return user;
}
