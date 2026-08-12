import type { Group } from "@/types/recipe";
import { Link } from "@/i18n/navigation";
import styles from "./GroupCard.module.css";

interface GroupCardProps {
  group: Group;
  title: string;
  description: string;
}

export default function GroupCard({ group, title, description }: GroupCardProps) {
  return (
    <Link
      href={{ pathname: "/recipes", query: { group } }}
      className={`${styles.card} ${styles[group]}`}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </Link>
  );
}
