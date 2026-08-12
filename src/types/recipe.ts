import type { MultilingualName } from "@/types/i18n";

export type Group = "recipes" | "conservation";

export interface Category {
  _id: string;
  name: MultilingualName;
  group: Group;
  imageUrl?: string;
}

export interface Ingredient {
  _id: string;
  name: MultilingualName;
}

export interface RecipeIngredient {
  ingredient: Ingredient | string;
  amount: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  group: Group;
  category: Category | string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cookTime?: number;
  imageUrl?: string;
  owner: { _id: string; name: string } | string;
  createdAt: string;
  updatedAt: string;
}
