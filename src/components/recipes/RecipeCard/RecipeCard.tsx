import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Recipe } from "@/types/recipe";
import styles from "./RecipeCard.module.css";

interface RecipeCardProps {
  recipe: Recipe;
  /** Pre-resolved via localizedName by the parent — the list endpoint only returns a category id. */
  categoryName?: string;
}

export default async function RecipeCard({ recipe, categoryName }: RecipeCardProps) {
  const t = await getTranslations("RecipeCard");

  return (
    <Link href={`/recipes/${recipe._id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <div className={styles.meta}>
          {categoryName && <span className={styles.category}>{categoryName}</span>}
          {typeof recipe.cookTime === "number" && (
            <span className={styles.cookTime}>{t("cookTime", { minutes: recipe.cookTime })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
