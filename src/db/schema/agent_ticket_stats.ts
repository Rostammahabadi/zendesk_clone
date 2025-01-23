import { pgTable, uuid, date, integer, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const agentTicketStats = pgTable('agent_ticket_stats', {
  agentId: uuid('agent_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statsDate: date('stats_date').notNull(),
  openCount: integer('open_count').notNull().default(0),
  resolvedCount: integer('resolved_count').notNull().default(0),
  pendingCount: integer('pending_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
}, (table) => ({
  pk: primaryKey({ columns: [table.agentId, table.statsDate] }),
  agentIdIdx: index('idx_agent_ticket_stats_agent_id').on(table.agentId),
  statsDateIdx: index('idx_agent_ticket_stats_stats_date').on(table.statsDate),
}));
