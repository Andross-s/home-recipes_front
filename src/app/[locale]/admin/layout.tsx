import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import AdminRoute from "@/components/auth/AdminRoute/AdminRoute";
import AdminSidebar from "@/components/admin/AdminSidebar/AdminSidebar";
import styles from "./layout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return { title: t("title") };
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <div className={styles.layout}>
        <AdminSidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </AdminRoute>
  );
}
