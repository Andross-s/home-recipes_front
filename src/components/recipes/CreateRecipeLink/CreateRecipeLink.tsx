"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import styles from "./CreateRecipeLink.module.css";

export default function CreateRecipeLink() {
  const t = useTranslations("RecipeForm");
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Link href="/recipes/new" className={styles.link}>
      {t("createLink")}
    </Link>
  );
}
