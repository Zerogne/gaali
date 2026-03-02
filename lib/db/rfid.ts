import { Collection } from "mongodb";
import clientPromise from "./client";

/**
 * Get the RFID events collection
 * Uses MONGODB_DB or MONGODB_DB_NAME environment variable
 */
export async function getRfidCollection(): Promise<Collection> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME || "gaali";
  const collectionName = process.env.MONGODB_RFID_COLLECTION || "rfid_events";
  const db = client.db(dbName);

  const collection = db.collection(collectionName);

  // Indexes for fast lookups (idempotent; background)
  collection.createIndex({ siteId: 1, receivedAt: -1 }).catch(() => {});
  collection.createIndex({ siteId: 1, isLatest: 1 }).catch(() => {});
  collection.createIndex({ companyId: 1, receivedAt: -1 }).catch(() => {});
  collection.createIndex({ companyId: 1, siteId: 1, isLatest: 1 }).catch(() => {});

  return collection;
}

