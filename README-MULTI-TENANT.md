# Multi-Tenant Architecture Documentation

## Overview

This application implements a **company-scoped multi-tenant architecture** where each company has completely isolated data collections in MongoDB.

## Architecture

### Database Structure

#### Shared Collections
- `companies` - Global metadata for all companies (ONLY shared collection)

#### Company-Scoped Collections
Each company has its own isolated collections following the pattern:
- `company_{companyId}_logs` - Truck logs
- `company_{companyId}_workers` - Workers/employees
- `company_{companyId}_sessions` - Login sessions
- `company_{companyId}_settings` - Company settings

### Key Files

#### Database Layer
- `lib/db/client.ts` - MongoDB client connection
- `lib/db/companyDb.ts` - Company-scoped collection helpers
  - `getCompanyCollection(companyId, collectionName)` - **ONLY method** to access company data
  - `getCompaniesCollection()` - Access shared companies metadata

#### Authentication
- `lib/auth/session.ts` - Session management with companyId + workerId
  - `getActiveCompany()` - Get current company from session (throws if not authenticated)
  - `setSession(companyId, workerId)` - Set session after login
  - `clearSession()` - Clear session on logout

- `lib/auth/authServer.ts` - Login logic
  - Verifies worker exists in company's workers collection
  - Sets session with companyId + workerId
  - Records login in company's sessions collection

#### Data Operations
- `lib/api.ts` - All truck log operations
  - `saveTruckLog()` - Saves to `company_{companyId}_logs`
  - `sendTruckLogToCustoms()` - Updates in `company_{companyId}_logs`
  - `getTruckLogs()` - Reads from `company_{companyId}_logs`
  - All functions use `getActiveCompany()` to get company context

#### Company Management
- `lib/companies/metadata.ts` - Company metadata operations
- `lib/companies/workers.ts` - Worker operations (company-scoped)
- `lib/companies/seed.ts` - Database seeding utilities

## Security & Isolation

### Data Isolation
- **Collection-level isolation**: Each company's data is in separate collections
- **Session-based context**: All operations use `getActiveCompany()` to ensure correct company
- **No cross-company access**: Impossible to access another company's data by design

### Authentication Flow
1. User selects company (Step 1)
2. User selects worker and enters password (Step 2)
3. System verifies worker exists in `company_{companyId}_workers`
4. System sets session cookies: `company-id` and `worker-id`
5. All subsequent operations use session to determine company context

### Middleware Protection
- `middleware.ts` - Protects routes, redirects unauthenticated users to login

## Usage Examples

### Saving a Truck Log
```typescript
// Automatically uses active company from session
const log = await saveTruckLog({
  direction: "IN",
  plate: "Б1234АВ",
  // ... other fields
})
// Saves to: company_{activeCompanyId}_logs
```

### Getting Company Workers
```typescript
const workers = await getCompanyWorkers("altan-logistics")
// Reads from: company_altan-logistics_workers
```

### Accessing Company Collection Directly
```typescript
// Only use this helper - never access collections directly!
const logsCollection = await getCompanyCollection(companyId, "logs")
const logs = await logsCollection.find({}).toArray()
```

## Seeding Database

### Initial Setup
1. Set `MONGODB_URI` environment variable
2. Set `MONGODB_DB_NAME` (optional, defaults to "truck-weighing-dashboard")
3. Call seeding endpoint:

```bash
POST /api/seed
```

This will:
- Create company metadata in `companies` collection
- Seed workers into each company's `company_{id}_workers` collection
- Create sample truck logs for testing

### Test Data
After seeding:
- **Company A (altan-logistics)**: 3 workers, 2 sample logs
- **Company B (steppe-mining)**: 3 workers, 2 sample logs

All workers have password: `password123`

## Testing Multi-Tenancy

1. **Login as Company A worker**
   - See only Company A's logs
   - Can only save to Company A's collection

2. **Logout and login as Company B worker**
   - See only Company B's logs
   - Company A's data is completely invisible

3. **Verify isolation**
   - Company A cannot see Company B's workers
   - Company B cannot see Company A's logs
   - All operations are automatically scoped to the active company

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=truck-weighing-dashboard
```

## Production Considerations

1. **Password Hashing**: Currently passwords are stored in plain text. In production:
   - Use bcrypt or similar to hash passwords
   - Never return password fields in API responses

2. **Session Security**: 
   - Cookies are httpOnly and secure in production
   - Consider adding session expiration and refresh tokens

3. **Database Indexes**: 
   - Collections are auto-indexed on creation
   - Monitor query performance and add indexes as needed

4. **Backup Strategy**:
   - Each company's collections can be backed up independently
   - Consider per-company backup policies

5. **Scaling**:
   - Collection-per-company scales well
   - Consider sharding if individual companies have very large datasets

