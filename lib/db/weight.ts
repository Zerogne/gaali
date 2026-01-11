import { Collection } from "mongodb";
import clientPromise from "./client";

/**
 * Get the weight collection
 * Uses MONGODB_DB or MONGODB_DB_NAME environment variable
 */
export async function getWeightCollection(): Promise<Collection> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || "gaali";
  const collectionName = "weights";
  const db = client.db(dbName);
  
  const collection = db.collection(collectionName);
  
  // Create indexes for fast lookups (idempotent)
  // These are background operations, so we don't await them
  collection.createIndex({ siteId: 1, receivedAt: -1 }).catch(() => {
    // Index might already exist, ignore errors
  });
  collection.createIndex({ siteId: 1, isLatest: 1 }).catch(() => {
    // Index might already exist, ignore errors
  });
  // Index for company filtering
  collection.createIndex({ companyId: 1, receivedAt: -1 }).catch(() => {
    // Index might already exist, ignore errors
  });
  collection.createIndex({ companyId: 1, siteId: 1, isLatest: 1 }).catch(() => {
    // Index might already exist, ignore errors
  });
  
  return collection;
}

