"use client";

import { useTranslations } from "next-intl";
import styles from "./MultilingualNameFields.module.css";

export interface MultilingualNameValue {
  uk: string;
  en: string;
  ka: string;
}

export const EMPTY_MULTILINGUAL_NAME: MultilingualNameValue = { uk: "", en: "", ka: "" };

interface MultilingualNameFieldsProps {
  value: MultilingualNameValue;
  onChange: (value: MultilingualNameValue) => void;
  ukError?: boolean;
  idPrefix: string;
}

// UA/EN/KA as three always-visible fields (not tabs) — only `uk` is
// required, matching the backend's curated-dictionary schema where en/ka
// can be filled in later by an admin.
export default function MultilingualNameFields({
  value,
  onChange,
  ukError,
  idPrefix,
}: MultilingualNameFieldsProps) {
  const t = useTranslations("Admin");

  return (
    <div className={styles.fields}>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-uk`} className={styles.label}>
          {t("nameUkLabel")}
        </label>
        <input
          id={`${idPrefix}-uk`}
          type="text"
          value={value.uk}
          onChange={(event) => onChange({ ...value, uk: event.target.value })}
          className={ukError ? styles.inputInvalid : styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-en`} className={styles.label}>
          {t("nameEnLabel")}
        </label>
        <input
          id={`${idPrefix}-en`}
          type="text"
          value={value.en}
          onChange={(event) => onChange({ ...value, en: event.target.value })}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-ka`} className={styles.label}>
          {t("nameKaLabel")}
        </label>
        <input
          id={`${idPrefix}-ka`}
          type="text"
          value={value.ka}
          onChange={(event) => onChange({ ...value, ka: event.target.value })}
          className={styles.input}
        />
      </div>
    </div>
  );
}
