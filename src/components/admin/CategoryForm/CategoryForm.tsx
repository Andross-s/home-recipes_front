"use client";

import { useTranslations } from "next-intl";
import { useState, type ChangeEvent, type FormEvent } from "react";
import MultilingualNameFields, {
  EMPTY_MULTILINGUAL_NAME,
  type MultilingualNameValue,
} from "@/components/admin/MultilingualNameFields/MultilingualNameFields";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { createCategory, updateCategory } from "@/lib/categories";
import { validateImageFile, type ImageValidationKey } from "@/lib/recipeValidation";
import type { Category, Group } from "@/types/recipe";
import styles from "./CategoryForm.module.css";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: Category;
  onSaved: (category: Category) => void;
}

const GROUPS: Group[] = ["recipes", "conservation"];

export default function CategoryForm({ mode, category, onSaved }: CategoryFormProps) {
  const t = useTranslations("Admin");
  const tErrors = useTranslations("Errors");

  const [name, setName] = useState<MultilingualNameValue>(
    category
      ? { uk: category.name.uk, en: category.name.en ?? "", ka: category.name.ka ?? "" }
      : EMPTY_MULTILINGUAL_NAME,
  );
  const [group, setGroup] = useState<Group>(category?.group ?? "recipes");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<ImageValidationKey | null>(null);
  const [ukError, setUkError] = useState(false);
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      setImageFile(null);
      return;
    }

    setImageError(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedUk = name.uk.trim();
    setUkError(!trimmedUk);
    setFormError(null);
    if (!trimmedUk) return;

    const payloadName = { uk: trimmedUk, en: name.en.trim(), ka: name.ka.trim() };

    setIsSubmitting(true);
    try {
      const saved =
        mode === "create"
          ? await createCategory({ name: payloadName, group }, imageFile)
          : await updateCategory(category!._id, { name: payloadName, group }, imageFile);
      onSaved(saved);
    } catch (error) {
      if (error instanceof ApiError) setFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayImage = imagePreview ?? category?.imageUrl;

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <MultilingualNameFields value={name} onChange={setName} ukError={ukError} idPrefix="category-name" />
      {ukError && <p className={styles.fieldError}>{t("nameUkRequired")}</p>}

      <div className={styles.field}>
        <label htmlFor="category-group" className={styles.label}>
          {t("groupLabel")}
        </label>
        <select
          id="category-group"
          value={group}
          onChange={(event) => setGroup(event.target.value as Group)}
          className={styles.select}
        >
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {t(g === "recipes" ? "groupRecipes" : "groupConservation")}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t("imageLabel")}</span>
        <div className={styles.imageRow}>
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- mixes local blob: preview with a remote Cloudinary URL
            <img src={displayImage} alt="" className={styles.imagePreview} />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
        </div>
        {imageError && (
          <p className={styles.fieldError}>
            {imageError === "invalidType" ? t("invalidImageType") : t("imageTooLarge")}
          </p>
        )}
      </div>

      {formError && (
        <div className={styles.formError}>
          <p>{getErrorMessage(tErrors, formError)}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
