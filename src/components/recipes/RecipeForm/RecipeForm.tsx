"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import IngredientPicker, {
  type RecipeIngredientRow,
} from "@/components/recipes/IngredientPicker/IngredientPicker";
import RecipeImagesField, {
  toImageItems,
  type NewImageItem,
  type RecipeImageItem,
} from "@/components/recipes/RecipeImagesField/RecipeImagesField";
import StepsField from "@/components/recipes/StepsField/StepsField";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { localizedName } from "@/lib/localizedName";
import {
  validateDescription,
  validateSteps,
  validateTitle,
  type RecipeValidationKey,
} from "@/lib/recipeValidation";
import { createRecipe, updateRecipe } from "@/lib/recipes";
import type { Category, Group, Recipe } from "@/types/recipe";
import styles from "./RecipeForm.module.css";

interface RecipeFormProps {
  mode: "create" | "edit";
  recipeId?: string;
  initialRecipe?: Recipe;
  categories: Category[];
  locale: string;
}

interface FieldErrors {
  title?: RecipeValidationKey;
  description?: RecipeValidationKey;
  category?: "required";
  steps?: RecipeValidationKey;
  ingredients?: "amountRequired";
  cookTime?: "invalid";
}

const GROUPS: Group[] = ["recipes", "conservation"];

function initialIngredientRows(recipe: Recipe | undefined, locale: string): RecipeIngredientRow[] {
  if (!recipe) return [];
  return recipe.ingredients.map((item) => ({
    id: typeof item.ingredient === "string" ? item.ingredient : item.ingredient._id,
    label: typeof item.ingredient === "string" ? item.ingredient : localizedName(item.ingredient.name, locale),
    amount: item.amount,
  }));
}

export default function RecipeForm({ mode, recipeId, initialRecipe, categories, locale }: RecipeFormProps) {
  const t = useTranslations("RecipeForm");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const router = useRouter();

  const [group, setGroup] = useState<Group>(initialRecipe?.group ?? "recipes");
  const [category, setCategory] = useState(
    initialRecipe
      ? typeof initialRecipe.category === "string"
        ? initialRecipe.category
        : initialRecipe.category._id
      : "",
  );
  const [title, setTitle] = useState(initialRecipe?.title ?? "");
  const [description, setDescription] = useState(initialRecipe?.description ?? "");
  const [cookTime, setCookTime] = useState(initialRecipe?.cookTime ? String(initialRecipe.cookTime) : "");
  const [ingredientRows, setIngredientRows] = useState<RecipeIngredientRow[]>(
    initialIngredientRows(initialRecipe, locale),
  );
  const [steps, setSteps] = useState<string[]>(initialRecipe?.steps.length ? initialRecipe.steps : [""]);
  const [imageItems, setImageItems] = useState<RecipeImageItem[]>(
    toImageItems(initialRecipe?.images ?? []),
  );

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriesForGroup = categories.filter((c) => c.group === group);

  function handleGroupChange(nextGroup: Group) {
    setGroup(nextGroup);
    if (!categories.some((c) => c._id === category && c.group === nextGroup)) {
      setCategory("");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedSteps = steps.map((step) => step.trim()).filter(Boolean);
    const cookTimeValue = cookTime.trim() ? Number(cookTime) : undefined;

    const errors: FieldErrors = {
      title: validateTitle(title),
      description: validateDescription(description),
      category: category ? undefined : "required",
      steps: validateSteps(steps),
      ingredients: ingredientRows.some((row) => !row.amount.trim()) ? "amountRequired" : undefined,
      cookTime:
        cookTime.trim() && (!Number.isInteger(cookTimeValue) || (cookTimeValue as number) <= 0)
          ? "invalid"
          : undefined,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      const fields = {
        title: title.trim(),
        // Always a string (never omitted): the backend accepts an empty
        // description, and in edit mode omitting it would silently keep the
        // old value instead of letting the user clear it.
        description: description.trim(),
        group,
        category,
        ingredients: ingredientRows.map((row) => ({ ingredient: row.id, amount: row.amount.trim() })),
        steps: trimmedSteps,
        cookTime: cookTimeValue,
      };
      const newImageFiles = imageItems
        .filter((item): item is NewImageItem => item.kind === "new")
        .map((item) => item.file);

      let recipe: Recipe;
      if (mode === "create") {
        recipe = await createRecipe(fields, newImageFiles);
      } else {
        const remainingExistingPublicIds = imageItems
          .filter((item) => item.kind === "existing" && item.publicId !== null)
          .map((item) => (item as { publicId: string }).publicId);
        const originalPublicIds = (initialRecipe?.images ?? [])
          .map((image) => image.publicId)
          .filter((id): id is string => id !== null);
        const imagesToDelete = originalPublicIds.filter((id) => !remainingExistingPublicIds.includes(id));

        recipe = await updateRecipe(recipeId as string, {
          fields,
          newImageFiles,
          imagesToDelete,
          imageOrder: remainingExistingPublicIds,
        });
      }
      router.push(`/recipes/${recipe._id}`);
    } catch (error) {
      if (error instanceof ApiError) setFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <h1 className={styles.pageTitle}>{mode === "create" ? t("createTitle") : t("editTitle")}</h1>

      <div className={styles.field}>
        <span className={styles.label}>{t("groupLabel")}</span>
        <div className={styles.groupToggle}>
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGroupChange(g)}
              className={`${styles.groupButton} ${group === g ? styles.groupButtonActive : ""}`}
            >
              {t(g === "recipes" ? "groupRecipes" : "groupConservation")}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="recipe-category" className={styles.label}>
          {t("categoryLabel")}
        </label>
        <select
          id="recipe-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={fieldErrors.category ? styles.inputInvalid : styles.input}
        >
          <option value="">{t("categoryPlaceholder")}</option>
          {categoriesForGroup.map((c) => (
            <option key={c._id} value={c._id}>
              {localizedName(c.name, locale)}
            </option>
          ))}
        </select>
        {fieldErrors.category && <p className={styles.fieldError}>{tValidation("required")}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="recipe-title" className={styles.label}>
          {t("titleLabel")}
        </label>
        <input
          id="recipe-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={fieldErrors.title ? styles.inputInvalid : styles.input}
        />
        {fieldErrors.title && (
          <p className={styles.fieldError}>
            {fieldErrors.title === "required" ? tValidation("required") : t(fieldErrors.title)}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="recipe-description" className={styles.label}>
          {t("descriptionLabel")}
        </label>
        <textarea
          id="recipe-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={fieldErrors.description ? styles.textareaInvalid : styles.textarea}
        />
        {fieldErrors.description && <p className={styles.fieldError}>{t(fieldErrors.description)}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="recipe-cooktime" className={styles.label}>
          {t("cookTimeLabel")}
        </label>
        <input
          id="recipe-cooktime"
          type="number"
          min={1}
          value={cookTime}
          onChange={(event) => setCookTime(event.target.value)}
          className={fieldErrors.cookTime ? styles.inputInvalid : styles.input}
        />
        {fieldErrors.cookTime && <p className={styles.fieldError}>{t("cookTimeInvalid")}</p>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t("ingredientsLabel")}</span>
        <IngredientPicker locale={locale} rows={ingredientRows} onChange={setIngredientRows} />
        {fieldErrors.ingredients && <p className={styles.fieldError}>{t("ingredientAmountRequired")}</p>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t("stepsLabel")}</span>
        <StepsField steps={steps} onChange={setSteps} />
        {fieldErrors.steps && <p className={styles.fieldError}>{t("atLeastOneStep")}</p>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t("imagesLabel")}</span>
        <RecipeImagesField items={imageItems} onChange={setImageItems} />
      </div>

      {formError && (
        <div className={styles.formError}>
          <p>{getErrorMessage(tErrors, formError)}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? t("saving") : mode === "create" ? t("createSubmit") : t("editSubmit")}
        </button>
      </div>
    </form>
  );
}
