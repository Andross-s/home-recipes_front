"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useIngredientSearch } from "@/hooks/useIngredientSearch";
import { localizedName } from "@/lib/localizedName";
import { validateAmount } from "@/lib/recipeValidation";
import type { Ingredient } from "@/types/recipe";
import styles from "./IngredientPicker.module.css";

export interface RecipeIngredientRow {
  /** The ingredient's own id — an ingredient can only appear once per recipe. */
  id: string;
  label: string;
  amount: string;
}

interface IngredientPickerProps {
  locale: string;
  rows: RecipeIngredientRow[];
  onChange: (rows: RecipeIngredientRow[]) => void;
}

export default function IngredientPicker({ locale, rows, onChange }: IngredientPickerProps) {
  const t = useTranslations("RecipeForm");
  const tValidation = useTranslations("Validation");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useIngredientSearch(query, locale, isOpen);
  const availableResults = results.filter((r) => !rows.some((row) => row.id === r._id));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAdd(ingredient: Ingredient) {
    onChange([...rows, { id: ingredient._id, label: localizedName(ingredient.name, locale), amount: "" }]);
    setQuery("");
    setIsOpen(false);
  }

  function handleAmountChange(id: string, amount: string) {
    onChange(rows.map((row) => (row.id === id ? { ...row, amount } : row)));
  }

  function handleRemove(id: string) {
    onChange(rows.filter((row) => row.id !== id));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchWrapper} ref={containerRef}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={t("ingredientSearchPlaceholder")}
          className={styles.searchInput}
          autoComplete="off"
        />
        {isOpen && query.trim().length > 0 && (
          <ul className={styles.dropdown}>
            {isLoading && <li className={styles.dropdownMessage}>{t("ingredientLoading")}</li>}
            {!isLoading && availableResults.length === 0 && (
              <li className={styles.dropdownMessage}>{t("ingredientNoResults")}</li>
            )}
            {!isLoading &&
              availableResults.map((ingredient) => (
                <li key={ingredient._id}>
                  <button type="button" className={styles.option} onClick={() => handleAdd(ingredient)}>
                    {localizedName(ingredient.name, locale)}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {rows.length > 0 && (
        <ul className={styles.rows}>
          {rows.map((row) => {
            const amountError = validateAmount(row.amount);
            return (
              <li key={row.id} className={styles.row}>
                <span className={styles.rowLabel}>{row.label}</span>
                <div className={styles.rowAmount}>
                  <input
                    type="text"
                    value={row.amount}
                    onChange={(event) => handleAmountChange(row.id, event.target.value)}
                    placeholder={t("amountPlaceholder")}
                    className={amountError ? styles.amountInputInvalid : styles.amountInput}
                  />
                  {amountError && (
                    <span className={styles.amountError}>{tValidation("required")}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(row.id)}
                  className={styles.removeButton}
                  aria-label={t("removeIngredient")}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
