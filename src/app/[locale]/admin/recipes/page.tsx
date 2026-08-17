import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdminRecipesManager from "@/components/admin/AdminRecipesManager/AdminRecipesManager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("recipesTitle") };
}

export default function AdminRecipesPage() {
  return <AdminRecipesManager />;
}
