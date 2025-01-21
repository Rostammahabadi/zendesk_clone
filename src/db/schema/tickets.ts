import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  subject: text('subject').notNull(),
  description: text('description'),
  status: varchar('status', { 
    length: 50, 
    enum: ['open', 'pending', 'closed'] 
  }).notNull().default('open'),
  priority: varchar('priority', { 
    length: 50, 
    enum: ['low', 'medium', 'high'] 
  }).notNull().default('medium'),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  assignedTo: uuid('assigned_to')
    .references(() => users.id, { onDelete: 'set null' }),
  topic: text('topic'),
  type: text('type'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
}, (table) => ({
  companyIdIdx: index('idx_tickets_company_id').on(table.companyId),
  createdByIdx: index('idx_tickets_created_by').on(table.createdBy),
  assignedToIdx: index('idx_tickets_assigned_to').on(table.assignedTo),
  statusIdx: index('idx_tickets_status').on(table.status),
  priorityIdx: index('idx_tickets_priority').on(table.priority),
}));
