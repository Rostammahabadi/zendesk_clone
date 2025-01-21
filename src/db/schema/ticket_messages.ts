import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tickets } from './tickets';
import { users } from './users';

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id),
  messageType: varchar('message_type', { 
    length: 50, 
    enum: ['public', 'internal_note'] 
  }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
}, (table) => ({
  ticketIdIdx: index('idx_ticket_messages_ticket_id').on(table.ticketId),
  senderIdIdx: index('idx_ticket_messages_sender_id').on(table.senderId)
}));
