"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DeleteRecipeButton from "@/components/profile/DeleteRecipeButton/DeleteRecipeButton";
import ProfileRecipeCard from "@/components/profile/ProfileRecipeCard/ProfileRecipeCard";
import RecipeGrid from "@/components/recipes/RecipeGrid/RecipeGrid";
import { Link } from "@/i18n/navigation";
import { localizedName } from "@/lib/localizedName";
import { getOwnRecipes } from "@/lib/recipes";
import type { Category, Recipe } from "@/types/recipe";
import styles from "./OwnRecipesList.module.css";

const PER_PAGE = 12;

interface OwnRecipesListProps {
  categories: Category[];
  locale: string;
}

// GET /recipes/own requires the caller's access token, which only ever lives
// in the browser's in-memory apiFetch state (see lib/api.ts) — a Server
// Component page fetching this at request time would always 401 (build-time
// prerendering hit exactly that). So the list is fetched here, client-side,
// after PrivateRoute confirms a signed-in user.
export default function OwnRecipesList({ categories, locale }: OwnRecipesListProps) {
  const t = useTranslations("ProfileRecipes");
  const tCommon = useTranslations("Common");
  const tCatalog = useTranslations("Catalog");

  const [page, setPage] = useState(1);
  // null doubles as the "loading" state — reset before a fetch starts (in
  // goToPage) rather than via a separate isLoading flag set synchronously
  // inside the effect.
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getOwnRecipes(page, PER_PAGE).then(({ data, totalItems: total }) => {
      if (cancelled) return;
      setRecipes(data);
      setTotalItems(total);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const categoryNameById = new Map(categories.map((c) => [c._id, localizedName(c.name, locale)]));
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  function goToPage(next: number) {
    setRecipes(null);
    setPage(next);
  }

  function handleDeleted(id: string) {
    setRecipes((prev) => (prev ? prev.filter((recipe) => recipe._id !== id) : prev));
    setTotalItems((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <Link href="/recipes/new" className={styles.addLink}>
          {t("addRecipe")}
        </Link>
      </div>

      {recipes === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : recipes.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t("emptyTitle")}</p>
          <p className={styles.emptyDescription}>{t("emptyDescription")}</p>
        </div>
      ) : (
        <>
          <RecipeGrid>
            {recipes.map((recipe) => (
              <div key={recipe._id} className={styles.cardWrapper}>
                <ProfileRecipeCard
                  recipe={recipe}
                  categoryName={
                    typeof recipe.category === "string"
                      ? categoryNameById.get(recipe.category)
                      : localizedName(recipe.category.name, locale)
                  }
                />
                <div className={styles.cardActions}>
                  <Link href={`/recipes/${recipe._id}/edit`} className={styles.editLink}>
                    {t("edit")}
                  </Link>
                  <DeleteRecipeButton
                    recipeId={recipe._id}
                    title={recipe.title}
                    onDeleted={() => handleDeleted(recipe._id)}
                  />
                </div>
              </div>
            ))}
          </RecipeGrid>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label={tCatalog("paginationLabel")}>
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={styles.navButton}
              >
                {tCatalog("prevPage")}
              </button>
              <span className={styles.pageInfo}>{tCatalog("pageOf", { page, totalPages })}</span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className={styles.navButton}
              >
                {tCatalog("nextPage")}
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
