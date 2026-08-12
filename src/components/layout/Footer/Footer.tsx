import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./Footer.module.css";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Navigation");
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.logo}>Home Recipes</p>
          <p className={styles.tagline}>{t("tagline")}</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/recipes" className={styles.link}>
            {tNav("recipes")}
          </Link>
          <Link href="/conservation" className={styles.link}>
            {tNav("conservation")}
          </Link>
        </nav>
        <p className={styles.rights}>
          © {year} Home Recipes. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
