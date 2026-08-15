"use client";

import { useTranslations } from "next-intl";
import styles from "./StepsField.module.css";

interface StepsFieldProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export default function StepsField({ steps, onChange }: StepsFieldProps) {
  const t = useTranslations("RecipeForm");

  function handleStepChange(index: number, value: string) {
    onChange(steps.map((step, i) => (i === index ? value : step)));
  }

  function handleRemove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...steps, ""]);
  }

  return (
    <div className={styles.wrapper}>
      {steps.map((step, index) => (
        <div key={index} className={styles.row}>
          <span className={styles.stepNumber}>{index + 1}</span>
          <textarea
            value={step}
            onChange={(event) => handleStepChange(index, event.target.value)}
            placeholder={t("stepPlaceholder", { number: index + 1 })}
            className={styles.textarea}
            rows={2}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className={styles.removeButton}
            aria-label={t("removeStep")}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={handleAdd} className={styles.addButton}>
        {t("addStep")}
      </button>
    </div>
  );
}
