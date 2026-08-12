import Link from "next/link";

// Renders only when a request falls outside the `[locale]` segment entirely
// (e.g. an invalid locale in the URL causes `notFound()` before that layout
// can render), so it needs its own <html>/<body> since no root layout exists.
// Plain next/link here (not the i18n-aware one) since there's no locale context.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>404</h1>
        <p>Page not found.</p>
        <Link href="/">Back to home</Link>
      </body>
    </html>
  );
}
