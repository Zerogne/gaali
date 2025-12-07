/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity ratio between two strings (0-1, where 1 is identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLength
}

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ")
}

/**
 * Check if two strings differ only by trailing numbers
 * e.g., "company 1" vs "company 2" should be considered different
 */
function differsOnlyByTrailingNumbers(str1: string, str2: string): boolean {
  // Remove trailing numbers and whitespace
  const base1 = str1.replace(/\s*\d+\s*$/, "").trim()
  const base2 = str2.replace(/\s*\d+\s*$/, "").trim()
  
  // If the bases are the same, they differ only by numbers
  if (base1 === base2 && base1.length > 0) {
    // Extract the numbers
    const num1 = str1.match(/\d+$/)?.[0] || ""
    const num2 = str2.match(/\d+$/)?.[0] || ""
    
    // If both have numbers and they're different, consider them different entities
    if (num1 && num2 && num1 !== num2) {
      return true
    }
  }
  
  return false
}

/**
 * Check if a new value is too similar to existing values
 * Returns the most similar existing value if found, or null
 */
export function findSimilarValue(
  newValue: string,
  existingValues: string[],
  threshold: number = 0.92 // 92% similarity threshold (increased from 85% to be less sensitive)
): string | null {
  const normalizedNew = normalizeString(newValue)
  
  // First check for exact match (after normalization)
  for (const existing of existingValues) {
    const normalizedExisting = normalizeString(existing)
    if (normalizedNew === normalizedExisting) {
      return existing
    }
  }

  // Then check for similar matches
  let mostSimilar: string | null = null
  let highestSimilarity = 0

  for (const existing of existingValues) {
    const normalizedExisting = normalizeString(existing)
    
    // If strings differ only by trailing numbers, consider them different
    if (differsOnlyByTrailingNumbers(normalizedNew, normalizedExisting)) {
      continue
    }
    
    const similarity = calculateSimilarity(normalizedNew, normalizedExisting)
    
    if (similarity >= threshold && similarity > highestSimilarity) {
      highestSimilarity = similarity
      mostSimilar = existing
    }
  }

  return mostSimilar
}
