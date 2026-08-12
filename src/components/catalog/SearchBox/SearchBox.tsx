"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import styles from "./SearchBox.module.css";

const DEBOUNCE_MS = 400;

export default function SearchBox({ initialValue }: { initialValue?: string }) {
  const t = useTranslations("Catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialValue ?? "");
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the debounce on mount — the URL already matches `initialValue`.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.replace({ pathname, query: Object.fromEntries(params) });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // Re-runs only when the debounced value changes — router/pathname/searchParams
    // are read fresh from closures at fire time, not tracked as dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={styles.wrapper}>
      <label htmlFor="recipe-search" className={styles.srOnly}>
        {t("searchLabel")}
      </label>
      <input
        id="recipe-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className={styles.input}
      />
    </div>
  );
}
