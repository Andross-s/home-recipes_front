import { Link } from "@/i18n/navigation";
import MobileNav from "@/components/layout/MobileNav/MobileNav";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Home Recipes
        </Link>
        <MobileNav />
      </div>
    </header>
  );
}
