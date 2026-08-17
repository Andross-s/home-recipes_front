"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton/AdminDeleteButton";
import AdminModal from "@/components/admin/AdminModal/AdminModal";
import CategoryForm from "@/components/admin/CategoryForm/CategoryForm";
import { deleteCategory, getCategories } from "@/lib/categories";
import type { Category, Group } from "@/types/recipe";
import styles from "@/components/admin/AdminTable.module.css";

const GROUPS: Group[] = ["recipes", "conservation"];

type ModalState = { mode: "create" } | { mode: "edit"; category: Category } | null;

// Categories are fetched client-side (rather than as an async Server
// Component) so a create/edit/delete can simply re-run the same fetch to
// refresh the table, the same pattern every other admin section uses since
// their own GET requires the admin's in-memory access token.
export default function CategoryManager() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Navigation");

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [groupFilter, setGroupFilter] = useState<Group | "">("");
  const [modalState, setModalState] = useState<ModalState>(null);

  useEffect(() => {
    let cancelled = false;
    getCategories(groupFilter || undefined).then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, [groupFilter]);

  function reload() {
    setCategories(null);
    getCategories(groupFilter || undefined).then(setCategories);
  }

  function handleGroupFilterChange(value: Group | "") {
    setCategories(null);
    setGroupFilter(value);
  }

  function handleSaved() {
    setModalState(null);
    reload();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("categoriesTitle")}</h1>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className={styles.addButton}
        >
          {t("addCategory")}
        </button>
      </div>

      <div className={styles.toolbar}>
        <select
          value={groupFilter}
          onChange={(event) => handleGroupFilterChange(event.target.value as Group | "")}
          className={styles.selectInput}
        >
          <option value="">{t("allGroups")}</option>
          {GROUPS.map((group) => (
            <option key={group} value={group}>
              {tNav(group === "recipes" ? "recipes" : "conservation")}
            </option>
          ))}
        </select>
      </div>

      {categories === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : categories.length === 0 ? (
        <p className={styles.empty}>{t("noCategories")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("nameColumn")}</th>
                <th>{t("groupColumn")}</th>
                <th>{t("actionsColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const incomplete = !category.name.en || !category.name.ka;
                return (
                  <tr key={category._id}>
                    <td>
                      <div className={styles.nameCell}>
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className={styles.thumb}
                          />
                        ) : (
                          <div className={styles.thumb} aria-hidden="true" />
                        )}
                        <span>{category.name.uk}</span>
                        {incomplete && (
                          <span className={styles.incompleteBadge}>{t("incompleteTranslation")}</span>
                        )}
                      </div>
                    </td>
                    <td>{tNav(category.group === "recipes" ? "recipes" : "conservation")}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => setModalState({ mode: "edit", category })}
                          className={styles.editButton}
                        >
                          {t("edit")}
                        </button>
                        <AdminDeleteButton
                          confirmMessage={t("confirmDeleteCategory", { name: category.name.uk })}
                          label={t("delete")}
                          deletingLabel={t("deleting")}
                          onDelete={() => deleteCategory(category._id)}
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
          title={modalState.mode === "create" ? t("addCategory") : t("editCategory")}
          onClose={() => setModalState(null)}
        >
          <CategoryForm
            mode={modalState.mode}
            category={modalState.mode === "edit" ? modalState.category : undefined}
            onSaved={handleSaved}
          />
        </AdminModal>
      )}
    </div>
  );
}
