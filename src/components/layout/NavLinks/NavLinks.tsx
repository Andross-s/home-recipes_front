"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import styles from "./NavLinks.module.css";

// Pathname from next-intl's usePathname is already locale-stripped (e.g.
// "/recipes", not "/uk/recipes"), so it can be compared directly against
// route literals below.
export default function NavLinks() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const group = useSearchParams().get("group");

  const isHome = pathname === "/";
  const isRecipes = pathname === "/recipes" && group === "recipes";
  const isConservation = pathname === "/recipes" && group === "conservation";
  const isFavorites = pathname === "/profile/favorites";

  function linkClassName(active: boolean): string {
    return `${styles.navLink} ${active ? styles.navLinkActive : ""}`;
  }

  return (
    <div className={styles.navLinks}>
      <Link href="/" className={linkClassName(isHome)} aria-current={isHome ? "page" : undefined}>
        {t("home")}
      </Link>
      <Link
        href={{ pathname: "/recipes", query: { group: "recipes" } }}
        className={linkClassName(isRecipes)}
        aria-current={isRecipes ? "page" : undefined}
      >
        {t("recipes")}
      </Link>
      <Link
        href={{ pathname: "/recipes", query: { group: "conservation" } }}
        className={linkClassName(isConservation)}
        aria-current={isConservation ? "page" : undefined}
      >
        {t("conservation")}
      </Link>
      <Link
        href="/profile/favorites"
        className={linkClassName(isFavorites)}
        aria-current={isFavorites ? "page" : undefined}
      >
        {t("favorites")}
      </Link>
    </div>
  );
}
