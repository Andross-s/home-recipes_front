"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({ recipeId }: { recipeId: string }) {
  const t = useTranslations("RecipeDetail");
  const { user, toggleFavorite } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const isFavorited = user?.favorites.includes(recipeId) ?? false;

  async function handleClick() {
    if (!user) {
      setShowLoginHint(true);
      return;
    }
    setIsPending(true);
    try {
      await toggleFavorite(recipeId);
    } catch {
      // toggleFavorite already rolled back its optimistic update on failure.
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isFavorited}
        className={`${styles.button} ${isFavorited ? styles.active : ""}`}
      >
        <span aria-hidden="true" className={styles.icon}>
          {isFavorited ? "♥" : "♡"}
        </span>
        {isFavorited ? t("removeFromFavorites") : t("addToFavorites")}
      </button>
      {showLoginHint && (
        <p className={styles.hint}>
          {t("loginToFavorite")} <Link href="/login">{t("loginLink")}</Link>
        </p>
      )}
    </div>
  );
}
