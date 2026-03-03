// scripts/backfill-merge-truck-sessions.ts
//
// One-time migration:
// - For each company_*_truck_sessions collection in the DB
// - For each OUT session, find its matching IN session
// - Update the IN document in-place with outTime/netWeightKg (merge IN+OUT)
//
// Usage (from gaali folder):
//   MONGODB_URI="..." MONGODB_DB_NAME="truck-weighing-dashboard" npx tsx scripts/backfill-merge-truck-sessions.ts

import { MongoClient } from "mongodb";

type SessionDirection = "IN" | "OUT";

interface TruckSessionDoc {
  _id: any;
  id: string;
  uniqueCode?: string;
  companyId?: string;
  direction: SessionDirection;
  plateNumber: string;
  grossWeightKg: number;
  netWeightKg?: number | null;
  inSessionId?: string;
  inTime?: string;
  outTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "truck-weighing-dashboard";

  if (!uri) {
    console.error("MONGODB_URI is required.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to MongoDB db=${db.databaseName}`);

    const collections = await db.listCollections().toArray();
    const sessionCollections = collections
      .map((c) => c.name)
      .filter((name) => name.endsWith("_truck_sessions"));

    if (sessionCollections.length === 0) {
      console.log("No company_*_truck_sessions collections found.");
      return;
    }

    for (const collName of sessionCollections) {
      console.log(`\n===== Backfilling collection: ${collName} =====`);
      await backfillCollection(db, collName);
    }

    console.log("\nBackfill complete.");
  } finally {
    await client.close();
  }
}

async function backfillCollection(db: any, collName: string) {
  const sessions = db.collection<TruckSessionDoc>(collName);

  const all = await sessions
    .find({})
    .sort({ createdAt: 1 })
    .toArray();

  if (all.length === 0) {
    console.log("No sessions found, skipping.");
    return;
  }

  console.log(`Loaded ${all.length} sessions from ${collName}`);

  const inSessions = all.filter((s) => s.direction === "IN");
  const outSessions = all.filter((s) => s.direction === "OUT");

  if (outSessions.length === 0) {
    console.log("No OUT sessions found, nothing to merge.");
    return;
  }

  const inById = new Map<string, TruckSessionDoc>();
  const inByPlate = new Map<string, TruckSessionDoc[]>();

  for (const s of inSessions) {
    inById.set(s.id, s);
    const plate = s.plateNumber;
    if (!inByPlate.has(plate)) inByPlate.set(plate, []);
    inByPlate.get(plate)!.push(s);
  }

  for (const arr of inByPlate.values()) {
    arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  let updatedCount = 0;

  function findMatchingIn(out: TruckSessionDoc): TruckSessionDoc | undefined {
    if (out.inSessionId) {
      const match = inById.get(out.inSessionId);
      if (match) return match;
    }

    const list = inByPlate.get(out.plateNumber);
    if (!list || list.length === 0) return undefined;

    const outTime = out.createdAt.getTime();
    let best: TruckSessionDoc | undefined;
    let bestDiff = Number.POSITIVE_INFINITY;

    for (const s of list) {
      const t = s.createdAt.getTime();
      if (t > outTime) continue;
      const diff = outTime - t;
      if (diff < bestDiff) {
        bestDiff = diff;
        best = s;
      }
    }

    return best;
  }

  for (const out of outSessions) {
    const matchIn = findMatchingIn(out);
    if (!matchIn) continue;

    const outTime =
      out.outTime ||
      (out.createdAt instanceof Date
        ? out.createdAt.toISOString()
        : new Date(out.createdAt).toISOString());

    const net = out.netWeightKg != null ? out.netWeightKg : undefined;

    const update: Partial<TruckSessionDoc> = {
      outTime,
      netWeightKg: net,
      updatedAt: new Date(),
    };

    const res = await sessions.updateOne(
      { id: matchIn.id },
      { $set: update }
    );

    if (res.modifiedCount > 0) {
      updatedCount += 1;
    }
  }

  console.log(
    `Backfill for ${collName}: updated ${updatedCount} IN sessions from ${outSessions.length} OUT sessions.`
  );
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});

