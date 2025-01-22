import { pgTable, uuid, text, varchar, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { tickets } from './tickets';
import { users } from './users';

export const ticketEvents = pgTable("ticket_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	triggeredBy: uuid("triggered_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ticket_events_event_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_ticket_events_ticket_id").using("btree", table.ticketId.asc().nullsLast().op("uuid_ops")),
	index("idx_ticket_events_triggered_by").using("btree", table.triggeredBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_events_ticket_id_tickets_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.triggeredBy],
			foreignColumns: [users.id],
			name: "ticket_events_triggered_by_users_id_fk"
		}).onDelete("set null"),
]);
