"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { validateName, type ValidationKey } from "@/lib/validation";
import styles from "./ProfileDetailsForm.module.css";

export default function ProfileDetailsForm() {
  const t = useTranslations("Profile");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const { user, updateName } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<ValidationKey | undefined>();
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const error = validateName(name);
    setNameError(error);
    setFormError(null);
    setSaved(false);
    if (error) return;

    setIsSaving(true);
    try {
      await updateName(name.trim());
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setFormError(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.field}>
        <span className={styles.label}>{t("emailLabel")}</span>
        <div className={styles.emailRow}>
          <span className={styles.emailValue}>{user.email}</span>
          <span className={user.isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {user.isVerified ? t("verifiedBadge") : t("unverifiedBadge")}
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="profile-name" className={styles.label}>
          {t("nameLabel")}
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          className={nameError ? styles.inputInvalid : styles.input}
        />
        {nameError && <p className={styles.fieldError}>{tValidation(nameError)}</p>}
      </div>

      {formError && <p className={styles.fieldError}>{getErrorMessage(tErrors, formError)}</p>}
      {saved && <p className={styles.success}>{t("nameSaved")}</p>}

      <button type="submit" disabled={isSaving} className={styles.saveButton}>
        {isSaving ? t("savingName") : t("saveName")}
      </button>
    </form>
  );
}
