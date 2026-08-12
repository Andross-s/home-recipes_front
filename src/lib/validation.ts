// Returns a key into the "Validation" message namespace, or undefined when valid.
export type ValidationKey = "required" | "invalidEmail" | "passwordMinLength" | "nameMinLength";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationKey | undefined {
  if (!email.trim()) return "required";
  if (!EMAIL_PATTERN.test(email)) return "invalidEmail";
  return undefined;
}

export function validateRequiredPassword(password: string): ValidationKey | undefined {
  if (!password) return "required";
  return undefined;
}

// Matches the backend's registerSchema (Joi: min(8)) — only enforced when
// setting a *new* password, not on login where an older/shorter password
// the backend itself doesn't reject on format should never be blocked client-side.
export function validateNewPassword(password: string): ValidationKey | undefined {
  if (!password) return "required";
  if (password.length < 8) return "passwordMinLength";
  return undefined;
}

export function validateName(name: string): ValidationKey | undefined {
  if (!name.trim()) return "required";
  if (name.trim().length < 2) return "nameMinLength";
  return undefined;
}
