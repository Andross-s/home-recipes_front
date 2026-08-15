import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PrivateRoute from "@/components/auth/PrivateRoute/PrivateRoute";
import EditRecipeGuard from "@/components/recipes/EditRecipeGuard/EditRecipeGuard";
import RecipeForm from "@/components/recipes/RecipeForm/RecipeForm";
import { getCategories } from "@/lib/categories";
import { getRecipeOrNotFound } from "@/lib/recipes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeForm");
  return { title: t("editTitle") };
}

export default async function EditRecipePage({
  params,
}: PageProps<"/[locale]/recipes/[id]/edit">) {
  const { id } = await params;
  const [recipe, categories, locale] = await Promise.all([
    getRecipeOrNotFound(id),
    getCategories(),
    getLocale(),
  ]);
  const ownerId = typeof recipe.owner === "string" ? recipe.owner : recipe.owner._id;

  return (
    <PrivateRoute>
      <EditRecipeGuard recipeId={id} ownerId={ownerId}>
        <RecipeForm mode="edit" recipeId={id} initialRecipe={recipe} categories={categories} locale={locale} />
      </EditRecipeGuard>
    </PrivateRoute>
  );
}
