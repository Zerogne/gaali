import { randomBytes } from 'crypto'

/**
 * Generate a secure random password
 * 
 * @param length - Password length (default: 12)
 * @returns A secure random password string
 */
export function generateSecurePassword(length: number = 12): string {
  // Character sets
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%&*'
  
  // Combine all character sets
  const allChars = lowercase + uppercase + numbers + symbols
  
  // Ensure at least one character from each set
  let password = ''
  const initialBytes = randomBytes(4)
  password += lowercase[initialBytes[0] % lowercase.length]
  password += uppercase[initialBytes[1] % uppercase.length]
  password += numbers[initialBytes[2] % numbers.length]
  password += symbols[initialBytes[3] % symbols.length]
  
  // Fill the rest with random characters
  const remainingLength = length - password.length
  const randomBytesForRest = randomBytes(remainingLength)
  
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[randomBytesForRest[i] % allChars.length]
  }
  
  // Shuffle the password to avoid predictable pattern
  const passwordArray = password.split('')
  const shuffleBytes = randomBytes(passwordArray.length)
  
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1)
    ;[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]
  }
  
  return passwordArray.join('')
}
