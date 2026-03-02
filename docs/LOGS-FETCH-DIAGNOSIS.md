# Logs Fetch — Full Diagnosis & Unification

## Summary

All log-fetching across the app now uses the shared `fetchLogs(page, limit)` from `lib/fetchLogs.ts`.

## Before (Inconsistencies)

| Location | Method | Endpoint | Auth | Refresh |
|----------|--------|----------|------|---------|
| Dashboard | `fetchLogs(1, 50)` | `/api/logs` | ✓ | 3s + focus |
| Report | `fetchLogs(1, 10000)` | `/api/logs` | ✗ | ✗ |
| Sessions | `getTruckLogs()` Server Action | N/A | ✓ | ✗ |
| TruckSection | `fetch("/api/logs?page=1&limit=100")` | `/api/logs` | N/A | N/A |

## After (Unified)

| Location | Method | Params | Auth | Refresh |
|----------|--------|--------|------|---------|
| Dashboard | `fetchLogs(1, 50)` | page=1, limit=50 | ✓ | 3s + focus |
| Report | `fetchLogs(1, 10000)` | page=1, limit=10000 | ✓ | focus |
| Sessions | `fetchLogs(page, 30)` | paginated | ✓ | on action |
| TruckSection | `fetchLogs(1, 100)` | page=1, limit=100 | N/A | on mount |

## Shared `lib/fetchLogs.ts`

```ts
fetchLogs(page, limit) → GET /api/logs?page=&limit=
- cache: "no-store"
- credentials: "include"
- Same error handling
```

## Intentional Differences

- **Dashboard**: `mergeLogsByPlate()` — merges IN+OUT for same plate into one row
- **Report**: Raw logs — shows all records (IN and OUT separate) for reporting
- **Sessions**: Uses TruckTable (same as dashboard)
- **Limit**: 50 (dashboard), 30 (sessions), 100 (TruckSection net calc), 10000 (reports)

## API Backend

All requests hit `GET /api/logs` which calls `getTruckLogs(page, limit)` in `lib/api.ts`.

- Sort: `updatedAt ?? createdAt` (newest first)
- Limit cap: 10000
- Company-scoped via session
