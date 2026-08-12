import { api } from "@/lib/api";
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
