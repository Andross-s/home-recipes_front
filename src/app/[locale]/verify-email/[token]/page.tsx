import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AuthCard from "@/components/auth/AuthCard/AuthCard";
import VerifyEmailView from "@/components/auth/VerifyEmailView/VerifyEmailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("VerifyEmail");
  return { title: t("verifying") };
}

export default async function VerifyEmailPage({
  params,
}: PageProps<"/[locale]/verify-email/[token]">) {
  const { token } = await params;

  return (
    <AuthCard>
      <VerifyEmailView token={token} />
    </AuthCard>
  );
}
