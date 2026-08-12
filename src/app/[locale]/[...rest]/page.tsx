import { notFound } from "next/navigation";

// Catches any pathname under a locale that doesn't match a real route,
// so it renders the localized not-found.tsx instead of a generic 404.
export default function CatchAllPage() {
  notFound();
}
