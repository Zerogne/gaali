/**
 * Script to seed MongoDB with mock data
 * 
 * Usage:
 *   node scripts/seed-db.js
 * 
 * Or via API endpoint (when server is running):
 *   curl -X POST http://localhost:3000/api/seed
 */

// This is a simple wrapper that can be run with Node.js directly
// For TypeScript version, use: npm run seed

console.log("To seed the database, you have two options:\n")
console.log("1. Via API endpoint (recommended):")
console.log("   Start your dev server: npm run dev")
console.log("   Then run: curl -X POST http://localhost:3000/api/seed\n")
console.log("2. Via npm script (requires tsx):")
console.log("   npm install -D tsx")
console.log("   npm run seed\n")
console.log("Make sure MONGODB_URI is set in your .env.local file!")

