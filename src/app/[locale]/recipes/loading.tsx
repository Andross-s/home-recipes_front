import styles from "./loading.module.css";

export default function RecipesLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.tabsSkeleton} />
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.bar} />
          <div className={styles.bar} />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.barSmall} />
          ))}
        </aside>
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.card} />
          ))}
        </div>
      </div>
    </div>
  );
}
