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

export const MAX_RECIPE_IMAGES = 6;

export interface RecipeImage {
  url: string;
  // null for images migrated from the old single imageUrl field, where the
  // original Cloudinary public_id is unknown — see the backend's
  // migrate-recipe-images.ts. Such images can't be individually deleted or
  // repositioned via imagesToDelete/imageOrder (both key off publicId).
  publicId: string | null;
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
  images: RecipeImage[];
  owner: { _id: string; name: string } | string;
  createdAt: string;
  updatedAt: string;
}
