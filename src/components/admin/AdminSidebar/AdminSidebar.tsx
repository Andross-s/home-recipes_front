"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import styles from "./AdminSidebar.module.css";

const SECTIONS = [
  { href: "/admin/categories", key: "categoriesNav" },
  { href: "/admin/ingredients", key: "ingredientsNav" },
  { href: "/admin/recipes", key: "recipesNav" },
  { href: "/admin/users", key: "usersNav" },
] as const;

export default function AdminSidebar() {
  const t = useTranslations("Admin");
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar} aria-label={t("title")}>
      {SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`${styles.link} ${pathname === section.href ? styles.active : ""}`}
        >
          {t(section.key)}
        </Link>
      ))}
    </nav>
  );
}
