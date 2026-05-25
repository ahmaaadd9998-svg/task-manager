import { defineConfig } from 'drizzle-kit'

const isTurso = process.env.DATABASE_URL?.startsWith('libsql://') || process.env.DATABASE_URL?.startsWith('https://')

export default defineConfig({
  schema: './src/core/db/schema/*.ts',
  out: './drizzle',
  dialect: isTurso ? 'turso' : 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/task-manager.db',
    ...(isTurso && { authToken: process.env.DATABASE_AUTH_TOKEN }),
  },
})
