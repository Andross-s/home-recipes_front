"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const t = useTranslations("Navigation");
  const { user, isLoading, logout } = useAuth();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  // Native <details> doesn't close itself on an outside click — only its own
  // <summary> toggles it — so this is the one thing we still need to handle
  // manually. Link/button clicks inside the dropdown call closeMenu directly
  // instead, since clicking a link is an "inside" click as far as this
  // listener is concerned.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false;
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    <details ref={detailsRef} className={styles.menu}>
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
        <Link href="/profile" onClick={closeMenu} className={styles.dropdownItem} role="menuitem">
          {t("profile")}
        </Link>
        <Link href="/profile/recipes" onClick={closeMenu} className={styles.dropdownItem} role="menuitem">
          {t("myRecipes")}
        </Link>
        <Link href="/profile/favorites" onClick={closeMenu} className={styles.dropdownItem} role="menuitem">
          {t("favorites")}
        </Link>
        {user.role === "admin" && (
          <Link href="/admin" onClick={closeMenu} className={styles.dropdownItem} role="menuitem">
            {t("adminPanel")}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            logout();
          }}
          className={styles.logoutButton}
          role="menuitem"
        >
          {t("logout")}
        </button>
      </div>
    </details>
  );
}
