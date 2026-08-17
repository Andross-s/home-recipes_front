import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import IngredientManager from "@/components/admin/IngredientManager/IngredientManager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("ingredientsTitle") };
}

export default function AdminIngredientsPage() {
  return <IngredientManager />;
}
