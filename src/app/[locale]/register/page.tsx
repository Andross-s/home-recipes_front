import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AuthCard from "@/components/auth/AuthCard/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm/RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("registerTitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthCard title={t("registerTitle")}>
      <RegisterForm />
    </AuthCard>
  );
}
