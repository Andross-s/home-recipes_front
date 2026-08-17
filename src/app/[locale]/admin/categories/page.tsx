import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CategoryManager from "@/components/admin/CategoryManager/CategoryManager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("categoriesTitle") };
}

export default function AdminCategoriesPage() {
  return <CategoryManager />;
}
