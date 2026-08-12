import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Group, Recipe } from "@/types/recipe";

export interface RecipeListParams {
  group?: Group;
  category?: string;
  ingredient?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export async function getRecipes(params: RecipeListParams = {}): Promise<PaginatedResult<Recipe>> {
  const query = new URLSearchParams();
  if (params.group) query.set("group", params.group);
  if (params.category) query.set("category", params.category);
  if (params.ingredient) query.set("ingredient", params.ingredient);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  const qs = query.toString();
  return api.get<PaginatedResult<Recipe>>(`/recipes${qs ? `?${qs}` : ""}`);
}

export async function getRecipeById(id: string): Promise<Recipe> {
  const { recipe } = await api.get<{ recipe: Recipe }>(`/recipes/${id}`);
  return recipe;
}

export function addFavorite(id: string): Promise<void> {
  return api.post<void>(`/recipes/favorites/${id}`);
}

export function removeFavorite(id: string): Promise<void> {
  return api.delete<void>(`/recipes/favorites/${id}`);
}
