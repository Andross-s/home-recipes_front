"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton/AdminDeleteButton";
import { ApiError } from "@/lib/api";
import {
  deleteUser,
  getUsers,
  updateUserBlockStatus,
  updateUserRole,
  updateUserVerifiedStatus,
} from "@/lib/admin";
import { getErrorMessage } from "@/lib/errors";
import type { User, UserRole } from "@/types/auth";
import styles from "@/components/admin/AdminTable.module.css";

const PER_PAGE = 12;
const DEBOUNCE_MS = 300;

export default function AdminUsersManager() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const tCatalog = useTranslations("Catalog");
  const tErrors = useTranslations("Errors");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[] | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setUsers(null);
      getUsers({ search: search.trim() || undefined, page, perPage: PER_PAGE }).then(
        ({ data, totalItems: total }) => {
          if (cancelled) return;
          setUsers(data);
          setTotalItems(total);
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, page]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  function goToPage(next: number) {
    setUsers(null);
    setPage(next);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function handleRoleChange(user: User, role: UserRole) {
    setPendingId(user._id);
    setRowError(null);
    try {
      const updated = await updateUserRole(user._id, role);
      setUsers((prev) => prev?.map((item) => (item._id === updated._id ? updated : item)) ?? prev);
    } catch (error) {
      if (error instanceof ApiError) {
        setRowError({ id: user._id, message: getErrorMessage(tErrors, error) });
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleBlockToggle(user: User) {
    setPendingId(user._id);
    setRowError(null);
    try {
      const updated = await updateUserBlockStatus(user._id, !user.isBlocked);
      setUsers((prev) => prev?.map((item) => (item._id === updated._id ? updated : item)) ?? prev);
    } catch (error) {
      if (error instanceof ApiError) {
        setRowError({ id: user._id, message: getErrorMessage(tErrors, error) });
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleVerifiedToggle(user: User) {
    setPendingId(user._id);
    setRowError(null);
    try {
      const updated = await updateUserVerifiedStatus(user._id, !user.isVerified);
      setUsers((prev) => prev?.map((item) => (item._id === updated._id ? updated : item)) ?? prev);
    } catch (error) {
      if (error instanceof ApiError) {
        setRowError({ id: user._id, message: getErrorMessage(tErrors, error) });
      }
    } finally {
      setPendingId(null);
    }
  }

  function handleDeleted(id: string) {
    setUsers((prev) => (prev ? prev.filter((user) => user._id !== id) : prev));
    setTotalItems((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("usersTitle")}</h1>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t("searchUsersPlaceholder")}
          className={styles.searchInput}
        />
      </div>

      {users === null ? (
        <p className={styles.loading}>{tCommon("loading")}</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>{t("noUsers")}</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("nameColumn")}</th>
                  <th>{t("emailColumn")}</th>
                  <th>{t("roleColumn")}</th>
                  <th>{t("statusColumn")}</th>
                  <th>{t("verifiedColumn")}</th>
                  <th>{t("actionsColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        disabled={pendingId === user._id}
                        onChange={(event) => handleRoleChange(user, event.target.value as UserRole)}
                        className={styles.roleSelect}
                      >
                        <option value="user">{t("roleUser")}</option>
                        <option value="admin">{t("roleAdmin")}</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${user.isBlocked ? styles.statusWarn : styles.statusOk}`}
                      >
                        {user.isBlocked ? t("statusBlocked") : t("statusActive")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${user.isVerified ? styles.statusOk : styles.statusWarn}`}
                      >
                        {user.isVerified ? t("emailVerified") : t("emailNotVerified")}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => handleVerifiedToggle(user)}
                          disabled={pendingId === user._id}
                          className={styles.blockToggle}
                        >
                          {user.isVerified ? t("unverifyEmail") : t("verifyEmail")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBlockToggle(user)}
                          disabled={pendingId === user._id}
                          className={`${styles.blockToggle} ${user.isBlocked ? "" : styles.blockToggleActive}`}
                        >
                          {user.isBlocked ? t("unblock") : t("block")}
                        </button>
                        <AdminDeleteButton
                          confirmMessage={t("confirmDeleteUser", { name: user.name })}
                          label={t("delete")}
                          deletingLabel={t("deleting")}
                          onDelete={() => deleteUser(user._id)}
                          onDeleted={() => handleDeleted(user._id)}
                        />
                      </div>
                      {rowError?.id === user._id && <p className={styles.fieldError}>{rowError.message}</p>}
                    </td>
                  </tr>
                ))}
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
