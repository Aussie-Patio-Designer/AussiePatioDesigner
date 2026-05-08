export const SITE_URL = "https://patiodesigner.com.au"
export const SITE_NAME = "Patio Designer"
export const OG_IMAGE = "/og-patio-designer.jpg"
export const SITE_UPDATED_AT = new Date("2026-05-07T00:00:00.000Z")

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
