import { api } from "@/lib/api";
import type { MultilingualName } from "@/types/i18n";
import type { Ingredient } from "@/types/recipe";

export interface IngredientListParams {
  search?: string;
  lang?: string;
}

export async function getIngredients(params: IngredientListParams = {}): Promise<Ingredient[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.lang) query.set("lang", params.lang);
  const qs = query.toString();
  const { ingredients } = await api.get<{ ingredients: Ingredient[] }>(
    `/ingredients${qs ? `?${qs}` : ""}`,
  );
  return ingredients;
}

function buildIngredientFormData(name: MultilingualName | undefined, imageFile: File | null): FormData {
  const formData = new FormData();
  if (name !== undefined) formData.set("name", JSON.stringify(name));
  if (imageFile) formData.set("image", imageFile);
  return formData;
}

export async function createIngredient(
  name: MultilingualName,
  imageFile: File | null,
): Promise<Ingredient> {
  const { ingredient } = await api.post<{ ingredient: Ingredient }>(
    "/ingredients",
    buildIngredientFormData(name, imageFile),
  );
  return ingredient;
}

export async function updateIngredient(
  id: string,
  name: MultilingualName,
  imageFile: File | null,
): Promise<Ingredient> {
  const { ingredient } = await api.patch<{ ingredient: Ingredient }>(
    `/ingredients/${id}`,
    buildIngredientFormData(name, imageFile),
  );
  return ingredient;
}

export function deleteIngredient(id: string): Promise<void> {
  return api.delete<void>(`/ingredients/${id}`);
}
