/**
 * Script to seed companies with hashed passwords
 * Run with: npx tsx scripts/seed-companies.ts
 */

import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || "truck-weighing-dashboard"

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required")
  process.exit(1)
}

const companies = [
  {
    companyId: "altan-logistics",
    name: "Altan Logistics LLC",
    description: "Border checkpoint #3",
    logoInitials: "AL",
    password: "password123",
  },
  {
    companyId: "steppe-mining",
    name: "Steppe Mining Co.",
    description: "Mining operations hub",
    logoInitials: "SM",
    password: "password123",
  },
  {
    companyId: "blueroad-transport",
    name: "BlueRoad Transport",
    description: "Main transport terminal",
    logoInitials: "BR",
    password: "password123",
  },
  {
    companyId: "frontier-customs",
    name: "Frontier Customs Partner",
    description: "Customs processing center",
    logoInitials: "FC",
    password: "password123",
  },
]

async function seedCompanies() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    
    const db = client.db(DB_NAME)
    const companiesCollection = db.collection("companies")
    
    for (const company of companies) {
      // Hash password with bcrypt (10 rounds)
      const hashedPassword = await bcrypt.hash(company.password, 10)
      
      const companyMetadata = {
        companyId: company.companyId,
        name: company.name,
        description: company.description,
        logoInitials: company.logoInitials,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await companiesCollection.updateOne(
        { companyId: company.companyId },
        { $set: companyMetadata },
        { upsert: true }
      )
      
      console.log(`✅ Seeded company: ${company.name} (password: ${company.password})`)
    }
    
    console.log("\n✅ All companies seeded successfully!")
    console.log("\nLogin credentials:")
    console.log("All companies use password: password123")
    
  } catch (error) {
    console.error("Error seeding companies:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seedCompanies()

