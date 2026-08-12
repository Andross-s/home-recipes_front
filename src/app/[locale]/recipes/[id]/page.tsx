import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import FavoriteButton from "@/components/recipes/FavoriteButton/FavoriteButton";
import { ApiError } from "@/lib/api";
import { localizedName } from "@/lib/localizedName";
import { getRecipeById } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";
import styles from "./page.module.css";

export const revalidate = 60;

async function loadRecipe(id: string): Promise<Recipe> {
  try {
    return await getRecipeById(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.errorCode === "INVALID_ID")) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/recipes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const recipe = await loadRecipe(id);
  return { title: recipe.title, description: recipe.description };
}

export default async function RecipeDetailPage({
  params,
}: PageProps<"/[locale]/recipes/[id]">) {
  const { id } = await params;
  const [recipe, locale, t] = await Promise.all([
    loadRecipe(id),
    getLocale(),
    getTranslations("RecipeDetail"),
  ]);

  const categoryName =
    typeof recipe.category === "string" ? undefined : localizedName(recipe.category.name, locale);
  const authorName = typeof recipe.owner === "string" ? undefined : recipe.owner.name;

  return (
    <article className={styles.page}>
      <div className={styles.imageWrapper}>
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 900px) 100vw, 800px"
            className={styles.image}
            priority
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.meta}>
          {categoryName && <span className={styles.badge}>{categoryName}</span>}
          {typeof recipe.cookTime === "number" && (
            <span className={styles.metaItem}>{t("cookTime", { minutes: recipe.cookTime })}</span>
          )}
          {authorName && <span className={styles.metaItem}>{t("authorLabel", { name: authorName })}</span>}
        </div>

        <h1 className={styles.title}>{recipe.title}</h1>

        {recipe.description && <p className={styles.description}>{recipe.description}</p>}

        <FavoriteButton recipeId={recipe._id} />

        <div className={styles.body}>
          <section className={styles.ingredients}>
            <h2 className={styles.sectionTitle}>{t("ingredientsTitle")}</h2>
            <ul className={styles.ingredientList}>
              {recipe.ingredients.map((item, index) => (
                <li key={index} className={styles.ingredientItem}>
                  <span>
                    {typeof item.ingredient === "string"
                      ? item.ingredient
                      : localizedName(item.ingredient.name, locale)}
                  </span>
                  <span className={styles.ingredientAmount}>{item.amount}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.steps}>
            <h2 className={styles.sectionTitle}>{t("stepsTitle")}</h2>
            <ol className={styles.stepList}>
              {recipe.steps.map((step, index) => (
                <li key={index} className={styles.stepItem}>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}
