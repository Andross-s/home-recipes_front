"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { deleteRecipe } from "@/lib/recipes";
import styles from "./DeleteRecipeButton.module.css";

interface DeleteRecipeButtonProps {
  recipeId: string;
  title: string;
  onDeleted: () => void;
}

export default function DeleteRecipeButton({ recipeId, title, onDeleted }: DeleteRecipeButtonProps) {
  const t = useTranslations("ProfileRecipes");
  const tErrors = useTranslations("Errors");

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function handleDelete() {
    if (!window.confirm(t("confirmDelete", { title }))) return;

    setError(null);
    setIsDeleting(true);
    try {
      await deleteRecipe(recipeId);
      onDeleted();
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" onClick={handleDelete} disabled={isDeleting} className={styles.button}>
        {isDeleting ? t("deleting") : t("delete")}
      </button>
      {error && <p className={styles.error}>{getErrorMessage(tErrors, error)}</p>}
    </div>
  );
}
