"use client";

import { useTranslations } from "next-intl";
import { Suspense, useEffect, useRef } from "react";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher/LocaleSwitcher";
import NavLinks from "@/components/layout/NavLinks/NavLinks";
import navLinksStyles from "@/components/layout/NavLinks/NavLinks.module.css";
import UserMenu from "@/components/layout/UserMenu/UserMenu";
import { Link } from "@/i18n/navigation";
import styles from "@/components/layout/Header/Header.module.css";

// NavLinks reads useSearchParams() to highlight the active group, which
// forces a client bailout on static pages unless wrapped in Suspense — this
// fallback mirrors the same links unhighlighted so there's no layout shift
// while it resolves.
function NavLinksFallback() {
  const t = useTranslations("Navigation");
  return (
    <div className={navLinksStyles.navLinks}>
      <Link href="/" className={navLinksStyles.navLink}>
        {t("home")}
      </Link>
      <Link
        href={{ pathname: "/recipes", query: { group: "recipes" } }}
        className={navLinksStyles.navLink}
      >
        {t("recipes")}
      </Link>
      <Link
        href={{ pathname: "/recipes", query: { group: "conservation" } }}
        className={navLinksStyles.navLink}
      >
        {t("conservation")}
      </Link>
      <Link href="/profile/favorites" className={navLinksStyles.navLink}>
        {t("favorites")}
      </Link>
    </div>
  );
}

// The mobile toggle is still a plain checkbox+label pair driven entirely by
// CSS (`.navToggleInput:checked ~ .nav`) for the open action, but closing it
// on a link click or an outside click needs JS, hence the ref instead of
// making the whole thing React state.
export default function MobileNav() {
  const t = useTranslations("Navigation");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  function closeMenu() {
    if (checkboxRef.current) checkboxRef.current.checked = false;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    // display: contents keeps the checkbox/label/nav as direct flex items of
    // .inner (the CSS toggle relies on them being siblings of each other),
    // this div only exists to give the outside-click listener one element to
    // check against.
    <div ref={wrapperRef} className={styles.mobileNavRoot}>
      <input ref={checkboxRef} type="checkbox" id="nav-toggle" className={styles.navToggleInput} />
      <label htmlFor="nav-toggle" className={styles.navToggleLabel} aria-label={t("menu")}>
        <span className={styles.navToggleIcon} />
      </label>

      {/*
        Locale switcher and auth actions live inside <nav> itself (not a
        separate top-bar group) so they collapse into the mobile dropdown
        together with the links instead of crowding the 390px header row.
      */}
      <nav className={styles.nav} aria-label={t("menu")}>
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks onLinkClick={closeMenu} />
        </Suspense>
        <div className={styles.navActions}>
          <LocaleSwitcher />
          <UserMenu />
        </div>
      </nav>
    </div>
  );
}
