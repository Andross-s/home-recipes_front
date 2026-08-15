import styles from "./loading.module.css";

export default function ProfileFavoritesLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.titleBar} />
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
