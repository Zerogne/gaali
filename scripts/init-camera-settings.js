/**
 * Simple Node.js script to add camera settings to all companies
 * 
 * Usage:
 *   node scripts/init-camera-settings.js
 * 
 * Make sure MONGODB_URI is set in your environment or .env file
 */

const fs = require('fs')
const path = require('path')

// Try to read .env.local file directly
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

loadEnvFile()

const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB_NAME || 'truck-weighing-dashboard'

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set')
  console.error('   Please set MONGODB_URI in .env.local or as an environment variable')
  process.exit(1)
}

// Default camera settings
const defaultSettings = {
  camera1Ip: process.env.CAMERA1_IP || "192.168.1.50",
  camera1HttpPort: Number(process.env.CAMERA1_HTTP_PORT) || 443,
  camera1RtspPort: Number(process.env.CAMERA1_RTSP_PORT) || 8557,
  camera1WebSocketPort: Number(process.env.CAMERA1_WS_PORT) || 8557,
  camera1Username: process.env.CAMERA1_USERNAME || "admin",
  camera1Password: process.env.CAMERA1_PASSWORD || "admin",
  camera2Ip: process.env.CAMERA2_IP || "192.168.1.49",
  camera2HttpPort: Number(process.env.CAMERA2_HTTP_PORT) || 443,
  camera2RtspPort: Number(process.env.CAMERA2_RTSP_PORT) || 8557,
  camera2WebSocketPort: Number(process.env.CAMERA2_WS_PORT) || 8557,
  camera2Username: process.env.CAMERA2_USERNAME || "admin",
  camera2Password: process.env.CAMERA2_PASSWORD || "admin",
}

async function initCameraSettings() {
  let client
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(MONGODB_DB)
    const companiesCollection = db.collection('companies')
    
    console.log('🔍 Finding all companies...')
    const companies = await companiesCollection.find({}).toArray()
    console.log(`📊 Found ${companies.length} companies`)
    
    console.log('📹 Default camera settings:', defaultSettings)
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    for (const company of companies) {
      const companyId = company.companyId
      if (!companyId) {
        console.warn(`⚠️  Skipping company without companyId:`, company._id)
        skipped++
        continue
      }
      
      // Check if cameraSettings already exists
      if (company.cameraSettings) {
        console.log(`⏭️  Company ${companyId} already has cameraSettings, skipping...`)
        skipped++
        continue
      }
      
      try {
        const result = await companiesCollection.updateOne(
          { companyId },
          {
            $set: {
              cameraSettings: defaultSettings,
              updatedAt: new Date(),
            },
          }
        )
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Added camera settings to company: ${companyId}`)
          updated++
        } else {
          console.log(`⚠️  Company ${companyId} not updated`)
          errors++
        }
      } catch (error) {
        console.error(`❌ Error updating company ${companyId}:`, error.message)
        errors++
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📝 Total: ${companies.length}`)
    
    if (updated > 0) {
      console.log('\n✅ Successfully added camera settings to companies!')
    } else {
      console.log('\n⚠️  No companies were updated. They may already have camera settings.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }
}

// Run the script
initCameraSettings()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
