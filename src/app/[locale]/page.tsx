import { getLocale, getTranslations } from "next-intl/server";
import GroupCard from "@/components/home/GroupCard/GroupCard";
import RecipeCard from "@/components/recipes/RecipeCard/RecipeCard";
import RecipeGrid from "@/components/recipes/RecipeGrid/RecipeGrid";
import { getCategories } from "@/lib/categories";
import { localizedName } from "@/lib/localizedName";
import { getRecipes } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function HomePage() {
  const [t, locale] = await Promise.all([getTranslations("HomePage"), getLocale()]);

  // This page is statically generated (SSG + ISR), including at build time —
  // a cold/unreachable backend (e.g. a sleeping Render free-tier instance)
  // must not fail the build. Degrade to hero + group cards only; ISR
  // re-fetches on the next revalidation once the backend responds again.
  let latestRecipes: Recipe[] = [];
  let categoryNameById = new Map<string, string>();
  try {
    const [{ data }, categories] = await Promise.all([
      getRecipes({ perPage: 6 }),
      getCategories(),
    ]);
    latestRecipes = data;
    categoryNameById = new Map(
      categories.map((category) => [category._id, localizedName(category.name, locale)]),
    );
  } catch (error) {
    console.error("HomePage: failed to load latest recipes", error);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </section>

      <section className={styles.groups}>
        <GroupCard
          group="recipes"
          title={t("recipesGroupTitle")}
          description={t("recipesGroupDescription")}
        />
        <GroupCard
          group="conservation"
          title={t("conservationGroupTitle")}
          description={t("conservationGroupDescription")}
        />
      </section>

      {latestRecipes.length > 0 && (
        <section className={styles.latest}>
          <h2 className={styles.sectionTitle}>{t("latestTitle")}</h2>
          <RecipeGrid>
            {latestRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                categoryName={
                  typeof recipe.category === "string"
                    ? categoryNameById.get(recipe.category)
                    : localizedName(recipe.category.name, locale)
                }
              />
            ))}
          </RecipeGrid>
        </section>
      )}
    </div>
  );
}
