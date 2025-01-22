import { pgTable, uuid, text, varchar, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { companies } from './companies';

export const tags = pgTable("tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	color: varchar({ length: 7 }).notNull(),
	companyId: uuid("company_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_tags_company_id").using("btree", table.companyId.asc().nullsLast().op("uuid_ops")),
	index("idx_tags_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "tags_company_id_companies_id_fk"
		}).onDelete("cascade"),
]);