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
  const thumbnail = recipe.images[0];
  const extraImageCount = recipe.images.length - 1;

  return (
    <Link href={`/recipes/${recipe._id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {thumbnail ? (
          <Image
            src={thumbnail.url}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
        {extraImageCount > 0 && (
          <span className={styles.photoBadge}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 3 7.17 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
              />
            </svg>
            {t("morePhotos", { count: extraImageCount })}
          </span>
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
