import type { ApiError } from "@/lib/api";

interface ErrorTranslator {
  (key: string): string;
  has: (key: string) => boolean;
}

// Backend errorCodes are matched 1:1 against keys in the "Errors" message
// namespace; anything not explicitly translated falls back to "DEFAULT"
// instead of showing the backend's (untranslated) raw message.
export function getErrorMessage(t: ErrorTranslator, error: ApiError): string {
  return t.has(error.errorCode) ? t(error.errorCode) : t("DEFAULT");
}
