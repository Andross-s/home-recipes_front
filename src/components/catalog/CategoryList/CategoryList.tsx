import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localizedName } from "@/lib/localizedName";
import type { Category, Group } from "@/types/recipe";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
  group?: Group;
  activeCategory?: string;
  search?: string;
  ingredient?: string;
  locale: string;
}

export default async function CategoryList({
  categories,
  group,
  activeCategory,
  search,
  ingredient,
  locale,
}: CategoryListProps) {
  const t = await getTranslations("Catalog");

  const baseQuery = {
    ...(group ? { group } : {}),
    ...(search ? { search } : {}),
    ...(ingredient ? { ingredient } : {}),
  };

  return (
    <ul className={styles.list}>
      <li>
        <Link
          href={{ pathname: "/recipes", query: baseQuery }}
          className={`${styles.link} ${!activeCategory ? styles.active : ""}`}
        >
          {t("allCategories")}
        </Link>
      </li>
      {categories.map((category) => (
        <li key={category._id}>
          <Link
            href={{ pathname: "/recipes", query: { ...baseQuery, category: category._id } }}
            className={`${styles.link} ${activeCategory === category._id ? styles.active : ""}`}
          >
            {localizedName(category.name, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
