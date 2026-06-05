import * as schema from './schema/index'
import { env } from '../config/env'

let db: any

const isLibsql = env.DATABASE_URL.startsWith('libsql://') || env.DATABASE_URL.startsWith('https://')

if (isLibsql) {
  const { drizzle: drizzleLibsql } = require('drizzle-orm/libsql')
  const { createClient } = require('@libsql/client')
  const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN })
  db = drizzleLibsql(client, { schema })
} else {
  const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3')
  const Database = require('better-sqlite3')
  const sqlite = new Database(env.DATABASE_URL.replace('file:', ''))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  db = drizzleSqlite(sqlite, { schema })
}

export { db }
