import { pgTable, uuid, text, varchar, timestamp, index, pgPolicy, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { companies } from './companies';

export const users = pgTable("users", {
	id: uuid().primaryKey().defaultRandom().notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	role: varchar({ length: 50 }).notNull(),
	companyId: uuid("company_id").notNull(),
	title: text("title"),
  avatarUrl: text("avatar_url"),
  phoneNumber: text("phone_number"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_users_company_id").using("btree", table.companyId.asc().nullsLast().op("uuid_ops")),
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_role").using("btree", table.role.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "users_company_id_companies_id_fk"
		}).onDelete("cascade"),
  pgPolicy("select_users_policy", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = id)` }),
  pgPolicy("admin_access_to_all_users_within_company", { as: "permissive", for: "select", to: ["authenticated"] }),
  pgPolicy("admin_access_test_without_text", { as: "permissive", for: "select", to: ["authenticated"] }),
  pgPolicy("any_authenticated_user_can_add_self", { as: "permissive", for: "insert", to: ["authenticated"] }),
  pgPolicy("Enable update for users based on email", { as: "permissive", for: "update", to: ["public"] }),
  pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
  pgPolicy("users_can_update_their_own_information", { as: "permissive", for: "update", to: ["authenticated"] }),
  pgPolicy("check_agent_role", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);