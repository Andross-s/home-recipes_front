import styles from "./loading.module.css";

export default function ProfileLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.titleBar} />
      <div className={styles.blocks}>
        <div className={styles.block} />
        <div className={styles.block} />
      </div>
    </div>
  );
}
