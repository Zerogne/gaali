/**
 * Client-side password generator
 * Uses browser crypto API for secure randomness
 * 
 * @param length - Password length (default: 12)
 * @returns A secure random password string
 */
export function generateSecurePasswordClient(length: number = 12): string {
  // Character sets
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%&*'
  
  // Combine all character sets
  const allChars = lowercase + uppercase + numbers + symbols
  
  // Use browser crypto API for secure randomness
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  
  // Ensure at least one character from each set
  let password = ''
  password += lowercase[array[0] % lowercase.length]
  password += uppercase[array[1] % uppercase.length]
  password += numbers[array[2] % numbers.length]
  password += symbols[array[3] % symbols.length]
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length]
  }
  
  // Shuffle the password to avoid predictable pattern
  const passwordArray = password.split('')
  const shuffleArray = new Uint32Array(passwordArray.length)
  crypto.getRandomValues(shuffleArray)
  
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = shuffleArray[i] % (i + 1)
    ;[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]
  }
  
  return passwordArray.join('')
}
