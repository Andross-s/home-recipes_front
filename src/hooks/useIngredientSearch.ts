"use client";

import { useEffect, useState } from "react";
import { getIngredients } from "@/lib/ingredients";
import type { Ingredient } from "@/types/recipe";

const DEBOUNCE_MS = 300;

// Debounced search against GET /ingredients?search=&lang=, shared by the
// catalog's ingredient filter and the recipe form's ingredient picker.
export function useIngredientSearch(query: string, locale: string, enabled: boolean) {
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || query.trim().length === 0) {
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
  }, [query, locale, enabled]);

  return { results, isLoading };
}
