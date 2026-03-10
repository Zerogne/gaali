# Session & Third-Party Data Consistency Guide

This document describes the IN/OUT session flow, plate search, and third-party integration. **Do not change these behaviors without updating this doc**—they are interdependent.

## 1. Plate Search (OUT Session Form)

**Purpose:** When entering a plate in the OUT form, auto-fill driver, cargo, origin, etc. from the matching IN session.

**Key files:**
- `lib/truckSessions.ts` → `findLatestInSession()`
- `app/api/truck-sessions/find-in/route.ts`
- `components/sessions/OutSessionForm.tsx` (useEffect that fetches on plate change)

**Rules:**
- `findLatestInSession` returns the **most recent IN session that does NOT yet have a linked OUT session**.
- Exclude IN sessions where an OUT exists with `inSessionId` pointing to that IN.
- Plate matching: normalize (uppercase, no spaces). Try exact match, then regex, then optional-spaces fallback.
- Log matching: use `$or` with `normalizedPlate`, `normalizedNoSpaces`, and case-insensitive regex for legacy data.

## 2. Attaching OUT to IN Session

**Purpose:** When saving an OUT session, attach its data (outTime, netWeightKg) to the IN session.

**Key:** `lib/truckSessions.ts` → `attachOutToInSession()`

**Rules:**
- **Prefer `inSessionId`** from the OUT session when available (from form state).
- **Fallback to `findLatestInSession`** only when `inSessionId` is missing.
- Do not change this order—`findLatestInSession` excludes INs with OUT, so we must use explicit link when saving.

## 3. Third-Party Data (AKT / uniqueCode)

**Purpose:** One combined trip per AKT in `third_party_data`. Third-party systems look up by IN session's unique code.

**Key files:**
- `app/api/truck-sessions/route.ts` (POST → save to third_party_data)
- `components/sessions/OutSessionForm.tsx` → `performSendToThirdParty`
- `lib/uniqueCodes.ts` → `fetchUniqueCodesForLogs`
- `components/history/FullHistoryTable.tsx` → send button

**Rules:**
- **For OUT sessions:** Resolve linked IN session (by `inSessionId` or latest matching plate). Use **IN's uniqueCode as AKT**.
- **For IN sessions:** Use own uniqueCode.
- **Document key:** `code: aktCode` (IN's uniqueCode for completed trips).
- **Out form send button:** Same logic—use IN uniqueCode when OUT has `inSessionId`.
- **History send button:** `fetchUniqueCodesForLogs` must prefer IN uniqueCode for OUT logs (via `inSessionId`).

## 4. LPR Plate Autofill

**Purpose:** Auto-fill plate number from camera/LPR when detected.

**Key files:**
- `app/api/lpr/latest/route.ts`
- `hooks/useLatestLpr.ts`
- `hooks/useLprPlateAutofill.ts`
- `components/sessions/InSessionForm.tsx`, `OutSessionForm.tsx`
- `app/in-session/page.tsx`, `app/out-session/page.tsx`

**Rules:**
- **IN session:** Use camera 1 (entry). `useLatestLpr(1000, 1)` and `useLprPlateAutofill({ camera: 1 })`.
- **OUT session:** Use camera 2 (exit). `useLatestLpr(1000, 2)`.
- **LPR API fallbacks:** When camera+company filter returns nothing: try without camera, then without company. Ensures single-camera or single-company setups still work.

## 5. Data Flow Summary

```
IN session saved → truck_sessions (direction: IN)
OUT session saved → truck_sessions (direction: OUT), attachOutToInSession, third_party_data (code = IN uniqueCode)

Plate search (OUT form) → findLatestInSession (pending IN only) → find-in API → auto-fill form
Send to 3rd party (OUT) → IN uniqueCode as AKT, OUT weights
History send → fetchUniqueCodesForLogs (IN uniqueCode for OUT logs) → sendFormData
```

## 6. Common Breaking Changes to Avoid

- **Do not** remove the "exclude IN with OUT" logic from `findLatestInSession`.
- **Do not** change `attachOutToInSession` to use `findLatestInSession` without first trying `inSessionId`.
- **Do not** change third-party save to use OUT uniqueCode for OUT sessions—always use IN uniqueCode.
- **Do not** remove LPR API fallbacks (camera/company filter fallbacks).
- **Do not** change camera numbers: IN = 1, OUT = 2.
