"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ProfileRecipeCard from "@/components/profile/ProfileRecipeCard/ProfileRecipeCard";
import RemoveFavoriteButton from "@/components/profile/RemoveFavoriteButton/RemoveFavoriteButton";
import RecipeGrid from "@/components/recipes/RecipeGrid/RecipeGrid";
import { localizedName } from "@/lib/localizedName";
import { getFavoriteRecipes } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";
import styles from "./FavoritesList.module.css";

// GET /recipes/favorites requires the caller's access token, which only ever
// lives in the browser's in-memory apiFetch state (see lib/api.ts) — same
// reasoning as OwnRecipesList for fetching client-side instead of in the
// page's Server Component.
export default function FavoritesList({ locale }: { locale: string }) {
  const t = useTranslations("ProfileFavorites");
  const tCommon = useTranslations("Common");

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFavoriteRecipes().then((data) => {
      if (!cancelled) setRecipes(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRemoved(id: string) {
    setRecipes((prev) => (prev ? prev.filter((recipe) => recipe._id !== id) : prev));
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>

      {recipes === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : recipes.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDescription}>{t("emptyDescription")}</p>
        </div>
      ) : (
        <RecipeGrid>
          {recipes.map((recipe) => (
            <div key={recipe._id} className={styles.cardWrapper}>
              <ProfileRecipeCard
                recipe={recipe}
                categoryName={
                  typeof recipe.category === "string"
                    ? undefined
                    : localizedName(recipe.category.name, locale)
                }
              />
              <RemoveFavoriteButton recipeId={recipe._id} onRemoved={() => handleRemoved(recipe._id)} />
            </div>
          ))}
        </RecipeGrid>
      )}
    </div>
  );
}
