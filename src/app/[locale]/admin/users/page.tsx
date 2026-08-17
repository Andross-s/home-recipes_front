import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdminUsersManager from "@/components/admin/AdminUsersManager/AdminUsersManager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("usersTitle") };
}

export default function AdminUsersPage() {
  return <AdminUsersManager />;
}
