"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { type ChangeEvent, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LocaleSwitcher.module.css";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as (typeof routing.locales)[number];
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathname/params always match the current route
        { pathname, params },
        { locale: nextLocale },
      );
    });
  }

  return (
    <label className={styles.wrapper} aria-disabled={isPending}>
      <span className={styles.srOnly}>{t("label")}</span>
      <select
        className={styles.select}
        defaultValue={locale}
        disabled={isPending}
        onChange={handleChange}
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {t(cur)}
          </option>
        ))}
      </select>
    </label>
  );
}
