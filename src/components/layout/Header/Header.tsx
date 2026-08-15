import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher/LocaleSwitcher";
import NavLinks from "@/components/layout/NavLinks/NavLinks";
import navLinksStyles from "@/components/layout/NavLinks/NavLinks.module.css";
import UserMenu from "@/components/layout/UserMenu/UserMenu";
import styles from "./Header.module.css";

export default async function Header() {
  const t = await getTranslations("Navigation");

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Home Recipes
        </Link>

        {/* Pure-CSS mobile nav toggle — no client JS needed to open/close it. */}
        <input type="checkbox" id="nav-toggle" className={styles.navToggleInput} />
        <label htmlFor="nav-toggle" className={styles.navToggleLabel} aria-label={t("menu")}>
          <span className={styles.navToggleIcon} />
        </label>

        {/*
          Locale switcher and auth actions live inside <nav> itself (not a
          separate top-bar group) so they collapse into the mobile dropdown
          together with the links instead of crowding the 390px header row.
        */}
        <nav className={styles.nav} aria-label={t("menu")}>
          {/* NavLinks reads useSearchParams() to highlight the active group,
              which forces a client bailout on static pages unless wrapped in
              Suspense — the fallback mirrors the same links unhighlighted so
              there's no layout shift while it resolves. */}
          <Suspense
            fallback={
              <div className={navLinksStyles.navLinks}>
                <Link href="/" className={navLinksStyles.navLink}>
                  {t("home")}
                </Link>
                <Link
                  href={{ pathname: "/recipes", query: { group: "recipes" } }}
                  className={navLinksStyles.navLink}
                >
                  {t("recipes")}
                </Link>
                <Link
                  href={{ pathname: "/recipes", query: { group: "conservation" } }}
                  className={navLinksStyles.navLink}
                >
                  {t("conservation")}
                </Link>
                <Link href="/profile/favorites" className={navLinksStyles.navLink}>
                  {t("favorites")}
                </Link>
              </div>
            }
          >
            <NavLinks />
          </Suspense>
          <div className={styles.navActions}>
            <LocaleSwitcher />
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
