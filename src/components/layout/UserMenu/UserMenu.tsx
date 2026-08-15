"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const t = useTranslations("Navigation");
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className={styles.guestActions}>
        <Link href="/login" className={styles.loginLink}>
          {t("login")}
        </Link>
        <Link href="/register" className={styles.registerLink}>
          {t("register")}
        </Link>
      </div>
    );
  }

  const initials = user.name.trim().charAt(0).toUpperCase();

  return (
    <details className={styles.menu}>
      <summary className={styles.trigger}>
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={32}
            height={32}
            className={styles.avatarImage}
          />
        ) : (
          <span className={styles.avatarFallback}>{initials}</span>
        )}
      </summary>
      <div className={styles.dropdown} role="menu">
        <Link href="/profile" className={styles.dropdownItem} role="menuitem">
          {t("profile")}
        </Link>
        <Link href="/profile/recipes" className={styles.dropdownItem} role="menuitem">
          {t("myRecipes")}
        </Link>
        <Link href="/profile/favorites" className={styles.dropdownItem} role="menuitem">
          {t("favorites")}
        </Link>
        {user.role === "admin" && (
          <Link href="/admin" className={styles.dropdownItem} role="menuitem">
            {t("adminPanel")}
          </Link>
        )}
        <button type="button" onClick={() => logout()} className={styles.logoutButton} role="menuitem">
          {t("logout")}
        </button>
      </div>
    </details>
  );
}
