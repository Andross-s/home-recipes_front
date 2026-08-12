import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import VerificationBanner from "@/components/auth/VerificationBanner/VerificationBanner";
import { routing } from "@/i18n/routing";
import { notoSans, notoSansGeorgian } from "@/styles/fonts";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${notoSans.variable} ${notoSansGeorgian.variable}`}>
      <body>
        <NextIntlClientProvider>
          <AuthProvider>
            <Header />
            <VerificationBanner />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
