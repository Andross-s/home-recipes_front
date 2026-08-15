import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import RecipeGallery from "@/components/RecipeGallery/RecipeGallery";
import EditRecipeLink from "@/components/recipes/EditRecipeLink/EditRecipeLink";
import FavoriteButton from "@/components/recipes/FavoriteButton/FavoriteButton";
import { localizedName } from "@/lib/localizedName";
import { getRecipeOrNotFound } from "@/lib/recipes";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/recipes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeOrNotFound(id);
  return { title: recipe.title, description: recipe.description };
}

export default async function RecipeDetailPage({
  params,
}: PageProps<"/[locale]/recipes/[id]">) {
  const { id } = await params;
  const [recipe, locale, t] = await Promise.all([
    getRecipeOrNotFound(id),
    getLocale(),
    getTranslations("RecipeDetail"),
  ]);

  const categoryName =
    typeof recipe.category === "string" ? undefined : localizedName(recipe.category.name, locale);
  const owner = typeof recipe.owner === "string" ? undefined : recipe.owner;

  return (
    <article className={styles.page}>
      <RecipeGallery images={recipe.images} alt={recipe.title} />

      <div className={styles.content}>
        <div className={styles.meta}>
          {categoryName && <span className={styles.badge}>{categoryName}</span>}
          {typeof recipe.cookTime === "number" && (
            <span className={styles.metaItem}>{t("cookTime", { minutes: recipe.cookTime })}</span>
          )}
          {owner && <span className={styles.metaItem}>{t("authorLabel", { name: owner.name })}</span>}
        </div>

        <h1 className={styles.title}>{recipe.title}</h1>

        {recipe.description && <p className={styles.description}>{recipe.description}</p>}

        <div className={styles.actions}>
          <FavoriteButton recipeId={recipe._id} />
          {owner && <EditRecipeLink recipeId={recipe._id} ownerId={owner._id} />}
        </div>

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
