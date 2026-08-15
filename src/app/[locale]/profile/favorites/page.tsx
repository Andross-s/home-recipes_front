import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PrivateRoute from "@/components/auth/PrivateRoute/PrivateRoute";
import FavoritesList from "@/components/profile/FavoritesList/FavoritesList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProfileFavorites");
  return { title: t("title") };
}

export default async function ProfileFavoritesPage() {
  const locale = await getLocale();

  return (
    <PrivateRoute>
      <FavoritesList locale={locale} />
    </PrivateRoute>
  );
}
