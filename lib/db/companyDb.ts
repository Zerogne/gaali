import { Collection, Db } from "mongodb"
import { getDatabase } from "./client"
import clientPromise from "./client"

/**
 * Get a company-scoped collection.
 * This is the ONLY method that should be used to access company data.
 * 
 * Pattern: company_{companyId}_{collectionName}
 * 
 * Examples:
 * - company_altan-logistics_logs
 * - company_altan-logistics_workers
 * - company_altan-logistics_sessions
 * 
 * @param companyId - The company identifier
 * @param collectionName - The collection name (e.g., 'logs', 'workers', 'sessions')
 * @returns MongoDB Collection instance scoped to the company
 */
export async function getCompanyCollection<T = any>(
  companyId: string,
  collectionName: string
): Promise<Collection<T & any>> {
  if (!companyId || !collectionName) {
    throw new Error("companyId and collectionName are required")
  }

  const db = await getDatabase()
  const collectionNameWithPrefix = `company_${companyId}_${collectionName}`
  
  return db.collection<T & any>(collectionNameWithPrefix)
}

/**
 * Get the company database instance (for operations that need the DB object)
 * @param companyId - The company identifier
 * @returns MongoDB Db instance
 */
export async function getCompanyDB(companyId: string): Promise<Db> {
  if (!companyId) {
    throw new Error("companyId is required")
  }
  
  return getDatabase()
}

/**
 * Get the admin/root database for global metadata
 * Companies are stored in a separate admin database, not in the main application database
 */
async function getAdminDatabase(): Promise<Db> {
  const client = await clientPromise
  // Use a separate admin database for global company metadata
  // Default to "gaali-admin" database (can be overridden with MONGODB_ADMIN_DB_NAME environment variable)
  const adminDbName = process.env.MONGODB_ADMIN_DB_NAME || "gaali-admin"
  console.log(`🔍 [getAdminDatabase] Using database: ${adminDbName}`)
  return client.db(adminDbName)
}

/**
 * Get the global companies metadata collection
 * This is the ONLY shared collection across all companies
 * Stored in the admin/root database, not in the application database
 */
export async function getCompaniesCollection() {
  const adminDb = await getAdminDatabase()
  return adminDb.collection("companies")
}

/**
 * Ensure company collections exist (optional helper for initialization)
 * Creates indexes for better query performance
 */
export async function ensureCompanyCollections(companyId: string) {
  const collections = ["logs", "workers", "sessions", "settings", "products", "truck_sessions"]
  
  for (const collectionName of collections) {
    const collection = await getCompanyCollection(companyId, collectionName)
    
    // Create indexes for common queries
    if (collectionName === "logs") {
      await collection.createIndex({ createdAt: -1 })
      await collection.createIndex({ direction: 1 })
      await collection.createIndex({ sentToCustoms: 1 })
      await collection.createIndex({ plate: 1 })
    } else if (collectionName === "workers") {
      await collection.createIndex({ companyId: 1 })
      await collection.createIndex({ id: 1 }, { unique: true })
    } else if (collectionName === "sessions") {
      await collection.createIndex({ workerId: 1 })
      await collection.createIndex({ createdAt: -1 })
    } else if (collectionName === "products") {
      await collection.createIndex({ value: 1 }, { unique: true })
      await collection.createIndex({ isCustom: 1 })
    } else if (collectionName === "truck_sessions") {
      await collection.createIndex({ createdAt: -1 })
      await collection.createIndex({ direction: 1 })
      await collection.createIndex({ plateNumber: 1 })
      await collection.createIndex({ inSessionId: 1 })
      await collection.createIndex({ companyId: 1 })
      await collection.createIndex({ uniqueCode: 1 }, { unique: true, sparse: true })
    }
  }
}
