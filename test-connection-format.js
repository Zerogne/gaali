// Test different connection string formats
const formats = [
  {
    name: "With quotes, with database name",
    uri: 'mongodb+srv://scalersys_db_user:scalersys_db_user@cluster0.yh2iwbg.mongodb.net/truck-weighing-dashboard?retryWrites=true&w=majority'
  },
  {
    name: "Without quotes, with database name",
    uri: 'mongodb+srv://scalersys_db_user:scalersys_db_user@cluster0.yh2iwbg.mongodb.net/truck-weighing-dashboard?retryWrites=true&w=majority'
  },
  {
    name: "Current format (no database name)",
    uri: 'mongodb+srv://scalersys_db_user:scalersys_db_user@cluster0.yh2iwbg.mongodb.net/?appName=Cluster0'
  }
]

console.log("Testing connection string formats...\n")

for (const format of formats) {
  console.log(`Testing: ${format.name}`)
  console.log(`URI: ${format.uri.replace(/:[^:@]+@/, ":****@")}`)
  
  try {
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(format.uri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    })
    
    await client.connect()
    console.log("✅ Connection successful!\n")
    
    // List databases
    const adminDb = client.db().admin()
    const dbs = await adminDb.listDatabases()
    console.log(`Available databases (${dbs.databases.length}):`)
    dbs.databases.slice(0, 5).forEach(db => {
      console.log(`  - ${db.name}`)
    })
    if (dbs.databases.length > 5) {
      console.log(`  ... and ${dbs.databases.length - 5} more`)
    }
    
    await client.close()
    console.log("\n✅ This format works! Use this one.\n")
    break
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`)
  }
}
