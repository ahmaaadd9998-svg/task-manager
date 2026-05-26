import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const aiLogs = sqliteTable('ai_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  feature: text('feature').notNull(),
  model: text('model').notNull(),
  promptHash: text('prompt_hash'),
  tokensIn: integer('tokens_in').notNull().default(0),
  tokensOut: integer('tokens_out').notNull().default(0),
  latency: integer('latency'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  aiLogsUserIdIdx: index('ai_logs_user_id_idx').on(table.userId),
  aiLogsUserDateIdx: index('ai_logs_user_date_idx').on(table.userId, table.createdAt),
}))
