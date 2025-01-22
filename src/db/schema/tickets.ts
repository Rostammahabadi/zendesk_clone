import { pgTable, uuid, text, varchar, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { companies } from './companies';

export const tickets = pgTable("tickets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subject: text().notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('open').notNull(),
	priority: varchar({ length: 50 }).default('medium').notNull(),
	companyId: uuid("company_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	assignedTo: uuid("assigned_to"),
	topic: text(),
	type: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_tickets_assigned_to").using("btree", table.assignedTo.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_company_id").using("btree", table.companyId.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_created_by").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_priority").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	index("idx_tickets_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "tickets_assigned_to_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "tickets_company_id_companies_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "tickets_created_by_users_id_fk"
		}).onDelete("set null"),
]);
