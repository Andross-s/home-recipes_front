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
- **Swiper** — the multi-photo recipe gallery (touch/arrow/keyboard nav)
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
│   │   ├── page.tsx        # home page (group cards + latest recipes)
│   │   ├── login/, register/, verify-email/[token]/
│   │   ├── recipes/                 # catalog: filters, grid, pagination
│   │   │   ├── new/                 # create recipe (auth required)
│   │   │   └── [id]/                # recipe detail
│   │   │       └── edit/            # edit recipe (owner/admin only)
│   │   ├── profile/                 # name/avatar (Server Component shell)
│   │   │   ├── recipes/             # own recipes (client-fetched, see below)
│   │   │   └── favorites/           # favorited recipes (client-fetched)
│   │   ├── admin/                        # admin panel (role: admin only)
│   │   │   ├── categories/, ingredients/, recipes/, users/
│   │   │   └── layout.tsx                # AdminRoute guard + sidebar
│   │   ├── not-found.tsx   # localized 404
│   │   └── [...rest]/      # catch-all -> triggers not-found.tsx
│   └── not-found.tsx       # global fallback (invalid/missing locale)
├── components/
│   ├── layout/               # Header, Footer, LocaleSwitcher, UserMenu
│   ├── auth/                 # LoginForm, RegisterForm, VerifyEmailView,
│   │                          # VerificationBanner, PrivateRoute, AdminRoute
│   ├── catalog/               # GroupTabs, CategoryList, SearchBox,
│   │                          # IngredientFilter, Pagination
│   ├── home/                  # GroupCard
│   ├── RecipeGallery/          # Swiper-based multi-photo gallery
│   ├── recipes/                # RecipeCard, RecipeGrid, FavoriteButton,
│   │                            # RecipeForm, RecipeImagesField, IngredientPicker,
│   │                            # StepsField, EditRecipeGuard/Link, CreateRecipeLink
│   ├── profile/                # AvatarUploader, ProfileDetailsForm,
│   │                            # OwnRecipesList, FavoritesList, ProfileRecipeCard,
│   │                            # DeleteRecipeButton, RemoveFavoriteButton
│   └── admin/                  # AdminSidebar, AdminModal, AdminDeleteButton,
│                                # MultilingualNameFields, CategoryManager/Form,
│                                # IngredientManager/Form, AdminRecipesManager,
│                                # AdminUsersManager, AdminTable.module.css (shared)
├── context/
│   └── AuthContext.tsx      # user, accessToken, isAuthenticated, role, isLoading
├── hooks/
│   └── useRequireAuth.ts    # redirect-to-/login hook behind PrivateRoute
├── i18n/
│   ├── routing.ts           # locales, default locale
│   ├── navigation.ts        # locale-aware Link/useRouter/usePathname
│   └── request.ts           # next-intl request config (reads the matched locale)
├── lib/
│   ├── api.ts                  # typed fetch wrapper: auth header, 401 refresh, ApiError
│   ├── errors.ts                # errorCode -> translated message
│   ├── validation.ts            # client-side form validation rules
│   ├── localizedName.ts          # MultilingualName -> current-locale string, uk fallback
│   ├── categories.ts, ingredients.ts, recipes.ts, users.ts, admin.ts   # typed API endpoints
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

## Catalog & recipes

- **`localizedName`**: categories and ingredients come back from the API
  with all three languages at once (`{ uk, en?, ka? }` — `uk` is the only
  one guaranteed non-empty, since an admin may not have translated a given
  entry yet). `lib/localizedName.ts` picks the current locale's value with
  a `uk` fallback; every place a category/ingredient name is shown
  (recipe cards, filters, the detail page) goes through it. A recipe's
  own `title`/`description`/`steps` are free text typed by the user, not a
  dictionary field, so they're rendered as-is.
- **List vs. detail population**: `GET /recipes` returns `category` and
  `ingredients[].ingredient` as bare ids (no populate, for a lighter list
  response); `GET /recipes/:id` populates both fully. The catalog page
  fetches the group's categories once and resolves each card's category
  name from an id → name map built from that list, rather than requesting
  it per card.
- **Filters are URL state, not component state**: group/category/search/
  ingredient/page all live in the query string, so a filtered view is
  shareable/bookmarkable and survives a reload. `GroupTabs`,
  `CategoryList`, and `Pagination` are plain Server Component links (zero
  client JS) since switching them is just a navigation; only `SearchBox`
  (debounced) and `IngredientFilter` (debounced typeahead against
  `GET /ingredients?search=&lang=`) need `'use client'`.
- **Loading state**: `app/[locale]/recipes/loading.tsx` and
  `recipes/[id]/loading.tsx` are Next.js loading boundaries — shown
  automatically while their Server Component fetches data, no manual
  spinner wiring needed.
- **Favorites**: `AuthContext.toggleFavorite` owns the optimistic
  add/remove (rolls back `user.favorites` on API failure) so favorite
  state stays centralized wherever `user` is read, not duplicated per
  button. `FavoriteButton` reads `user?.favorites.includes(id)` for its
  initial state and shows an inline "log in to favorite" hint instead of
  redirecting when a signed-out visitor clicks it.

## Recipe photos

- A recipe has `images: { url, publicId }[]` (up to 6), not a single
  `imageUrl` — `publicId` is `null` for photos migrated from the backend's
  old single-image field, which the API can't individually delete or
  reorder (it can only address photos by `publicId`). `RecipeImagesField`
  disables the remove/drag affordances on those specific thumbnails rather
  than offering an action that would silently fail to persist.
- **`RecipeGallery`** (`components/RecipeGallery/`) renders a plain static
  `next/image` for a single photo, or a Swiper carousel (touch swipe, arrow
  navigation, pagination dots, left/right keyboard nav) for multiple —
  each slide is its own `next/image` inside a fixed 4:3 box so paging
  never shifts the layout.
- **Uploading** (`RecipeForm` + `RecipeImagesField`): drag-and-drop or
  click-to-browse, client-side type/size checks before anything reaches
  the network, and a plain HTML5-drag reorder grid — the first photo in
  order becomes the recipe's thumbnail. On save, new files go in a FormData
  `images` field; in edit mode, removed/reordered *existing* photos are
  sent as JSON-encoded `imagesToDelete`/`imageOrder` arrays of `publicId`
  (matching `parseJsonFields` on the backend). New uploads are always
  appended after the reordered existing ones — the backend has no way to
  interleave them — so the form shows a note when both are present.

## Profile

- **`/profile`**: read-only email + verified badge, a name-edit form
  (`PATCH /users/me`), and a self-contained avatar block
  (`AvatarUploader` — client-side type/size check, square preview,
  `PATCH /users/me/avatar` as multipart). Both go through
  `AuthContext.updateName`/`updateAvatar`, which `setUser` the response so
  the header avatar and every other `useAuth()` consumer update instantly,
  with no reload or refetch.
- **`/profile/recipes`** and **`/profile/favorites`**: the user's own
  recipes (with Edit/Delete) and favorited recipes (with a remove button).
  Deleting asks for confirmation (`window.confirm`); both actions update
  local component state directly rather than reloading the list.
- **Why these lists are fetched client-side, not in the page's Server
  Component** (unlike every other data-fetching page in this app):
  `GET /recipes/own` and `GET /recipes/favorites` require the caller's
  access token, which — per the [Auth](#auth) section above — only ever
  lives in the browser's in-memory `lib/api.ts` state. A Server Component
  fetching it at request time (or at build time, for static generation)
  runs on the server with no access to that token and always gets a 401 —
  this is exactly what broke `next build` when these pages were first
  written as ordinary `await getX()` Server Components. `OwnRecipesList`
  and `FavoritesList` are `"use client"` and fetch in a `useEffect` after
  `PrivateRoute` confirms a signed-in user, the same pattern `AuthContext`
  itself uses for the silent-login `/users/me` call. `RecipeCard` (an
  async Server Component, since it uses `getTranslations`) can't be
  rendered from these — `ProfileRecipeCard` is a client-safe twin that
  reuses `RecipeCard`'s own CSS Module instead of duplicating styles.

## Admin panel

`/admin` (role `admin` only, guarded by `components/auth/AdminRoute`) has
four sections behind a shared sidebar (`AdminSidebar`, highlighting the
active one the same way the main nav does): Categories, Ingredients,
Recipes, Users. `/admin` itself just `redirect()`s to `/admin/categories`.

- **Categories & Ingredients** share the same shape: a table (thumbnail,
  `name.uk` as the primary column with an "incomplete translation" badge
  whenever `en` or `ka` is empty, group for categories) and an
  add/edit `AdminModal` built from **`MultilingualNameFields`** — three
  always-visible UA/EN/KA inputs (not tabs) where only UA is required,
  matching the backend's curated-dictionary schema. Editing sends the
  form's current value for all three locales, so an untouched field simply
  round-trips its existing value while a cleared one is explicitly removed
  — there's no separate "which locale did you change" tracking needed.
  Ingredients additionally get a debounced search box (`GET
  /ingredients?search=&lang=`, scoped to the admin's current locale).
- **Delete confirmation and 409s**: `AdminDeleteButton` (shared by all four
  sections) confirms via `window.confirm`, then surfaces a blocked delete
  inline — e.g. `CATEGORY_IN_USE`/`INGREDIENT_IN_USE` when recipes still
  reference the entry, or `LAST_ADMIN_PROTECTED` when demoting/deleting
  the system's only admin — instead of failing silently.
- **`/admin/recipes`**: reuses the public, unpaginated-filter-aware
  `getRecipes()`/`getCategories()` (title shown as raw free text, never
  through `localizedName`; category/group through it). Author names come
  from a one-off id → name map built from `GET /admin/users` (capped at
  the backend's 50-per-page max) since the recipe list endpoint doesn't
  populate `owner` and there's no "look up users by id" endpoint — fine at
  this project's scale; an owner past the first 50 users falls back to a
  shortened id instead of breaking.
- **`/admin/users`**: `GET /admin/users` (search + pagination), a role
  `<select>` (`PATCH /admin/users/:id/role`), a block toggle (`PATCH
  .../block`), and an email-verification toggle (`PATCH .../verify` — lets
  an admin unstick a user behind a broken verification email, or revert a
  mistaken verification) per row, each showing a row-scoped error on
  failure rather than a page-wide one, plus delete. The backend
  independently enforces the "never leave the system without an admin"
  invariant on both the role and delete paths.
- **Why every admin list is client-fetched**, even `/admin/categories` and
  `/admin/recipes` whose underlying `GET` endpoints are public: keeping
  the fetch-mutate-refresh cycle uniform across all four sections was
  simpler than mixing a Server Component list with client mutations for
  two of them and a fully client one (forced by `/admin/users` needing the
  admin's access token) for the other two.

## Not implemented yet

Everything from the original scope is done: the app shell (i18n, layout,
navigation, API client), the full auth flow (register, login, silent
refresh, email verification, route guards), the recipe catalog (home page,
filtered/paginated listing, recipe detail, favorites), recipe create/edit
with multi-photo upload, the profile pages (name/avatar, own recipes with
delete, favorites with remove), and the admin panel (categories,
ingredients, recipes, users).
