import { pgTable, uuid, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tickets } from './tickets';
import { tags } from './tags';

export const ticketTags = pgTable('ticket_tags', {
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
}, (table) => ({
  pk: primaryKey({ columns: [table.ticketId, table.tagId] }),
  ticketIdIdx: index('idx_ticket_tags_ticket_id').on(table.ticketId),
  tagIdIdx: index('idx_ticket_tags_tag_id').on(table.tagId)
}));
