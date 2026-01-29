/**
 * Check if a bcrypt hash matches any of a list of candidate passwords.
 * Run: npx tsx scripts/check-hash.ts
 */

import bcrypt from "bcryptjs"

const HASH =
  "$2b$10$aEvp6BK9Re/ngpuw0GTas.iE3HrjIZhEfcQ/vfcWiISsoRvu18jxW"

const CANDIDATES = [
  "password123",
  "108oil",
  "108Oil",
  "108 Oil",
  "108oil123",
  "admin",
  "Admin123",
  "gaali",
  "Gaali123",
  "company",
  "Company123",
  "123456",
  "password",
  "Password1",
]

async function main() {
  console.log("Checking hash against common candidates...\n")
  for (const candidate of CANDIDATES) {
    const match = await bcrypt.compare(candidate, HASH)
    if (match) {
      console.log("Match found. Plaintext password:", candidate)
      return
    }
  }
  console.log("No match among the tried candidates.")
  console.log("Tried:", CANDIDATES.join(", "))
}

main().catch(console.error)
