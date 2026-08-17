"use client";

import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import styles from "./AdminModal.module.css";

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function AdminModal({ title, onClose, children }: AdminModalProps) {
  const t = useTranslations("Common");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label={t("close")}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
