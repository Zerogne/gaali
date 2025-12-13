import { Collection } from "mongodb";
import clientPromise from "./client";

/**
 * Get the LPR events collection
 * Uses MONGODB_DB or MONGODB_DB_NAME environment variable
 */
export async function getLprCollection(): Promise<Collection> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || "gaali";
  const collectionName = process.env.MONGODB_COLLECTION || "lpr_events";
  const db = client.db(dbName);
  
  const collection = db.collection(collectionName);
  
  // Create index for fast latest lookup (idempotent)
  // This is a background operation, so we don't await it
  collection.createIndex({ receivedAt: -1 }).catch(() => {
    // Index might already exist, ignore errors
  });
  
  return collection;
}
