import { api } from "@/lib/api";
import type { Category, Group } from "@/types/recipe";

export async function getCategories(group?: Group): Promise<Category[]> {
  const query = group ? `?group=${group}` : "";
  const { categories } = await api.get<{ categories: Category[] }>(`/categories${query}`);
  return categories;
}
