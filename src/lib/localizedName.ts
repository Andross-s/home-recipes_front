import type { MultilingualName } from "@/types/i18n";

// uk is always populated (required on the backend schema); en/ka are
// optional until an admin translates them, so fall back to uk when the
// current locale's value is missing.
export function localizedName(name: MultilingualName, locale: string): string {
  return name[locale as keyof MultilingualName] || name.uk;
}
