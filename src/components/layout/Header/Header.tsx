import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher/LocaleSwitcher";
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
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              {t("home")}
            </Link>
            <Link href="/recipes" className={styles.navLink}>
              {t("recipes")}
            </Link>
            <Link href="/conservation" className={styles.navLink}>
              {t("conservation")}
            </Link>
            <Link href="/favorites" className={styles.navLink}>
              {t("favorites")}
            </Link>
          </div>
          <div className={styles.navActions}>
            <LocaleSwitcher />
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
