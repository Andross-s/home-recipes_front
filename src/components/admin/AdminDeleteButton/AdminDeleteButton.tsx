"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import styles from "./AdminDeleteButton.module.css";

interface AdminDeleteButtonProps {
  confirmMessage: string;
  label: string;
  deletingLabel: string;
  onDelete: () => Promise<void>;
  onDeleted: () => void;
}

// Shared by categories/ingredients/recipes/users: confirm, call the
// entity-specific delete request, and surface a backend error inline
// (e.g. 409 CATEGORY_IN_USE) instead of leaving the admin guessing why
// nothing happened.
export default function AdminDeleteButton({
  confirmMessage,
  label,
  deletingLabel,
  onDelete,
  onDeleted,
}: AdminDeleteButtonProps) {
  const tErrors = useTranslations("Errors");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    setIsDeleting(true);
    try {
      await onDelete();
      onDeleted();
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" onClick={handleClick} disabled={isDeleting} className={styles.button}>
        {isDeleting ? deletingLabel : label}
      </button>
      {error && <p className={styles.error}>{getErrorMessage(tErrors, error)}</p>}
    </div>
  );
}
