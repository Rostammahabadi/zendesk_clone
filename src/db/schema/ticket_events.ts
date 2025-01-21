import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tickets } from './tickets';
import { users } from './users';

export const eventTypes = [
  'created',
  'updated_description',
  'comment_added',
  'assigned',
  'priority_changed',
  'topic_changed',
  'type_changed',
  'tags_added',
  'tags_removed',
  'status_changed',
  'closed',
  'reopened',
  'merged'
] as const;

export const ticketEvents = pgTable('ticket_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', {
    length: 50,
    enum: eventTypes
  }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  triggeredBy: uuid('triggered_by')
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
}, (table) => ({
  ticketIdIdx: index('idx_ticket_events_ticket_id').on(table.ticketId),
  triggeredByIdx: index('idx_ticket_events_triggered_by').on(table.triggeredBy),
  eventTypeIdx: index('idx_ticket_events_event_type').on(table.eventType)
}));
