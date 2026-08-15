import { notFound } from "next/navigation";
import { ApiError, api } from "@/lib/api";
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

// Shared by the detail and edit pages: a missing or malformed id should
// render the localized not-found page either way.
export async function getRecipeOrNotFound(id: string): Promise<Recipe> {
  try {
    return await getRecipeById(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.errorCode === "INVALID_ID")) {
      notFound();
    }
    throw error;
  }
}

export function addFavorite(id: string): Promise<void> {
  return api.post<void>(`/recipes/favorites/${id}`);
}

export function removeFavorite(id: string): Promise<void> {
  return api.delete<void>(`/recipes/favorites/${id}`);
}

export interface RecipeIngredientInput {
  ingredient: string;
  amount: string;
}

export interface RecipeFields {
  title: string;
  description?: string;
  group: Group;
  category: string;
  ingredients: RecipeIngredientInput[];
  steps: string[];
  cookTime?: number;
}

function appendRecipeFields(formData: FormData, fields: Partial<RecipeFields>): void {
  if (fields.title !== undefined) formData.set("title", fields.title);
  if (fields.description !== undefined) formData.set("description", fields.description);
  if (fields.group !== undefined) formData.set("group", fields.group);
  if (fields.category !== undefined) formData.set("category", fields.category);
  if (fields.ingredients !== undefined) {
    formData.set("ingredients", JSON.stringify(fields.ingredients));
  }
  if (fields.steps !== undefined) formData.set("steps", JSON.stringify(fields.steps));
  if (fields.cookTime !== undefined) formData.set("cookTime", String(fields.cookTime));
}

export async function createRecipe(fields: RecipeFields, imageFiles: File[]): Promise<Recipe> {
  const formData = new FormData();
  appendRecipeFields(formData, fields);
  // Upload order becomes the stored image order (see recipe.service.ts createRecipe).
  imageFiles.forEach((file) => formData.append("images", file));

  const { recipe } = await api.post<{ recipe: Recipe }>("/recipes", formData);
  return recipe;
}

export interface UpdateRecipeInput {
  fields: Partial<RecipeFields>;
  newImageFiles: File[];
  /** publicIds of existing images to remove. */
  imagesToDelete: string[];
  /** publicIds of the remaining existing images, in their new order. */
  imageOrder: string[];
}

export async function updateRecipe(id: string, input: UpdateRecipeInput): Promise<Recipe> {
  const formData = new FormData();
  appendRecipeFields(formData, input.fields);
  if (input.imagesToDelete.length > 0) {
    formData.set("imagesToDelete", JSON.stringify(input.imagesToDelete));
  }
  if (input.imageOrder.length > 0) {
    formData.set("imageOrder", JSON.stringify(input.imageOrder));
  }
  // New uploads are always appended after the reordered existing images —
  // the backend has no way to interleave them (see applyImageDeleteAndOrder
  // in recipe.service.ts).
  input.newImageFiles.forEach((file) => formData.append("images", file));

  const { recipe } = await api.patch<{ recipe: Recipe }>(`/recipes/${id}`, formData);
  return recipe;
}

export function deleteRecipe(id: string): Promise<void> {
  return api.delete<void>(`/recipes/${id}`);
}
