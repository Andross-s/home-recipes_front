import { getTranslations } from "next-intl/server";
import styles from "./page.module.css";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>
    </div>
  );
}
