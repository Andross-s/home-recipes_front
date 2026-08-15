import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PrivateRoute from "@/components/auth/PrivateRoute/PrivateRoute";
import OwnRecipesList from "@/components/profile/OwnRecipesList/OwnRecipesList";
import { getCategories } from "@/lib/categories";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProfileRecipes");
  return { title: t("title") };
}

export default async function ProfileRecipesPage() {
  // GET /categories is public and safe to fetch server-side; the recipes
  // themselves require the caller's token and are fetched client-side by
  // OwnRecipesList (see that component for why).
  const [categories, locale] = await Promise.all([getCategories(), getLocale()]);

  return (
    <PrivateRoute>
      <OwnRecipesList categories={categories} locale={locale} />
    </PrivateRoute>
  );
}
