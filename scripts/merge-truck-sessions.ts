// scripts/merge-truck-sessions.ts
//
// Usage:
//   MONGODB_URI="..." MONGODB_DB_NAME="truck-weighing-dashboard" npx tsx scripts/merge-truck-sessions.ts
//
// This script reads company_*_truck_sessions collections and writes merged
// IN+OUT sessions into company_*_truck_sessions_merged.

import { MongoClient, Db, Collection } from "mongodb";

type SessionDirection = "IN" | "OUT";

interface TruckSession {
  _id: any;
  id: string;
  uniqueCode: string;
  companyId: string;
  direction: SessionDirection;
  plateNumber: string;
  driverName?: string;
  product?: string;
  transporterCompany?: string;
  inSessionId?: string;
  grossWeightKg: number;
  netWeightKg?: number;
  inTime?: string;
  outTime?: string;
  sealNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MergedTruckSession {
  _id?: any;
  companyId: string;
  plateNumber: string;

  inSessionId?: string;
  outSessionId?: string;

  inUniqueCode?: string;
  inCreatedAt?: Date;
  inTime?: string;
  inGrossWeightKg?: number;

  outUniqueCode?: string;
  outCreatedAt?: Date;
  outTime?: string;
  outGrossWeightKg?: number;
  netWeightKg?: number;

  driverName?: string;
  product?: string;
  transporterCompany?: string;
  sealNumber?: string;
  notes?: string;

  mergedAt: Date;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  // Match app default: MONGODB_DB_NAME or fallback "truck-weighing-dashboard"
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
      console.log(`\n===== Processing collection: ${collName} =====`);
      await mergeCollection(db, collName);
    }
  } finally {
    await client.close();
  }
}

async function mergeCollection(db: Db, collName: string) {
  const sessions = db.collection<TruckSession>(collName);
  const mergedName = `${collName}_merged`;
  const merged = db.collection<MergedTruckSession>(mergedName);

  console.log(`Clearing existing merged collection: ${mergedName}`);
  await merged.deleteMany({});

  const allSessions = await sessions
    .find({})
    .sort({ createdAt: 1 })
    .toArray();

  if (allSessions.length === 0) {
    console.log("No sessions found, skipping.");
    return;
  }

  console.log(`Loaded ${allSessions.length} sessions from ${collName}`);

  const inSessions = allSessions.filter((s) => s.direction === "IN");
  const outSessions = allSessions.filter((s) => s.direction === "OUT");

  const inById = new Map<string, TruckSession>();
  const inByPlate = new Map<string, TruckSession[]>();

  for (const s of inSessions) {
    inById.set(s.id, s);
    const plate = s.plateNumber;
    if (!inByPlate.has(plate)) inByPlate.set(plate, []);
    inByPlate.get(plate)!.push(s);
  }

  for (const arr of inByPlate.values()) {
    arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  const usedInIds = new Set<string>();
  const mergedDocs: MergedTruckSession[] = [];

  function findMatchingIn(out: TruckSession): TruckSession | undefined {
    if (out.inSessionId) {
      const match = inById.get(out.inSessionId);
      if (match) return match;
    }

    const list = inByPlate.get(out.plateNumber);
    if (!list || list.length === 0) return undefined;

    const outTime = out.createdAt.getTime();
    let best: TruckSession | undefined;
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
    if (matchIn) {
      usedInIds.add(matchIn.id);

      const doc: MergedTruckSession = {
        companyId: matchIn.companyId || out.companyId,
        plateNumber: matchIn.plateNumber || out.plateNumber,
        inSessionId: matchIn.id,
        outSessionId: out.id,

        inUniqueCode: matchIn.uniqueCode,
        inCreatedAt: matchIn.createdAt,
        inTime: matchIn.inTime,
        inGrossWeightKg: matchIn.grossWeightKg,

        outUniqueCode: out.uniqueCode,
        outCreatedAt: out.createdAt,
        outTime: out.outTime,
        outGrossWeightKg: out.grossWeightKg,
        netWeightKg: out.netWeightKg,

        driverName: out.driverName || matchIn.driverName,
        product: out.product || matchIn.product,
        transporterCompany: out.transporterCompany || matchIn.transporterCompany,
        sealNumber: out.sealNumber || matchIn.sealNumber,
        notes: out.notes || matchIn.notes,

        mergedAt: new Date(),
      };

      mergedDocs.push(doc);
    } else {
      const doc: MergedTruckSession = {
        companyId: out.companyId,
        plateNumber: out.plateNumber,
        outSessionId: out.id,

        outUniqueCode: out.uniqueCode,
        outCreatedAt: out.createdAt,
        outTime: out.outTime,
        outGrossWeightKg: out.grossWeightKg,
        netWeightKg: out.netWeightKg,

        driverName: out.driverName,
        product: out.product,
        transporterCompany: out.transporterCompany,
        sealNumber: out.sealNumber,
        notes: out.notes,

        mergedAt: new Date(),
      };
      mergedDocs.push(doc);
    }
  }

  for (const inn of inSessions) {
    if (usedInIds.has(inn.id)) continue;

    const doc: MergedTruckSession = {
      companyId: inn.companyId,
      plateNumber: inn.plateNumber,
      inSessionId: inn.id,

      inUniqueCode: inn.uniqueCode,
      inCreatedAt: inn.createdAt,
      inTime: inn.inTime,
      inGrossWeightKg: inn.grossWeightKg,

      driverName: inn.driverName,
      product: inn.product,
      transporterCompany: inn.transporterCompany,
      sealNumber: inn.sealNumber,
      notes: inn.notes,

      mergedAt: new Date(),
    };
    mergedDocs.push(doc);
  }

  if (mergedDocs.length === 0) {
    console.log("No merged docs to insert.");
    return;
  }

  console.log(`Inserting ${mergedDocs.length} merged sessions into ${mergedName}...`);
  await merged.insertMany(mergedDocs);
  console.log(`Done. Merged sessions written to ${mergedName}.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

