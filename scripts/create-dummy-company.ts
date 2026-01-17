// Load environment variables FIRST before any imports
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first (higher priority), then .env
// This MUST happen before any other imports that might use env variables
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

// Verify MONGODB_URI is loaded before proceeding
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables")
  console.error("Please ensure .env.local or .env file exists with MONGODB_URI")
  process.exit(1)
}

async function createDummyCompany() {
  console.log("Connecting to MongoDB using application database utilities...")

  try {
    // Dynamically import modules AFTER env vars are loaded
    const bcrypt = await import("bcryptjs")
    const { getCompaniesCollection } = await import("@/lib/db/companyDb")
    
    // Use the same database utilities that the app uses
    const companiesCollection = await getCompaniesCollection()
    console.log("✅ Connected to MongoDB")

    // Check if dummy company already exists
    const existing = await companiesCollection.findOne({ companyId: "dummy-company" })
    if (existing) {
      console.log("⚠️  Dummy company already exists!")
      console.log("Company:", {
        companyId: existing.companyId,
        name: existing.name,
        description: existing.description,
        logoInitials: existing.logoInitials,
        companyCode: existing.companyCode,
      })
      return
    }

    // Hash password for the dummy company
    const plainPassword = "password123"
    const hashedPassword = await bcrypt.default.hash(plainPassword, 10)

    // Create dummy company with all fields
    const dummyCompany = {
      companyId: "dummy-company",
      name: "Dummy Company",
      description: "This is a dummy company profile created for testing purposes. It includes all standard company fields.",
      logoInitials: "DC",
      password: hashedPassword,
      cameraSettings: {
        camera1Ip: "192.168.1.100",
        camera2Ip: "192.168.1.101",
      },
      companyCode: "9999", // 4-digit company code
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await companiesCollection.insertOne(dummyCompany)
    console.log("\n✅ Dummy company created successfully!")
    console.log("Inserted ID:", result.insertedId)
    console.log("\nCompany Details:")
    console.log("  Company ID:", dummyCompany.companyId)
    console.log("  Name:", dummyCompany.name)
    console.log("  Description:", dummyCompany.description)
    console.log("  Logo Initials:", dummyCompany.logoInitials)
    console.log("  Company Code:", dummyCompany.companyCode)
    console.log("  Camera 1 IP:", dummyCompany.cameraSettings.camera1Ip)
    console.log("  Camera 2 IP:", dummyCompany.cameraSettings.camera2Ip)
    console.log("  Password:", plainPassword, "(hashed in database)")
    console.log("\nYou can now view this company in the admin panel at /admin/companies")

  } catch (error) {
    console.error("❌ Error creating dummy company:", error)
    throw error
  }
}

// Run the script
createDummyCompany()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
