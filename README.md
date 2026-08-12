# Home Recipes — Frontend

Frontend for the Home Recipes pet project: a catalog of home recipes and
conservation (preserves) split into categories, with user accounts,
favorites, and an admin panel.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **CSS Modules** — `Component.module.css` next to each component, no
  global CSS framework
- **next-intl** — locale-in-URL routing (`/uk`, `/en`, `/ka`), backend
  errors are mapped from `errorCode` to translated messages on the frontend
- **next/font** — self-hosted Noto Sans (Latin/Cyrillic) + Noto Sans
  Georgian, so uk/en/ka all render correctly
- Backend: separate Node.js/Express API, consumed via a typed `fetch`
  wrapper (base URL from `NEXT_PUBLIC_API_URL`)
- Deploy target: Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the
default locale (`/uk`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint

## Project structure

```
messages/                  # uk.json / en.json / ka.json translation dictionaries
src/
├── app/
│   ├── [locale]/           # all routes live under the locale segment
│   │   ├── layout.tsx      # root <html>/<body>, fonts, providers, Header/Footer
│   │   ├── page.tsx        # home page
│   │   ├── not-found.tsx   # localized 404
│   │   └── [...rest]/      # catch-all -> triggers not-found.tsx
│   └── not-found.tsx       # global fallback (invalid/missing locale)
├── components/
│   └── layout/              # Header, Footer, LocaleSwitcher, UserMenu
├── context/
│   └── AuthContext.tsx      # client-side auth state (user, login/register/logout)
├── i18n/
│   ├── routing.ts           # locales, default locale
│   ├── navigation.ts        # locale-aware Link/useRouter/usePathname
│   └── request.ts           # next-intl request config (reads the matched locale)
├── lib/
│   └── api.ts                # typed fetch wrapper: auth header, 401 refresh, ApiError
├── proxy.ts                  # next-intl locale routing (Next 16's renamed middleware)
├── styles/
│   ├── globals.css           # CSS variables (colors, spacing, typography) + resets
│   └── fonts.ts               # next/font setup
└── types/                     # User, Recipe, Category, Ingredient, API envelope types
```

## Backend contract

The API wraps every response as `{ status, data?, message? }` on success or
`{ status, errorCode, message, data: null }` on error. `lib/api.ts` throws a
typed `ApiError` (`status`, `errorCode`, `message`) for the latter — pages
map `errorCode` to a translated message rather than showing the raw
backend text, since the backend itself never localizes messages.

Auth uses a short-lived access token (kept in memory only) plus a rotating
refresh token (persisted in `localStorage`); a 401 automatically triggers
one refresh + retry in `lib/api.ts`.

Backend repo: https://github.com/Andross-s/home-recipes_back

## Not implemented yet

This initial setup only covers the app shell: i18n, layout, navigation,
and the API client. Recipe/category pages, auth forms, favorites, and the
admin panel are separate follow-up tasks.
