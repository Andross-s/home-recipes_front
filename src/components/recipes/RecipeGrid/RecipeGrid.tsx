import type { ReactNode } from "react";
import styles from "./RecipeGrid.module.css";

export default function RecipeGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
