import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema/index'
import { env } from '../config/env'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

type DrizzleDb = BetterSQLite3Database<typeof schema>

let db: DrizzleDb

const isLibsql = env.DATABASE_URL.startsWith('libsql://') || env.DATABASE_URL.startsWith('https://')

if (isLibsql) {
  const { drizzle: drizzleLibsql } = await import('drizzle-orm/libsql')
  const { createClient } = await import('@libsql/client')
  const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN })
  db = drizzleLibsql(client, { schema }) as unknown as DrizzleDb
} else {
  const sqlite = new Database(env.DATABASE_URL.replace('file:', ''))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  db = drizzle(sqlite, { schema })
}

export { db }
