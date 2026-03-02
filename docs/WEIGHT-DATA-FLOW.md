# Weight data: how it’s received and filtered per company

## 1. How weight data is received

### A. Ingest API (scale/bridge → server)

- **Endpoint:** `POST /api/weight/ingest`
- **Used by:** Scale bridge / Gaali Bridge that reads from the scale device and POSTs to this API.

**Request body (JSON):**

- `siteId` (string) – scale/site identifier  
- `weight` (number) – value  
- `unit` (string) – e.g. `"kg"`  
- Optional: `raw`, `ts`, `deviceIp`, `devicePort`, **`cameraIp`**

**Security (optional):**  
If `INGEST_SECRET` is set, the bridge can send header `x-signature` = HMAC-SHA256(body, secret). If both are present, the API verifies the signature; otherwise it still accepts the request (with a warning if only secret is set).

**Company assignment at ingest:**

- If the body includes **`cameraIp`**, the API resolves **company** from it:
  - Loads the **companies** collection (admin DB).
  - Finds a company whose `cameraSettings.camera1Ip` or `cameraSettings.camera2Ip` equals `cameraIp`.
  - Sets `companyId` on the weight document to that company’s `companyId`.
- If no `cameraIp` or no company matches, `companyId` is stored as `null`.

**Storage:**

- **DB:** `MONGODB_DB` / `MONGODB_DB_NAME` or default `"gaali"`.
- **Collection:** `weights`.
- Each ingest:
  - Inserts one **raw** record (all fields + `receivedAt`; no `isLatest`).
  - Upserts one **“latest”** record per `(siteId, companyId)` with `isLatest: true` and `updatedAt`, so there is a single “current” weight per site per company (or per site with `companyId: null`).

**Relevant code:** `app/api/weight/ingest/route.ts`, `lib/db/weight.ts`.

---

### B. Scale bridge (real-time in browser)

- **Components:** `useScaleBridge`.
- **Flow:** Frontend connects to a scale WebSocket (e.g. Gaali Bridge / Electron scale bridge). The bridge reads from the scale device and sends weight over WebSocket; the UI parses it and calls `onWeightDetected(weight)`.
- **Company:** This path does **not** go through the ingest API; it’s real-time in the browser. The only “filtering” is that the user is already logged in as a company; the scale value is shown in that company’s IN session form. There is no per-company filtering of the scale stream itself here.

---

## 2. How weight is filtered per company

### Stored data

- All weight records live in **one** collection: **`weights`** (in the DB above).
- Each document can have:
  - `companyId`: set at ingest from **`cameraIp`** (see above), or `null` if unknown.

### When reading weight (APIs)

**1) `GET /api/weight/status`**

- Uses **session**: `getActiveCompany()` (cookie).
- Builds query: `{ companyId: <active company id> }` (and optional `siteId`).
- Returns connection status and latest weight **only for that company**.

**2) `GET /api/weight/latest?siteId=...`**

- Uses **session**: `getActiveCompany()`.
- Query: `{ siteId, companyId: <active company>, isLatest: true }`.
- Returns the latest weight for that site **and** that company.

So:

- **Ingest:** company comes from **`cameraIp`** → company lookup in **companies** collection (`cameraSettings.camera1Ip` / `camera2Ip`).
- **Read:** company comes from **session** (logged-in company); every weight read API filters by `companyId === active company`.

### Indexes (for performance)

In `lib/db/weight.ts` the collection has indexes including:

- `companyId + receivedAt`
- `companyId + siteId + isLatest`

so filtering by company (and site/latest) is efficient.

---

## 3. Summary

| Step              | Where company comes from        | How it’s used                          |
|-------------------|----------------------------------|----------------------------------------|
| **Ingest**        | `cameraIp` → companies lookup   | Stored as `companyId` on each record  |
| **GET /status**   | Session (`getActiveCompany()`)  | Filter: `companyId === active company` |
| **GET /latest**   | Session (`getActiveCompany()`)  | Filter: `companyId === active company` |

So: **receiving** weight is via the ingest API (and optionally `cameraIp` for company) and/or the real-time scale bridge in the UI; **filtering for each company** is done by storing `companyId` at ingest (from camera IP) and by only reading weights where `companyId` matches the logged-in company in the status and latest APIs.
