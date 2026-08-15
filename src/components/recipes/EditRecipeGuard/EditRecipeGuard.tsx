"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";

interface EditRecipeGuardProps {
  recipeId: string;
  ownerId: string;
  children: ReactNode;
}

// Rendered inside PrivateRoute, so `user` is already known to be non-null by
// the time this mounts — this only adds the ownership/admin check on top.
export default function EditRecipeGuard({ recipeId, ownerId, children }: EditRecipeGuardProps) {
  const t = useTranslations("Common");
  const { user } = useAuth();
  const router = useRouter();

  const canEdit = user !== null && (user._id === ownerId || user.role === "admin");

  useEffect(() => {
    if (!canEdit) {
      router.replace(`/recipes/${recipeId}`);
    }
  }, [canEdit, recipeId, router]);

  if (!canEdit) {
    return <p>{t("loading")}</p>;
  }

  return <>{children}</>;
}
