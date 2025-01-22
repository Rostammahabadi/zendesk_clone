import { pgTable, uuid, text, timestamp, index, foreignKey } from 'drizzle-orm/pg-core';
import { companies } from './companies';

export const teams = pgTable("teams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	companyId: uuid("company_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_teams_company_id").using("btree", table.companyId.asc().nullsLast().op("uuid_ops")),
	index("idx_teams_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "teams_company_id_companies_id_fk"
		}).onDelete("cascade"),
]);