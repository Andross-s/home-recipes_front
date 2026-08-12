import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AuthCard from "@/components/auth/AuthCard/AuthCard";
import LoginForm from "@/components/auth/LoginForm/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthCard title={t("loginTitle")}>
      <LoginForm />
    </AuthCard>
  );
}
