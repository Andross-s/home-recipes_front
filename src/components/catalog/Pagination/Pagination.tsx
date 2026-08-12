import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  perPage: number;
  totalItems: number;
  baseQuery: Record<string, string | undefined>;
}

export default async function Pagination({ page, perPage, totalItems, baseQuery }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  if (totalPages <= 1) return null;

  const t = await getTranslations("Catalog");
  const cleanBaseQuery = Object.fromEntries(
    Object.entries(baseQuery).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav className={styles.pagination} aria-label={t("paginationLabel")}>
      {isFirstPage ? (
        <span className={`${styles.navLink} ${styles.disabled}`}>{t("prevPage")}</span>
      ) : (
        <Link
          href={{ pathname: "/recipes", query: { ...cleanBaseQuery, page: String(page - 1) } }}
          className={styles.navLink}
        >
          {t("prevPage")}
        </Link>
      )}

      <span className={styles.pageInfo}>{t("pageOf", { page, totalPages })}</span>

      {isLastPage ? (
        <span className={`${styles.navLink} ${styles.disabled}`}>{t("nextPage")}</span>
      ) : (
        <Link
          href={{ pathname: "/recipes", query: { ...cleanBaseQuery, page: String(page + 1) } }}
          className={styles.navLink}
        >
          {t("nextPage")}
        </Link>
      )}
    </nav>
  );
}
