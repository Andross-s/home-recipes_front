"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton/AdminDeleteButton";
import AdminModal from "@/components/admin/AdminModal/AdminModal";
import IngredientForm from "@/components/admin/IngredientForm/IngredientForm";
import { deleteIngredient, getIngredients } from "@/lib/ingredients";
import type { Ingredient } from "@/types/recipe";
import styles from "@/components/admin/AdminTable.module.css";

type ModalState = { mode: "create" } | { mode: "edit"; ingredient: Ingredient } | null;

const DEBOUNCE_MS = 300;

export default function IngredientManager() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setIngredients(null);
      getIngredients({ search: search.trim() || undefined, lang: locale }).then((data) => {
        if (!cancelled) setIngredients(data);
      });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, locale]);

  function reload() {
    setIngredients(null);
    getIngredients({ search: search.trim() || undefined, lang: locale }).then(setIngredients);
  }

  function handleSaved() {
    setModalState(null);
    reload();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("ingredientsTitle")}</h1>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className={styles.addButton}
        >
          {t("addIngredient")}
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className={styles.searchInput}
        />
      </div>

      {ingredients === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : ingredients.length === 0 ? (
        <p className={styles.empty}>{t("noIngredients")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("nameColumn")}</th>
                <th>{t("actionsColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const incomplete = !ingredient.name.en || !ingredient.name.ka;
                return (
                  <tr key={ingredient._id}>
                    <td>
                      <div className={styles.nameCell}>
                        {ingredient.imageUrl ? (
                          <Image
                            src={ingredient.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className={styles.thumb}
                          />
                        ) : (
                          <div className={styles.thumb} aria-hidden="true" />
                        )}
                        <span>{ingredient.name.uk}</span>
                        {incomplete && (
                          <span className={styles.incompleteBadge}>{t("incompleteTranslation")}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => setModalState({ mode: "edit", ingredient })}
                          className={styles.editButton}
                        >
                          {t("edit")}
                        </button>
                        <AdminDeleteButton
                          confirmMessage={t("confirmDeleteIngredient", { name: ingredient.name.uk })}
                          label={t("delete")}
                          deletingLabel={t("deleting")}
                          onDelete={() => deleteIngredient(ingredient._id)}
                          onDeleted={reload}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalState && (
        <AdminModal
          title={modalState.mode === "create" ? t("addIngredient") : t("editIngredient")}
          onClose={() => setModalState(null)}
        >
          <IngredientForm
            mode={modalState.mode}
            ingredient={modalState.mode === "edit" ? modalState.ingredient : undefined}
            onSaved={handleSaved}
          />
        </AdminModal>
      )}
    </div>
  );
}
