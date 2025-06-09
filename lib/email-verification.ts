/**
 * Email verification utility to check if an email address is valid
 * before attempting to send to it via Resend
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log(`❌ Invalid email format: ${email}`)
    return false
  }

  // Check for common test/fake domains that might cause Resend to reject
  const invalidDomains = ["example.com", "test.com", "domain.com", "email.com", "yourcompany.com", "company.com"]

  const domain = email.split("@")[1].toLowerCase()
  if (invalidDomains.includes(domain)) {
    console.log(`❌ Rejected test/example domain: ${domain}`)
    return false
  }

  return true
}

/**
 * Sanitize email addresses for Resend
 * Resend will reject the entire request if any email is invalid
 */
export function sanitizeEmailList(emails: string[]): string[] {
  return emails
    .filter(Boolean) // Remove empty strings
    .filter((email) => isValidEmail(email))
    .map((email) => email.trim())
}
