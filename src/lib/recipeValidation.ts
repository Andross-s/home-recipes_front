// Mirrors the backend's Joi schemas (recipe.schemas.ts) so obviously-invalid
// submissions are caught before a round trip to the API.

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type RecipeValidationKey =
  | "required"
  | "titleMinLength"
  | "titleMaxLength"
  | "descriptionMaxLength"
  | "stepMinLength"
  | "atLeastOneStep"
  | "amountRequired";

export function validateTitle(title: string): RecipeValidationKey | undefined {
  const trimmed = title.trim();
  if (!trimmed) return "required";
  if (trimmed.length < 2) return "titleMinLength";
  if (trimmed.length > 200) return "titleMaxLength";
  return undefined;
}

export function validateDescription(description: string): RecipeValidationKey | undefined {
  if (description.length > 2000) return "descriptionMaxLength";
  return undefined;
}

export function validateSteps(steps: string[]): RecipeValidationKey | undefined {
  const nonEmpty = steps.filter((step) => step.trim().length > 0);
  if (nonEmpty.length === 0) return "atLeastOneStep";
  return undefined;
}

export function validateAmount(amount: string): RecipeValidationKey | undefined {
  if (!amount.trim()) return "amountRequired";
  return undefined;
}

export type ImageValidationKey = "invalidType" | "tooLarge";

export function validateImageFile(file: File): ImageValidationKey | undefined {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "invalidType";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "tooLarge";
  return undefined;
}
