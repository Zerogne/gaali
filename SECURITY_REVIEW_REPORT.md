# Security & Code Review Report
## Truck Weighing Dashboard - Next.js Multi-Tenant Application

**Review Date:** 2025-01-27  
**Reviewer:** Senior Full-Stack Engineer & Security Reviewer  
**Scope:** Authentication, Multi-Tenant Isolation, Performance, Error Handling

---

## 1. Critical Security Issues (Must Fix ASAP)

### 🔴 CRITICAL-001: Plain Text Password Storage
**File:** `lib/auth/authServer.ts:46`, `lib/companies/seed.ts:22`, `lib/auth/mockData.ts:136-141`

**Issue:** Passwords are stored and compared in plain text. No hashing is implemented.

**Risk:** 
- Database compromise exposes all passwords
- Passwords visible in logs, backups, and memory dumps
- Violates security best practices and compliance requirements

**Fix:**
```typescript
// Install: npm install bcryptjs @types/bcryptjs
import bcrypt from 'bcryptjs'

// In seed.ts - hash passwords before storing
const hashedPassword = await bcrypt.hash(companyPasswords[company.id] || "password123", 10)
companyMetadata.password = hashedPassword

// In authServer.ts - compare hashed passwords
const company = await companiesCollection.findOne({ companyId })
if (!company || !company.password) {
  return { success: false, error: "Company not found" }
}

const isValid = await bcrypt.compare(password, company.password)
if (!isValid) {
  return { success: false, error: "Incorrect password" }
}
```

**Severity:** `critical`

---

### 🔴 CRITICAL-002: No Rate Limiting on Login Endpoints
**File:** `lib/auth/authServer.ts:27-68`, `app/(auth)/login/page.tsx`

**Issue:** Login endpoints have no rate limiting, allowing brute-force attacks.

**Risk:**
- Unlimited login attempts enable brute-force attacks
- Account enumeration attacks possible
- DoS potential on authentication endpoints

**Fix:**
```typescript
// Install: npm install @upstash/ratelimit @upstash/redis
// Or use in-memory rate limiting for simpler setup
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
})

export async function loginCompany(companyId: string, password: string) {
  // Rate limit by IP or companyId
  const identifier = `login:${companyId}:${await getClientIP()}`
  const { success, limit, remaining } = await ratelimit.limit(identifier)
  
  if (!success) {
    return {
      success: false,
      error: `Too many attempts. Try again in ${Math.ceil((limit - Date.now()) / 1000)}s`,
    }
  }
  
  // ... rest of login logic
}
```

**Severity:** `critical`

---

### 🔴 CRITICAL-003: Missing Route Protection Middleware
**File:** No `middleware.ts` file exists

**Issue:** No Next.js middleware to protect routes. Authentication is checked client-side only.

**Risk:**
- Unauthenticated users can access protected routes
- API routes can be called without authentication
- Client-side checks can be bypassed

**Fix:**
```typescript
// Create: middleware.ts at root
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies()
  const companyId = cookieStore.get('company-id')?.value
  const workerId = cookieStore.get('worker-id')?.value
  
  // Protect all routes except login and public assets
  if (!request.nextUrl.pathname.startsWith('/login') && 
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/api/companies') && // Allow public company list
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    
    if (!companyId || !workerId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Severity:** `critical`

---

### 🔴 CRITICAL-004: CompanyId Validation Bypass in Worker Selection
**File:** `components/auth/WorkerSelector.tsx:42-48`, `lib/auth/authServer.ts:74-104`

**Issue:** `companyId` is extracted from client-side worker data and sent to server. Server validates it exists but doesn't verify it matches the session.

**Risk:**
- User could select a worker from a different company by manipulating client data
- Cross-tenant data access possible

**Fix:**
```typescript
// In authServer.ts - selectWorker function
export async function selectWorker(
  companyId: string,  // Remove this parameter - get from session
  workerId: string
): Promise<LoginResult> {
  try {
    // Get companyId from session, not from client
    const sessionCompanyId = await getActiveCompany()
    
    // Verify worker belongs to the session company
    const workersCollection = await getCompanyCollection<WorkerWithPassword>(
      sessionCompanyId,  // Use session companyId
      "workers"
    )
    
    const worker = await workersCollection.findOne({ id: workerId })
    
    if (!worker || worker.companyId !== sessionCompanyId) {
      return {
        success: false,
        error: "Worker not found or does not belong to your company",
      }
    }
    
    // ... rest of logic
  }
}

// In WorkerSelector.tsx - remove companyId from request
const result = await handleWorkerSelect({
  workerId,  // Only send workerId
})
```

**Severity:** `critical`

---

### 🔴 CRITICAL-005: API Route Accepts CompanyId from URL Without Session Validation
**File:** `app/api/companies/[companyId]/workers/route.ts:8-24`

**Issue:** The API route accepts `companyId` from URL params and doesn't verify it matches the authenticated user's session.

**Risk:**
- Users can enumerate workers from other companies
- Cross-tenant data leakage

**Fix:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    
    // Get companyId from session, not URL
    const { getActiveCompany } = await import("@/lib/auth/session")
    const sessionCompanyId = await getActiveCompany()
    
    // Verify URL companyId matches session
    if (companyId !== sessionCompanyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    const workers = await getCompanyWorkers(sessionCompanyId)
    return NextResponse.json(workers, { status: 200 })
  } catch (error) {
    // ... error handling
  }
}
```

**Severity:** `critical`

---

### 🟠 HIGH-001: No Input Validation with Zod/Schema
**File:** `lib/auth/authServer.ts`, `app/api/products/route.ts:37-50`

**Issue:** No schema validation on login inputs, API request bodies, or form submissions.

**Risk:**
- SQL injection (if using SQL), NoSQL injection
- XSS via malformed inputs
- Type confusion attacks
- Invalid data causing crashes

**Fix:**
```typescript
// Install: npm install zod
import { z } from 'zod'

const loginCompanySchema = z.object({
  companyId: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
})

export async function loginCompany(
  companyId: string,
  password: string
): Promise<LoginResult> {
  try {
    // Validate input
    const validated = loginCompanySchema.safeParse({ companyId, password })
    if (!validated.success) {
      return {
        success: false,
        error: "Invalid input",
      }
    }
    
    // ... rest of logic
  }
}
```

**Severity:** `high`

---

### 🟠 HIGH-002: Session Cookies Not Secure in Development
**File:** `lib/auth/session.ts:52-67`

**Issue:** `secure` flag only set in production. In development, cookies can be sent over HTTP.

**Risk:**
- Session hijacking in development
- Accidental exposure in staging environments

**Fix:**
```typescript
cookieStore.set(COMPANY_ID_COOKIE, companyId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
})
```

**Severity:** `high`

---

### 🟠 HIGH-003: No CSRF Protection
**File:** All form submissions, API routes

**Issue:** No CSRF tokens on forms or API requests.

**Risk:**
- Cross-site request forgery attacks
- Unauthorized actions performed on behalf of users

**Fix:**
```typescript
// Use Next.js built-in CSRF or implement tokens
// For API routes, verify Origin/Referer headers
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // ... rest of logic
}
```

**Severity:** `high`

---

### 🟡 MEDIUM-001: No Session Expiration/Refresh Mechanism
**File:** `lib/auth/session.ts:52-67`

**Issue:** Sessions last 7 days with no refresh. No mechanism to invalidate old sessions.

**Risk:**
- Stolen sessions remain valid for 7 days
- No way to force logout on security incidents

**Fix:**
```typescript
// Add session token with expiration
interface SessionToken {
  companyId: string
  workerId: string
  issuedAt: number
  expiresAt: number
}

// Store session in DB with expiration
// Check expiration on each request
// Implement refresh token mechanism
```

**Severity:** `medium`

---

### 🟡 MEDIUM-002: Error Messages Leak Information
**File:** `lib/auth/authServer.ts:38-41`, `app/api/companies/route.ts:26-33`

**Issue:** Error messages reveal whether company exists, enabling enumeration.

**Risk:**
- Account enumeration attacks
- Information disclosure

**Fix:**
```typescript
// Use generic error messages
if (!company) {
  return {
    success: false,
    error: "Invalid credentials",  // Don't say "Company not found"
  }
}
```

**Severity:** `medium`

---

## 2. Auth & Login Review

### ✅ What's Good:
1. **HTTP-only cookies** - Session stored in httpOnly cookies (good)
2. **Server-side session management** - Sessions managed server-side
3. **Company-scoped collections** - Good multi-tenant architecture
4. **Two-step login flow** - Company → Worker selection is good UX

### ❌ What's Risky:
1. **Plain text passwords** - CRITICAL (see CRITICAL-001)
2. **No rate limiting** - CRITICAL (see CRITICAL-002)
3. **No input validation** - HIGH (see HIGH-001)
4. **No middleware protection** - CRITICAL (see CRITICAL-003)
5. **Client-side companyId** - CRITICAL (see CRITICAL-004)
6. **No password complexity requirements**
7. **No account lockout mechanism**
8. **No 2FA/MFA support**

### Recommendations:
1. Implement password hashing with bcrypt (10+ rounds)
2. Add rate limiting (5 attempts per 15 minutes per IP/company)
3. Add Zod validation for all inputs
4. Implement middleware for route protection
5. Always get companyId from session, never from client
6. Add password complexity rules (min 8 chars, mixed case, numbers)
7. Consider adding 2FA for sensitive operations

---

## 3. Multi-Tenant Isolation Check

### ✅ What's Good:
1. **Company-scoped collections** - `getCompanyCollection()` pattern is excellent
2. **Session-based companyId** - `getActiveCompany()` gets companyId from session
3. **Consistent pattern** - Most queries use company-scoped collections

### ❌ What's Risky:

#### CRITICAL: Worker Selection API Route
**File:** `app/api/companies/[companyId]/workers/route.ts`

**Issue:** Accepts `companyId` from URL without validating against session.

**Fix:** See CRITICAL-005 above.

#### CRITICAL: Worker Selection Component
**File:** `components/auth/WorkerSelector.tsx:42-48`

**Issue:** Extracts `companyId` from client-side worker data.

**Fix:** See CRITICAL-004 above.

#### MEDIUM: Products API Route
**File:** `app/api/products/route.ts:7-11`

**Status:** ✅ **SAFE** - Uses `getActiveCompany()` from session internally.

#### MEDIUM: Truck Logs API
**File:** `lib/api.ts:89-111`

**Status:** ✅ **SAFE** - Uses `getActiveCompany()` from session.

### Verification Checklist:
- ✅ `getTruckLogs()` - Uses session companyId
- ✅ `saveTruckLog()` - Uses session companyId
- ✅ `sendTruckLogToCustoms()` - Uses session companyId
- ✅ `getProducts()` - Uses session companyId
- ✅ `addProduct()` - Uses session companyId
- ❌ `getCompanyWorkers()` API route - Accepts companyId from URL
- ❌ `selectWorker()` - Accepts companyId from client

### Recommendations:
1. **Never accept companyId from client** - Always get from session
2. **Remove companyId from API route params** - Use session instead
3. **Add middleware validation** - Verify companyId matches session on all routes
4. **Add audit logging** - Log all cross-tenant access attempts

---

## 4. Performance & Smoothness

### Issues Found:

#### 🟡 MEDIUM-003: No Caching for Products
**File:** `components/trucks/TruckSection.tsx:54-71`

**Issue:** Products are fetched on every component mount. No caching or memoization.

**Impact:** Unnecessary API calls, slower page loads.

**Fix:**
```typescript
// Use React Query or SWR for caching
import useSWR from 'swr'

const { data: products, mutate } = useSWR('/api/products', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // Cache for 1 minute
})
```

#### 🟡 MEDIUM-004: No Pagination for Truck Logs
**File:** `lib/api.ts:89-111`, `app/page.tsx:41-61`

**Issue:** All logs are loaded at once with `.find({})`. No pagination or limit.

**Impact:** Performance degrades as data grows. Large datasets cause slow loads.

**Fix:**
```typescript
export async function getTruckLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ logs: TruckLog[], total: number }> {
  const companyId = await getActiveCompany()
  const logsCollection = await getCompanyCollection<TruckLog>(companyId, "logs")
  
  const skip = (page - 1) * limit
  const logs = await logsCollection
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  const total = await logsCollection.countDocuments({})
  
  return {
    logs: logs.map(serializeLog),
    total,
  }
}
```

#### 🟡 MEDIUM-005: Missing Double-Click Protection
**File:** `components/trucks/TruckSection.tsx:122-173`, `183-220`

**Issue:** Save and Send buttons can be clicked multiple times before state updates.

**Impact:** Duplicate saves, duplicate API calls.

**Fix:**
```typescript
// Already has `isSaving` and `isSending` states - but ensure they're set immediately
const handleSave = async () => {
  if (isSaving) return // Early return
  
  setIsSaving(true) // Set immediately
  try {
    // ... save logic
  } finally {
    setIsSaving(false)
  }
}
```

**Status:** ✅ Partially fixed - buttons are disabled, but add early return for safety.

#### 🟡 MEDIUM-006: No Request Deduplication
**File:** `app/page.tsx:41-61`, `components/trucks/TruckSection.tsx:54-71`

**Issue:** Multiple components might fetch the same data simultaneously.

**Impact:** Redundant API calls.

**Fix:** Use React Query or SWR which automatically deduplicates requests.

#### 🟢 LOW-001: No Virtualization for Large Lists
**File:** `components/trucks/TruckTable.tsx` (if exists)

**Issue:** Large log tables render all rows at once.

**Impact:** Slow rendering with 1000+ rows.

**Fix:** Use `react-window` or `@tanstack/react-virtual` for virtualization.

### Recommendations:
1. **Implement React Query or SWR** - For caching and request deduplication
2. **Add pagination** - For truck logs and any large datasets
3. **Add loading skeletons** - Better UX during data fetching
4. **Implement optimistic updates** - Already partially done, make consistent
5. **Add request debouncing** - For search/filter inputs
6. **Use Server Components** - Where possible to reduce client bundle

---

## 5. Error Handling & DX Improvements

### Issues Found:

#### 🟡 MEDIUM-007: Inconsistent Error Handling
**File:** Multiple files

**Issue:** Some functions use try/catch, others don't. Error messages vary.

**Impact:** Some errors crash the app, others are swallowed.

**Fix:**
```typescript
// Create: lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code }
  }
  
  console.error('Unexpected error:', error)
  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : String(error),
    code: 'INTERNAL_ERROR',
  }
}
```

#### 🟡 MEDIUM-008: Missing Error Boundaries
**File:** `app/layout.tsx`, `app/page.tsx`

**Issue:** No React Error Boundaries to catch component errors.

**Impact:** Component errors crash entire app.

**Fix:**
```typescript
// Create: components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>
    }
    return this.props.children
  }
}
```

#### 🟡 MEDIUM-009: Generic Error Messages in Production
**File:** `app/api/companies/route.ts:26-33`

**Issue:** Error details exposed in development but generic in production. Good, but inconsistent.

**Status:** ✅ Mostly good - but ensure all routes follow this pattern.

#### 🟢 LOW-002: No Structured Logging
**File:** All files using `console.error`

**Issue:** Using `console.error` instead of structured logging.

**Impact:** Hard to debug production issues, no log aggregation.

**Fix:** Use a logging library like `pino` or `winston` with structured logs.

### Recommendations:
1. **Create centralized error handling** - See fix above
2. **Add Error Boundaries** - Catch component errors gracefully
3. **Implement structured logging** - For better debugging
4. **Add error monitoring** - Sentry, LogRocket, or similar
5. **Create error recovery flows** - Retry mechanisms, fallbacks
6. **Add user-friendly error messages** - Don't expose technical details

---

## 6. Prioritized Fix Plan

### [P0] Critical Security Fixes (Fix Immediately)

1. **CRITICAL-001: Implement Password Hashing**
   - Install `bcryptjs`
   - Hash passwords in seed script
   - Update login comparison to use `bcrypt.compare()`
   - **Estimated time:** 2 hours

2. **CRITICAL-002: Add Rate Limiting**
   - Install rate limiting library (Upstash or in-memory)
   - Add rate limiting to `loginCompany()` and `loginWorker()`
   - **Estimated time:** 3 hours

3. **CRITICAL-003: Create Route Protection Middleware**
   - Create `middleware.ts` at root
   - Protect all routes except login and public assets
   - **Estimated time:** 1 hour

4. **CRITICAL-004: Fix Worker Selection CompanyId Validation**
   - Remove `companyId` parameter from `selectWorker()`
   - Get `companyId` from session only
   - Update `WorkerSelector` component
   - **Estimated time:** 1 hour

5. **CRITICAL-005: Fix Workers API Route**
   - Remove `companyId` from URL params
   - Get `companyId` from session
   - Add validation
   - **Estimated time:** 30 minutes

### [P1] Important Security & Performance Fixes (Fix This Week)

6. **HIGH-001: Add Input Validation**
   - Install `zod`
   - Create schemas for all inputs
   - Validate in server actions and API routes
   - **Estimated time:** 4 hours

7. **HIGH-002: Secure Cookies in Development**
   - Update cookie settings
   - Add environment variable for forced secure
   - **Estimated time:** 15 minutes

8. **HIGH-003: Add CSRF Protection**
   - Implement CSRF token validation
   - Verify Origin headers on API routes
   - **Estimated time:** 2 hours

9. **MEDIUM-003: Add Caching for Products**
   - Install React Query or SWR
   - Implement caching for products API
   - **Estimated time:** 2 hours

10. **MEDIUM-004: Add Pagination for Logs**
    - Update `getTruckLogs()` to support pagination
    - Update UI to show pagination controls
    - **Estimated time:** 3 hours

### [P2] Nice-to-Have Improvements (Fix This Month)

11. **MEDIUM-001: Session Expiration/Refresh**
    - Implement session tokens with expiration
    - Add refresh mechanism
    - **Estimated time:** 4 hours

12. **MEDIUM-002: Improve Error Messages**
    - Standardize error messages
    - Remove information leakage
    - **Estimated time:** 2 hours

13. **MEDIUM-005: Improve Double-Click Protection**
    - Add early returns in handlers
    - Ensure state updates immediately
    - **Estimated time:** 30 minutes

14. **MEDIUM-006: Request Deduplication**
    - Implement React Query/SWR
    - **Estimated time:** 2 hours (overlaps with caching)

15. **MEDIUM-007: Centralized Error Handling**
    - Create error handling utilities
    - Update all error handling
    - **Estimated time:** 3 hours

16. **MEDIUM-008: Add Error Boundaries**
    - Create ErrorBoundary component
    - Wrap critical sections
    - **Estimated time:** 1 hour

17. **LOW-001: Virtualization for Large Lists**
    - Install virtualization library
    - Update table components
    - **Estimated time:** 3 hours

18. **LOW-002: Structured Logging**
    - Install logging library
    - Replace console.error calls
    - **Estimated time:** 2 hours

---

## Summary

### Critical Issues: 5
### High Priority Issues: 3
### Medium Priority Issues: 9
### Low Priority Issues: 2

### Total Estimated Fix Time:
- **P0 (Critical):** ~8 hours
- **P1 (Important):** ~13 hours
- **P2 (Nice-to-have):** ~18 hours

### Immediate Action Required:
1. Implement password hashing (CRITICAL-001)
2. Add rate limiting (CRITICAL-002)
3. Create middleware (CRITICAL-003)
4. Fix companyId validation (CRITICAL-004, CRITICAL-005)

**The application has a solid multi-tenant architecture foundation, but critical security vulnerabilities must be addressed before production deployment.**

