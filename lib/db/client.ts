import { MongoClient, Db, MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

// MongoDB connection options with TLS configuration for better reliability
const options: MongoClientOptions = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 1,
  // Timeouts
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  // TLS settings (for MongoDB Atlas)
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Retry settings
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Helper function to create client with error handling
async function createClientWithRetry(uri: string, options: MongoClientOptions, retries = 3): Promise<MongoClient> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${retries}...`)
      const client = new MongoClient(uri, options)
      await client.connect()
      console.log(`[MongoDB] Connected successfully on attempt ${attempt}`)
      return client
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[MongoDB] Connection attempt ${attempt} failed:`, lastError.message)
      
      // If it's an SSL error, try with relaxed TLS settings on last retry
      if (attempt === retries && lastError.message.includes("SSL")) {
        console.log(`[MongoDB] Trying with relaxed TLS settings...`)
        try {
          const relaxedOptions: MongoClientOptions = {
            ...options,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
          }
          const client = new MongoClient(uri, relaxedOptions)
          await client.connect()
          console.log(`[MongoDB] Connected with relaxed TLS settings`)
          return client
        } catch (relaxedError) {
          console.error(`[MongoDB] Relaxed TLS connection also failed:`, relaxedError)
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`[MongoDB] Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error("MongoDB connection failed after all retries")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClientWithRetry(uri, options)
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClientWithRetry(uri, options)
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

/**
 * Get the main database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB_NAME || "truck-weighing-dashboard")
}

