import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PrivateRoute from "@/components/auth/PrivateRoute/PrivateRoute";
import AvatarUploader from "@/components/profile/AvatarUploader/AvatarUploader";
import ProfileDetailsForm from "@/components/profile/ProfileDetailsForm/ProfileDetailsForm";
import { Link } from "@/i18n/navigation";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return { title: t("title") };
}

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <PrivateRoute>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{t("title")}</h1>

        <div className={styles.links}>
          <Link href="/profile/recipes" className={styles.link}>
            {t("myRecipesLink")}
          </Link>
          <Link href="/profile/favorites" className={styles.link}>
            {t("favoritesLink")}
          </Link>
        </div>

        <div className={styles.sections}>
          <AvatarUploader />
          <ProfileDetailsForm />
        </div>
      </div>
    </PrivateRoute>
  );
}
