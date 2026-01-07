"use server"

import bcrypt from "bcryptjs"
import { getCompanyCollection } from "@/lib/db/companyDb"
import { getCompaniesCollection } from "@/lib/db/companyDb"
import { ensureCompanyCollections } from "@/lib/db/companyDb"
import { companies, workers, workerPasswords, companyPasswords } from "@/lib/auth/mockData"
import type { Worker } from "@/lib/auth/mockData"
import type { CompanyMetadata } from "./metadata"

/**
 * Seed company metadata into the shared companies collection
 * Passwords are hashed with bcrypt before storage
 */
export async function seedCompanies() {
  const companiesCollection = await getCompaniesCollection()

  for (const company of companies) {
    // Hash password with bcrypt (10 rounds)
    const plainPassword = companyPasswords[company.id] || "password123"
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const companyMetadata: CompanyMetadata = {
      companyId: company.id,
      name: company.name,
      description: company.description,
      logoInitials: company.logoInitials,
      password: hashedPassword, // Store hashed password
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await companiesCollection.updateOne(
      { companyId: company.id },
      { $set: companyMetadata },
      { upsert: true }
    )
  }

  console.log("✅ Companies metadata seeded with hashed passwords")
}

/**
 * Seed workers into company-scoped collections
 * Passwords are hashed with bcrypt before storage
 */
export async function seedWorkers() {
  // Group workers by company
  const workersByCompany = new Map<string, typeof workers>()

  for (const worker of workers) {
    if (!workersByCompany.has(worker.companyId)) {
      workersByCompany.set(worker.companyId, [])
    }
    workersByCompany.get(worker.companyId)!.push(worker)
  }

  // Seed each company's workers collection
  for (const [companyId, companyWorkers] of workersByCompany) {
    const workersCollection = await getCompanyCollection<Worker & { password: string }>(
      companyId,
      "workers"
    )

    for (const worker of companyWorkers) {
      // Hash password with bcrypt (10 rounds)
      const plainPassword = workerPasswords[worker.id] || "password123"
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      const workerWithPassword = {
        ...worker,
        password: hashedPassword, // Store hashed password
      }

      await workersCollection.updateOne(
        { id: worker.id },
        { $set: workerWithPassword },
        { upsert: true }
      )
    }

    console.log(`✅ Workers seeded for company: ${companyId} (passwords hashed)`)
  }
}

/**
 * Seed sample truck logs for testing (Company A and Company B)
 */
export async function seedTruckLogs() {
  const companyA = "altan-logistics"
  const companyB = "steppe-mining"

  // Sample logs for Company A
  const logsA = [
    {
      id: `log-${companyA}-1`,
      direction: "IN" as const,
      plate: "Б1234АВ",
      driverName: "Баярмаа Ганбат",
      cargoType: "industrial",
      weightKg: 24500,
      origin: "Улаанбаатар",
      destination: "Замын-Үүд",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      sentToCustoms: true,
    },
    {
      id: `log-${companyA}-2`,
      direction: "OUT" as const,
      plate: "Б5678ЦЦ",
      driverName: "Энхбат Дорж",
      cargoType: "food",
      weightKg: 12000,
      origin: "Замын-Үүд",
      destination: "Улаанбаатар",
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      sentToCustoms: false,
    },
  ]

  // Sample logs for Company B
  const logsB = [
    {
      id: `log-${companyB}-1`,
      direction: "IN" as const,
      plate: "Б9999ЗЗ",
      driverName: "Батбаяр Мөнх",
      cargoType: "construction",
      weightKg: 30000,
      origin: "Дархан",
      destination: "Эрдэнэт",
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      sentToCustoms: true,
    },
    {
      id: `log-${companyB}-2`,
      direction: "OUT" as const,
      plate: "Б1111АА",
      driverName: "Сараа Очир",
      cargoType: "machinery",
      weightKg: 18000,
      origin: "Эрдэнэт",
      destination: "Дархан",
      createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      sentToCustoms: false,
    },
  ]

  // Insert logs into company A's collection
  const logsCollectionA = await getCompanyCollection(companyA, "logs")
  for (const log of logsA) {
    await logsCollectionA.updateOne(
      { id: log.id },
      { $set: log },
      { upsert: true }
    )
  }

  // Insert logs into company B's collection
  const logsCollectionB = await getCompanyCollection(companyB, "logs")
  for (const log of logsB) {
    await logsCollectionB.updateOne(
      { id: log.id },
      { $set: log },
      { upsert: true }
    )
  }

  console.log("✅ Sample truck logs seeded")
}

/**
 * Initialize all company collections and seed data
 */
export async function seedAll() {
  console.log("🌱 Starting database seeding...")

  // Ensure collections exist for all companies
  for (const company of companies) {
    await ensureCompanyCollections(company.id)
  }

  // Seed companies metadata
  await seedCompanies()

  // Seed workers
  await seedWorkers()

  // Seed sample logs
  await seedTruckLogs()

  console.log("✅ Database seeding completed!")
}

