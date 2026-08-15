"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { validateImageFile } from "@/lib/recipeValidation";
import { MAX_RECIPE_IMAGES, type RecipeImage } from "@/types/recipe";
import styles from "./RecipeImagesField.module.css";

export interface ExistingImageItem {
  id: string;
  kind: "existing";
  url: string;
  publicId: string | null;
}

export interface NewImageItem {
  id: string;
  kind: "new";
  file: File;
  previewUrl: string;
}

export type RecipeImageItem = ExistingImageItem | NewImageItem;

export function toImageItems(images: RecipeImage[]): RecipeImageItem[] {
  return images.map((image, index) => ({
    id: image.publicId ?? `legacy-${index}-${image.url}`,
    kind: "existing",
    url: image.url,
    publicId: image.publicId,
  }));
}

interface RecipeImagesFieldProps {
  items: RecipeImageItem[];
  onChange: (items: RecipeImageItem[]) => void;
}

export default function RecipeImagesField({ items, onChange }: RecipeImagesFieldProps) {
  const t = useTranslations("RecipeForm");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExisting = items.some((item) => item.kind === "existing");
  const hasNew = items.some((item) => item.kind === "new");

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const remainingSlots = MAX_RECIPE_IMAGES - items.length;
    if (remainingSlots <= 0) {
      setError(t("tooManyImages", { max: MAX_RECIPE_IMAGES }));
      return;
    }

    const accepted: NewImageItem[] = [];
    let rejectionMessage: string | null = null;

    for (const file of files) {
      if (accepted.length >= remainingSlots) {
        rejectionMessage = t("tooManyImages", { max: MAX_RECIPE_IMAGES });
        break;
      }
      const invalid = validateImageFile(file);
      if (invalid === "invalidType") {
        rejectionMessage = t("invalidImageType", { name: file.name });
        continue;
      }
      if (invalid === "tooLarge") {
        rejectionMessage = t("imageTooLarge", { name: file.name });
        continue;
      }
      accepted.push({
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        kind: "new",
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setError(rejectionMessage);
    if (accepted.length > 0) {
      onChange([...items, ...accepted]);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    addFiles(event.dataTransfer.files);
  }

  function handleRemove(id: string) {
    const item = items.find((i) => i.id === id);
    if (item?.kind === "new") {
      URL.revokeObjectURL(item.previewUrl);
    }
    onChange(items.filter((i) => i.id !== id));
  }

  function handleDragOverItem(event: DragEvent<HTMLLIElement>, index: number) {
    event.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;

    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    dragIndexRef.current = index;
    onChange(reordered);
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${isDraggingOver ? styles.dropzoneActive : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <p className={styles.dropzoneLabel}>{t("dropzoneLabel")}</p>
        <p className={styles.dropzoneHint}>{t("dropzoneHint", { max: MAX_RECIPE_IMAGES })}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {hasExisting && hasNew && <p className={styles.note}>{t("newImagesAppendNote")}</p>}

      {items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((item, index) => {
            const canManage = item.kind === "new" || item.publicId !== null;
            const previewUrl = item.kind === "new" ? item.previewUrl : item.url;

            return (
              <li
                key={item.id}
                className={styles.thumb}
                draggable={canManage}
                onDragStart={() => {
                  if (canManage) dragIndexRef.current = index;
                }}
                onDragOver={(event) => canManage && handleDragOverItem(event, index)}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob previews mixed with remote thumbnails; not worth next/image's optimizer for a small form grid */}
                <img src={previewUrl} alt="" className={styles.thumbImage} />
                {index === 0 && <span className={styles.mainBadge}>{t("mainPhotoBadge")}</span>}
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className={styles.removeButton}
                    aria-label={t("removeImage")}
                  >
                    ×
                  </button>
                ) : (
                  <span
                    className={styles.lockedBadge}
                    title={t("legacyImageNote")}
                    aria-label={t("legacyImageNote")}
                  >
                    🔒
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
