import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PrivateRoute from "@/components/auth/PrivateRoute/PrivateRoute";
import RecipeForm from "@/components/recipes/RecipeForm/RecipeForm";
import { getCategories } from "@/lib/categories";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeForm");
  return { title: t("createTitle") };
}

export default async function NewRecipePage() {
  const [categories, locale] = await Promise.all([getCategories(), getLocale()]);

  return (
    <PrivateRoute>
      <RecipeForm mode="create" categories={categories} locale={locale} />
    </PrivateRoute>
  );
}
