import { pgTable, uuid, timestamp, index, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { tags } from './tags';
import { tickets } from './tickets';

export const ticketTags = pgTable("ticket_tags", {
	ticketId: uuid("ticket_id").notNull(),
	tagId: uuid("tag_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ticket_tags_tag_id").using("btree", table.tagId.asc().nullsLast().op("uuid_ops")),
	index("idx_ticket_tags_ticket_id").using("btree", table.ticketId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "ticket_tags_tag_id_tags_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_tags_ticket_id_tickets_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.ticketId, table.tagId], name: "ticket_tags_ticket_id_tag_id_pk"}),
]);