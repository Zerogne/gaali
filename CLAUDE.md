# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout note

The actual Next.js project lives in the nested `gaali/` directory (i.e. `Documents/gaali/gaali`), not the outer folder. Run all commands from there.

## Commands

```bash
npm run dev      # next dev --webpack  (Webpack, NOT Turbopack — both dev and build force --webpack)
npm run build    # next build --webpack
npm run lint     # eslint .
npm start        # next start
npm run seed     # tsx scripts/seed-db.ts  (note: scripts/ is currently empty)
```

There is no test runner configured. Node 22.x is required (`.nvmrc` / `engines`). Package manager is npm (a `package-lock.json` is committed; a stray empty `pnpm-lock.yaml` exists but npm is authoritative).

`next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so **type errors do not fail the build** — run `tsc --noEmit` manually if you want type checking. Images are `unoptimized`.

Path alias: `@/*` maps to the project root (`./*`).

## Domain

This is a **truck weighing / scale management dashboard** (Mongolian-language UI; many fields carry Mongolian comments). Trucks are weighed on entry (IN) and exit (OUT); net cargo weight = total IN − total OUT. Core flow: `in-session` → `out-session`, reconciled via `lib/truckSessions.ts`. Hardware integrations feed live data: **weight scales**, **RFID** tags, and **LPR** (license-plate-recognition cameras). The central domain type is `TruckLog` in `lib/types.ts` (it documents the weight math and many deprecated/back-compat fields — read it before touching weight logic).

## Architecture

### Multi-tenancy (critical)
Every company's data is **physically isolated by collection name**, not by a `companyId` filter. Always access tenant data through `getCompanyCollection(companyId, name)` in `lib/db/companyDb.ts`, which resolves to MongoDB collections named `company_{companyId}_{collection}` (e.g. `company_altan-logistics_logs`). Never query a bare collection for tenant data.
- Global metadata lives in a **separate admin database** (`gaali-admin`, override `MONGODB_ADMIN_DB_NAME`): the `companies` collection (the only shared collection) and `admin_users`. Accessed via `getCompaniesCollection()` / `getAdminUsersCollection()`.
- The application DB defaults to `truck-weighing-dashboard` (`MONGODB_DB_NAME`).
- `ensureCompanyCollections()` documents the per-company collection set and their indexes: `logs`, `workers`, `sessions`, `settings`, `products`, `truck_sessions`.
- `lib/db/client.ts` exports a shared `clientPromise` with retry + TLS-fallback logic and an HMR-safe global in dev. Use `getDatabase()` / the company helpers — don't `new MongoClient`.

### Auth & sessions (two-step, cookie-based)
There is no JWT/session store — auth state is **httpOnly cookies** (`company-id`, `worker-id`, `session-expires`, 7-day expiry) managed in `lib/auth/session.ts`. Login is two phases (`lib/auth/authServer.ts`, `"use server"`):
1. `loginCompany(companyId, password)` — bcrypt-verifies the company password, sets a *partial* session (company only).
2. `selectWorker(workerId)` — sets the worker; **companyId is read from the session, never from the client** (security-critical; preserve this pattern). `loginWorker` is legacy/deprecated.
Rate limiting on login via `lib/rateLimit.ts` (5 attempts / 15 min). Admin auth is separate (`lib/auth/admin.ts`, `lib/admin/`).

### Route protection
`proxy.ts` (root) is the Next.js Proxy (replaces deprecated middleware) and gates all routes — unauthenticated users are redirected to `/login`. It contains an **explicit allowlist of public paths**: `/login`, `/api/auth`, hardware-ingest endpoints (`/api/lpr/*`, `/api/weight/*`, `/api/rfid/ingest`, `/api/camera/*`), `/api/third-party/data`, `/api/v1/api/service`, seed/debug, and static assets. When adding a hardware/ingest or public API route, you must also add it to this allowlist or it will 401/redirect.

### Hardware ingest pattern
External bridge services (e.g. "Gaali Bridge", camera bridge) POST live readings to ingest endpoints that are public but secret-protected (`LPR_INGEST_SECRET`). Each subsystem follows an `ingest` / `latest` / `status` triad under `app/api/{lpr,weight,rfid,camera}/`, with matching client hooks in `hooks/` (`useLatestLpr`, `useLatestRfid`, `useWeightStatus`, `useCameraBridgeWebSocket`, `useConnectorSSE`, and the `*Autofill` hooks that pre-fill forms from live plate/weight/RFID reads). DB helpers: `lib/db/lpr.ts`, `lib/db/weight.ts`, `lib/db/rfid.ts`.

### Camera streaming
Camera/video streaming is documented in `ELECTRON-VIDEO-STREAMING.md` and `docs/`. Two standalone (non-Next.js) servers exist at the project root: `camera-ws-proxy-server.ts` (Express WebSocket proxy, browser→`ws://camera:9080/h264`, run via `npx tsx camera-ws-proxy-server.ts`, port `WS_PROXY_PORT`/3001) and `proxy.ts` is unrelated (route gate). `railway.toml` deploys a separate `camera-bridge/` service (`node server.js`) — that directory is not in this repo tree.

### Third-party integration
`/api/third-party/*` and `/api/v1/api/service` expose weighing data to external customs/partner systems (the `sentToCustoms` flag on logs, `etos.ojus` compatibility shim). Formatting in `lib/thirdPartyFormat.ts`; per-record share links use `lib/uniqueCodes.ts`.

### Frontend
Next.js 16 App Router + React 19. UI is **shadcn/ui** (Radix primitives in `components/ui/`, config in `components.json`) with **Tailwind CSS v4** (`@tailwindcss/postcss`, theme via `next-themes`). Feature components are grouped by domain under `components/` (drivers, organizations, products, scale, sessions, transport, trucks, camera, contracts, history). Forms use `react-hook-form` + `zod` (validation schemas in `lib/validation.ts`). Reports export to PDF/Excel (`lib/pdf-export.ts`, `jspdf`, `xlsx`). Toasts via `sonner`.

### Storage / infra
Deployed to **Vercel** (`gaali.vercel.app`). Uses `@vercel/blob` for camera frame storage and `@upstash/redis` (Vercel KV) for latest-reading caches and rate limiting. MongoDB Atlas is the primary store.

## Conventions
- Server Actions and server-only auth modules are marked `"use server"` — keep secret-handling and session logic server-side.
- `lib/errors.ts` `handleError()` normalizes errors into safe `{ message }` responses; login/auth flows use generic "Invalid credentials" messages deliberately to prevent enumeration.
- `lib/csrf.ts`, `lib/rateLimit.ts`, and `lib/request-monitor.ts` provide cross-cutting request hardening.
