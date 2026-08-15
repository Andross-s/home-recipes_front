"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import styles from "./EditRecipeLink.module.css";

interface EditRecipeLinkProps {
  recipeId: string;
  ownerId: string;
}

export default function EditRecipeLink({ recipeId, ownerId }: EditRecipeLinkProps) {
  const t = useTranslations("RecipeDetail");
  const { user } = useAuth();

  const canEdit = user && (user._id === ownerId || user.role === "admin");
  if (!canEdit) {
    return null;
  }

  return (
    <Link href={`/recipes/${recipeId}/edit`} className={styles.link}>
      {t("editRecipe")}
    </Link>
  );
}
