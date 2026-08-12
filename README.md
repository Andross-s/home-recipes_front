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
│   │   ├── login/, register/, verify-email/[token]/
│   │   ├── not-found.tsx   # localized 404
│   │   └── [...rest]/      # catch-all -> triggers not-found.tsx
│   └── not-found.tsx       # global fallback (invalid/missing locale)
├── components/
│   ├── layout/               # Header, Footer, LocaleSwitcher, UserMenu
│   └── auth/                 # LoginForm, RegisterForm, VerifyEmailView,
│                              # VerificationBanner, PrivateRoute, AdminRoute
├── context/
│   └── AuthContext.tsx      # user, accessToken, isAuthenticated, role, isLoading
├── hooks/
│   └── useRequireAuth.ts    # redirect-to-/login hook behind PrivateRoute
├── i18n/
│   ├── routing.ts           # locales, default locale
│   ├── navigation.ts        # locale-aware Link/useRouter/usePathname
│   └── request.ts           # next-intl request config (reads the matched locale)
├── lib/
│   ├── api.ts                 # typed fetch wrapper: auth header, 401 refresh, ApiError
│   ├── errors.ts               # errorCode -> translated message
│   └── validation.ts           # client-side form validation rules
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
map `errorCode` to a translated message (`lib/errors.ts` + the `Errors`
message namespace) rather than showing the raw backend text, since the
backend itself never localizes messages.

Backend repo: https://github.com/Andross-s/home-recipes_back

## Auth

- **Access token**: kept in memory only (a module variable in `lib/api.ts`,
  mirrored into `AuthContext`'s React state via a small subscription so
  components can read it reactively). Never touches storage, so it can't be
  read back by a later XSS payload or leak into browser history/logs.
- **Refresh token**: persisted in `localStorage`. This is a conscious
  trade-off, not the default choice — an httpOnly cookie would be strictly
  safer (invisible to any injected script), but it requires the backend to
  set it via `Set-Cookie` on login/refresh. This backend instead returns
  the refresh token as a plain field in the JSON body
  (`auth.controller.ts` → `login`/`refresh`), with no cookie involved, so
  there is nothing to opt into on the frontend side. `localStorage` is the
  only place a plain client can persist it across reloads. If the backend
  later adds an httpOnly cookie, only `lib/api.ts`'s token storage needs to
  change — everything else calls `api.*`/`useAuth()` and doesn't know where
  the token lives.
- **Silent login**: on first load there's no access token yet (memory is
  empty after a reload), so `AuthContext`'s initial `GET /users/me` call
  401s on purpose and lets `apiFetch`'s built-in refresh-and-retry use the
  stored refresh token — this is what keeps a user logged in across reloads
  without a visible flash of the logged-out state lasting longer than the
  refresh round-trip.
- **Route guards**: `components/auth/PrivateRoute` (or the `useRequireAuth`
  hook) redirects to `/login` when signed out; `components/auth/AdminRoute`
  additionally redirects non-admins to `/`. Both wait for
  `AuthContext`'s `isLoading` to settle before deciding, so they don't
  redirect a still-refreshing session.
- **Email verification**: `components/auth/VerificationBanner` shows
  whenever a signed-in user has `isVerified === false` — this naturally
  covers both backend states (`REQUIRE_EMAIL_VERIFICATION=false` lets an
  unverified user reach this state at all; `=true` blocks login before it,
  which `LoginForm` handles separately via the `ACCOUNT_NOT_VERIFIED`
  errorCode with an inline resend link).

## Not implemented yet

Recipe/category pages, the profile page, favorites, and the admin panel
are separate follow-up tasks. This covers the app shell (i18n, layout,
navigation, API client) plus the full auth flow (register, login, silent
refresh, email verification, route guards).
