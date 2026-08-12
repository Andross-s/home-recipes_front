"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import styles from "./PrivateRoute.module.css";

// Wrap any page/segment that requires a signed-in user. Redirects to /login
// when the auth bootstrap finishes with no user; renders nothing useful
// until then to avoid flashing protected content.
export default function PrivateRoute({ children }: { children: ReactNode }) {
  const t = useTranslations("Common");
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return <p className={styles.loading}>{t("loading")}</p>;
  }

  return <>{children}</>;
}
