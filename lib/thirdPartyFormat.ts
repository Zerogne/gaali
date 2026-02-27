/**
 * Build DRN (Driver) field for third-party data format.
 * Format: "Н.{name} ИЮ{registrationNumber} {phone}"
 * Example: "Н.БАТТОГТОХ ИЮ84070575 88844805"
 */
export function buildDRN(
  driverName: string,
  registrationNumber?: string | null,
  phone?: string | null
): string {
  const namePart = driverName?.trim() ? `${driverName.trim()}` : ""
  const regPart = registrationNumber?.trim() ? ` ${registrationNumber.trim()}` : ""
  const phonePart = phone?.trim() ? ` ${phone.trim()}` : ""
  const result = `${namePart}${regPart}${phonePart}`.trim()
  return result || driverName?.trim() || ""
}
