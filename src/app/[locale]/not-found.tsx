import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./not-found.module.css";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>{t("description")}</p>
      <Link href="/" className={styles.link}>
        {t("backHome")}
      </Link>
    </div>
  );
}
