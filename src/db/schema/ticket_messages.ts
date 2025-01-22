import { pgTable, uuid, text, varchar, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { tickets } from './tickets';
import { users } from './users';

export const ticketMessages = pgTable("ticket_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	messageType: varchar("message_type", { length: 50 }).notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ticket_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	index("idx_ticket_messages_ticket_id").using("btree", table.ticketId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "ticket_messages_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_messages_ticket_id_tickets_id_fk"
		}),
]);