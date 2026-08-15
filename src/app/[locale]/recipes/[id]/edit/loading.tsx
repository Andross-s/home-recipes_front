import styles from "./loading.module.css";

export default function EditRecipeLoading() {
  return (
    <div className={styles.page}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.bar} />
      ))}
    </div>
  );
}
