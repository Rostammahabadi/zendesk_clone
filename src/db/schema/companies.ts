import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';


export const companies = pgTable("companies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	domain: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_companies_domain").using("btree", table.domain.asc().nullsLast().op("text_ops")),
	index("idx_companies_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);