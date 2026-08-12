"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import styles from "./AdminRoute.module.css";

// Wrap any admin-panel page/segment. Redirects to /login when signed out,
// or to / when signed in as a non-admin user.
export default function AdminRoute({ children }: { children: ReactNode }) {
  const t = useTranslations("Common");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") {
    return <p className={styles.loading}>{t("loading")}</p>;
  }

  return <>{children}</>;
}
