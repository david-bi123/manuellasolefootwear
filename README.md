# Manuella Sole Footwear

Premium footwear for men and women — a Next.js storefront with a full admin
console (inventory, sales, reports, team roles) for a boutique in Accra,
Ghana. Customers browse the catalogue and order personally on WhatsApp; the
team manages the business from `/admin`.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** design system (deep emerald, champagne & warm ivory)
- **MongoDB** via Mongoose (products, categories, sales, inventory, settings, team)
- **Cloudinary** for product image storage (optional — plain image URLs work too)
- **Auth**: signed session cookies (`jose`), role-based permissions, rate limiting
- **Recharts** for the admin dashboard, **framer-motion** for reveals
- **Sonner** toasts, **Radix UI** primitives, **lucide-react** icons

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI, SESSION_SECRET, …
npm run dev                  # http://localhost:3000
```

### Database bootstrap

```bash
npm run seed:demo            # demo catalogue (categories, products, sample sales)
npm run create-owner         # create the owner account (uses OWNER_* env vars)
npm run create-superadmin    # create the Samtech Labs super admin (optional)
npm run test:db              # sanity-check the database connection
```

The public storefront is at `/`; the admin console is at `/admin`
(sign-in at `/admin/login`). Access is by invitation — roles are
**owner → manager → staff**, plus the super-admin platform operator.

### npm scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js development, production build, production server |
| `lint` | ESLint |
| `seed` / `seed:demo` | Seed core / demo catalogue data |
| `create-owner` / `create-superadmin` | Bootstrap privileged accounts |
| `test:db` | Verify database connectivity and collections |

## Environment variables

See [.env.example](./.env.example) for the full list. The important ones for
production:

- `MONGODB_URI` — MongoDB Atlas connection string
- `SESSION_SECRET` — long random string for signing admin sessions
- `NEXT_PUBLIC_SITE_URL` — public origin, e.g. `https://manuellasolefootwear.vercel.app`
- `WHATSAPP_NUMBER` — business WhatsApp number (digits only, international format)
- `CLOUDINARY_*` — image storage (optional)
- `OWNER_*` / `SUPERADMIN_*` — only used by the create-* scripts

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the GitHub repo.
   Framework preset: **Next.js** (auto-detected). Build command `next build`,
   install command `npm install` — defaults are fine.
3. Add the environment variables above in
   **Project → Settings → Environment Variables** (Production + Preview).
   Set `NEXT_PUBLIC_SITE_URL` to your final domain.
4. Deploy. Then seed the production database once
   (`npm run seed:demo` locally with the production `MONGODB_URI`, or use the
   admin console after `npm run create-owner`).

Every push to `main` deploys to production; PRs get preview deployments.

## Project structure

```
src/
  app/(store)/     Public storefront (home, shop, product, about, contact…)
  app/admin/       Admin console ((auth) login, (dashboard) protected pages)
  components/      storefront/, admin/, ui/ primitives, motion/
  lib/             db, auth, services (catalogue, sales, analytics…), validators
  actions/         Server actions (auth, products, sales, inventory, team…)
public/images/     Product/category/editorial photography (see CREDITS.md)
scripts/           Seeding, account creation, image tooling
```

## Notes

- Image credits: see [public/images/CREDITS.md](./public/images/CREDITS.md).
- `public/images/shortlist*`, `candidates*` and `_test` hold local image-review
  scratch files; they are intentionally not committed.
- `AUTH.md` is kept out of the public repo (it documents internal auth behaviour).
- The storefront replaces itself with a renewal notice when the platform is
  paused by the operator (Admin → Platform). Super admins can still sign in.
