"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./RemoveFavoriteButton.module.css";

interface RemoveFavoriteButtonProps {
  recipeId: string;
  onRemoved: () => void;
}

// Updates AuthContext's user.favorites (so the heart icon elsewhere reflects
// it too) and, on success, tells the favorites list to drop the card from
// its own already-fetched-client-side state.
export default function RemoveFavoriteButton({ recipeId, onRemoved }: RemoveFavoriteButtonProps) {
  const t = useTranslations("ProfileFavorites");
  const { toggleFavorite } = useAuth();

  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await toggleFavorite(recipeId);
      onRemoved();
    } catch {
      setIsRemoving(false);
    }
  }

  return (
    <button type="button" onClick={handleRemove} disabled={isRemoving} className={styles.button}>
      {isRemoving ? t("removing") : t("remove")}
    </button>
  );
}
