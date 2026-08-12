import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  /** Omit when the child renders its own dynamic heading (e.g. a status page). */
  title?: string;
  children: ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {children}
      </div>
    </div>
  );
}
