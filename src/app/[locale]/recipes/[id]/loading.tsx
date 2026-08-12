import styles from "./loading.module.css";

export default function RecipeDetailLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.image} />
      <div className={styles.content}>
        <div className={styles.metaBar} />
        <div className={styles.titleBar} />
        <div className={styles.textBar} />
        <div className={styles.buttonBar} />
      </div>
    </div>
  );
}
