import { neon } from "@neondatabase/serverless"

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super("Missing DATABASE_URL environment variable")
  }
}

export type SqlClient = ReturnType<typeof neon>

let cachedClient: SqlClient | null = null

export function getSqlClient(): SqlClient {
  if (cachedClient) {
    return cachedClient
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new MissingDatabaseUrlError()
  }

  cachedClient = neon(databaseUrl)
  return cachedClient
}

export function resetSqlClientCache() {
  cachedClient = null
}

export function getSqlClientOrNull(): SqlClient | null {
  try {
    return getSqlClient()
  } catch (error) {
    if (error instanceof MissingDatabaseUrlError) {
      return null
    }

    throw error
  }
}
