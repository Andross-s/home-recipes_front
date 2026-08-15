"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { validateImageFile, type ImageValidationKey } from "@/lib/recipeValidation";
import styles from "./AvatarUploader.module.css";

export default function AvatarUploader() {
  const t = useTranslations("Profile");
  const tErrors = useTranslations("Errors");
  const { user, updateAvatar } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<ImageValidationKey | null>(null);
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  function resetSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormError(null);
    const error = validateImageFile(file);
    if (error) {
      setValidationError(error);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setValidationError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!selectedFile) return;

    setIsSaving(true);
    setFormError(null);
    try {
      await updateAvatar(selectedFile);
      resetSelection();
    } catch (error) {
      if (error instanceof ApiError) setFormError(error);
    } finally {
      setIsSaving(false);
    }
  }

  const displayUrl = previewUrl ?? user.avatarUrl;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t("avatarTitle")}</h2>
      <div className={styles.row}>
        <div className={styles.previewCircle}>
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- mixes a local blob: preview with a remote Cloudinary URL
            <img src={displayUrl} alt={t("avatarAlt")} className={styles.previewImage} />
          ) : (
            <span className={styles.placeholderIcon} aria-hidden="true">
              👤
            </span>
          )}
        </div>

        <div className={styles.controls}>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          {validationError && (
            <p className={styles.fieldError}>
              {validationError === "invalidType" ? t("invalidAvatarType") : t("avatarTooLarge")}
            </p>
          )}
          {formError && <p className={styles.fieldError}>{getErrorMessage(tErrors, formError)}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedFile || isSaving}
            className={styles.saveButton}
          >
            {isSaving ? t("savingAvatar") : t("saveAvatar")}
          </button>
        </div>
      </div>
    </div>
  );
}
