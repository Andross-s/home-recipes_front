"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton/AdminDeleteButton";
import { getUsers } from "@/lib/admin";
import { getCategories } from "@/lib/categories";
import { localizedName } from "@/lib/localizedName";
import { deleteRecipe, getRecipes } from "@/lib/recipes";
import type { Category, Group, Recipe } from "@/types/recipe";
import styles from "@/components/admin/AdminTable.module.css";

const PER_PAGE = 12;
const GROUPS: Group[] = ["recipes", "conservation"];
const DEBOUNCE_MS = 300;
// GET /recipes doesn't populate `owner`, and there's no "look up users by
// id" endpoint — so author names come from a one-off map built from the
// admin users list. Fine at this project's scale; owners past the first 50
// users fall back to a shortened id.
const OWNER_LOOKUP_PER_PAGE = 50;

export default function AdminRecipesManager() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const tCatalog = useTranslations("Catalog");
  const tNav = useTranslations("Navigation");
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<Group | "">("");
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ownerNameById, setOwnerNameById] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getCategories().then(setCategories);
    getUsers({ perPage: OWNER_LOOKUP_PER_PAGE }).then(({ data }) => {
      setOwnerNameById(new Map(data.map((user) => [user._id, user.name])));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setRecipes(null);
      getRecipes({
        group: groupFilter || undefined,
        search: search.trim() || undefined,
        page,
        perPage: PER_PAGE,
      }).then(({ data, totalItems: total }) => {
        if (cancelled) return;
        setRecipes(data);
        setTotalItems(total);
      });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, groupFilter, page]);

  const categoryNameById = new Map(categories.map((c) => [c._id, localizedName(c.name, locale)]));
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  function goToPage(next: number) {
    setRecipes(null);
    setPage(next);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleGroupChange(value: Group | "") {
    setGroupFilter(value);
    setPage(1);
  }

  function handleDeleted(id: string) {
    setRecipes((prev) => (prev ? prev.filter((recipe) => recipe._id !== id) : prev));
    setTotalItems((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("recipesTitle")}</h1>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t("searchRecipesPlaceholder")}
          className={styles.searchInput}
        />
        <select
          value={groupFilter}
          onChange={(event) => handleGroupChange(event.target.value as Group | "")}
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

      {recipes === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : recipes.length === 0 ? (
        <p className={styles.empty}>{t("noRecipes")}</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("titleColumn")}</th>
                  <th>{t("authorColumn")}</th>
                  <th>{t("groupColumn")}</th>
                  <th>{t("categoryColumn")}</th>
                  <th>{t("dateColumn")}</th>
                  <th>{t("actionsColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => {
                  const ownerId = typeof recipe.owner === "string" ? recipe.owner : recipe.owner._id;
                  const ownerName =
                    typeof recipe.owner === "string" ? ownerNameById.get(ownerId) : recipe.owner.name;
                  const categoryName =
                    typeof recipe.category === "string"
                      ? categoryNameById.get(recipe.category)
                      : localizedName(recipe.category.name, locale);

                  return (
                    <tr key={recipe._id}>
                      <td>{recipe.title}</td>
                      <td>{ownerName ?? `…${ownerId.slice(-6)}`}</td>
                      <td>{tNav(recipe.group === "recipes" ? "recipes" : "conservation")}</td>
                      <td>{categoryName ?? "—"}</td>
                      <td>{new Date(recipe.createdAt).toLocaleDateString(locale)}</td>
                      <td>
                        <AdminDeleteButton
                          confirmMessage={t("confirmDeleteRecipe", { title: recipe.title })}
                          label={t("delete")}
                          deletingLabel={t("deleting")}
                          onDelete={() => deleteRecipe(recipe._id)}
                          onDeleted={() => handleDeleted(recipe._id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label={tCatalog("paginationLabel")}>
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={styles.navButton}
              >
                {tCatalog("prevPage")}
              </button>
              <span className={styles.pageInfo}>{tCatalog("pageOf", { page, totalPages })}</span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className={styles.navButton}
              >
                {tCatalog("nextPage")}
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
