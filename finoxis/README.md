# Finoxis — Next.js

B2B marketplace and verified Indian manufacturers directory. This is the Next.js 16 (App Router) version of the former **React (Vite) + Node (Express)** project. The frontend and the API now run as **one app**.

## Quick start

```bash
cp .env.example .env      # set MONGODB_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Create the default super admin (`admin@gmail.com` / `Admin@123`, same as before):

```bash
npm run create-admin
```

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signs user and admin tokens |
| `JWT_EXPIRES_IN` | no | User token lifetime (default `7d`) |
| `NEXT_PUBLIC_API_URL` | no | Only set it if the API runs on another origin. Default is `/api` on the same app |
| `UPLOAD_DIR` | no | Where uploaded images are stored (default `./uploads`) |
| `MONGODB_DNS_SERVERS` | no | DNS servers used for Atlas SRV lookups (default `1.1.1.1`, `system` to disable) |
| `CLIENT_URL` | no | Extra origin allowed by CORS on `/api` |

`PORT` is no longer read from `.env`. Use `next dev -p 5000` or `next start -p 5000` if you need a specific port.

## Project structure

```
src/
  app/
    (site)/          public pages, wrapped with Header + Footer
    (auth)/          /login, /register
    admin/           admin panel pages
    api/             REST API (Route Handlers), same URLs as the old Express server
    uploads/         serves uploaded images from disk, with default-image fallbacks
    layout.jsx       global CSS (same order as the old bundle) + providers
  views/             page components ported from the old src/pages (client components)
  components/        Header, Footer, ProductCard, EnquiryModal, Toast, admin/*
  context/           AuthContext, CartContext
  lib/               api.js (axios client), config.js, imageHelper.js, csvHelper.js
  server/            backend: db, models, controllers, middleware, uploads, http adapter
  proxy.js           CORS for /api (Next 16 "proxy", formerly middleware)
scripts/             CLI scripts (create admin, seeders, data maintenance)
uploads/             products/, categories/, profiles/
```

### How the API was ported

Each Express router became Route Handler files at the same path. For example, `routes/adminProductRoutes.js` became `src/app/api/admin/products/**/route.js`. The controllers and auth middleware are the original code, converted to ES modules. They are wired together through `src/server/http.js`:

```js
export const PUT = handle(protect, productUpload.array('images', 4), updateProduct);
```

`handle()` gives controllers the same `req` and `res` they had in Express: `body`, `query`, `params`, `headers`, and multer-style `file`/`files`, plus `status()`, `json()` and `send()`. It also opens the cached MongoDB connection, and maps errors the way the old Express error handler did. Upload limits are unchanged: products allow 4 images × 5 MB, categories 5 MB, profiles 3 MB.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run create-admin` | Create the default super admin |
| `npm run seed:sellers` | Seed sample sellers |
| `npm run seed:1000-sellers` | Seed 1000 sellers |
| `npm run inspect-data` | Print data counts |
| `npm run check-image-hosts` | List the image hostnames in use |
| `npm run migrate:image-https` | Upgrade legacy Flipkart image URLs to HTTPS |

Scripts read `.env` through `node --env-file`, so they need Node 20.6+.

## Deployment notes

- Uploaded images are written to the local disk (`uploads/`). Run the app on a server with a persistent disk (VPS, Docker volume, Render or Railway disk). On serverless hosts such as Vercel the filesystem is temporary, so new uploads would disappear. Images that are external URLs (most imported products) work everywhere.
- `/cart`, `/checkout` and `/orders/:id` still redirect to `/shop` and `/profile`, as before. The old cart, checkout and order pages are kept in `src/views/legacy/` but are not routed.
