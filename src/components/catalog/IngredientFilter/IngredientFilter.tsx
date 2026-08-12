"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getIngredients } from "@/lib/ingredients";
import { localizedName } from "@/lib/localizedName";
import type { Ingredient } from "@/types/recipe";
import styles from "./IngredientFilter.module.css";

const DEBOUNCE_MS = 300;

interface IngredientFilterProps {
  locale: string;
  initialIngredientId?: string;
  initialIngredientLabel?: string;
}

export default function IngredientFilter({
  locale,
  initialIngredientId,
  initialIngredientLabel,
}: IngredientFilterProps) {
  const t = useTranslations("Catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(
    initialIngredientId && initialIngredientLabel
      ? { id: initialIngredientId, label: initialIngredientLabel }
      : null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dropdown only renders while `isOpen && query` is non-empty (see JSX
    // below), so there's nothing to fetch — and nothing stale to clear —
    // when either is false.
    if (!isOpen || query.trim().length === 0) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      setIsLoading(true);
      getIngredients({ search: query.trim(), lang: locale })
        .then((ingredients) => {
          if (!cancelled) setResults(ingredients);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, isOpen, locale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateWithIngredient(ingredientId: string | null) {
    const params = new URLSearchParams(searchParams);
    if (ingredientId) {
      params.set("ingredient", ingredientId);
    } else {
      params.delete("ingredient");
    }
    params.delete("page");
    router.replace({ pathname, query: Object.fromEntries(params) });
  }

  function handleSelect(ingredient: Ingredient) {
    setSelected({ id: ingredient._id, label: localizedName(ingredient.name, locale) });
    setQuery("");
    setIsOpen(false);
    navigateWithIngredient(ingredient._id);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    navigateWithIngredient(null);
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <label htmlFor="ingredient-filter" className={styles.label}>
        {t("ingredientLabel")}
      </label>

      {selected ? (
        <div className={styles.selectedChip}>
          <span>{selected.label}</span>
          <button type="button" onClick={handleClear} className={styles.clearButton}>
            ×
          </button>
        </div>
      ) : (
        <div className={styles.inputWrapper}>
          <input
            id="ingredient-filter"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={t("ingredientPlaceholder")}
            className={styles.input}
            autoComplete="off"
          />
          {isOpen && query.trim().length > 0 && (
            <ul className={styles.dropdown}>
              {isLoading && <li className={styles.dropdownMessage}>{t("ingredientLoading")}</li>}
              {!isLoading && results.length === 0 && (
                <li className={styles.dropdownMessage}>{t("ingredientNoResults")}</li>
              )}
              {!isLoading &&
                results.map((ingredient) => (
                  <li key={ingredient._id}>
                    <button
                      type="button"
                      className={styles.option}
                      onClick={() => handleSelect(ingredient)}
                    >
                      {localizedName(ingredient.name, locale)}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
