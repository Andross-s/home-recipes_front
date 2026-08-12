import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Group } from "@/types/recipe";
import styles from "./GroupTabs.module.css";

interface GroupTabsProps {
  activeGroup?: Group;
  search?: string;
}

// Switching group drops category/ingredient/page (they're scoped to the old
// group's catalog) but keeps a free-text search, since that's not group-specific.
export default async function GroupTabs({ activeGroup, search }: GroupTabsProps) {
  const t = await getTranslations("Navigation");
  const groups: Group[] = ["recipes", "conservation"];

  return (
    <nav className={styles.tabs} aria-label={t("recipes")}>
      {groups.map((group) => (
        <Link
          key={group}
          href={{ pathname: "/recipes", query: { group, ...(search ? { search } : {}) } }}
          className={`${styles.tab} ${activeGroup === group ? styles.active : ""}`}
        >
          {t(group === "recipes" ? "recipes" : "conservation")}
        </Link>
      ))}
    </nav>
  );
}
