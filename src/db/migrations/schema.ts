import { pgTable, index, foreignKey, uuid, varchar, text, timestamp, pgPolicy, unique, bigint, uniqueIndex, serial, integer, primaryKey, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const appPermission = pgEnum("app_permission", ['channels.delete', 'messages.delete', 'users.insert', 'users.select', 'users.update', 'users.delete', 'user_teams.insert', 'user_teams.select'])
export const appRole = pgEnum("app_role", ['admin', 'moderator'])


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

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	role: varchar({ length: 50 }).notNull(),
	companyId: uuid("company_id").notNull(),
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
]);

export const rolePermissions = pgTable("role_permissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "role_permissions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	role: appRole().notNull(),
	permission: appPermission().notNull(),
}, (table) => [
	unique("role_permissions_role_permission_key").on(table.role, table.permission),
]);

export const userRoles = pgTable("user_roles", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id").notNull(),
	role: appRole().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_roles_user_id_role_key").on(table.userId, table.role),
	pgPolicy("Allow auth admin to read user roles", { as: "permissive", for: "select", to: ["supabase_auth_admin"], using: sql`true` }),
]);

export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("skills_name_unique").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "skills_company_id_companies_id_fk"
		}).onDelete("cascade"),
]);

export const userSkills = pgTable("user_skills", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	skillId: integer("skill_id").notNull(),
	proficiency: varchar({ length: 50 }),
	addedAt: timestamp("added_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.skillId],
			foreignColumns: [skills.id],
			name: "user_skills_skill_id_skills_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_skills_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

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

export const userTeams = pgTable("user_teams", {
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id").notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	assignedBy: uuid("assigned_by"),
}, (table) => [
	index("idx_user_teams_team_id").using("btree", table.teamId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_teams_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "user_teams_assigned_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "user_teams_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_teams_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.teamId], name: "user_teams_user_id_team_id_pk"}),
]);
export const teamUserGroups = pgView("team_user_groups", {	teamName: text("team_name"),
	userFirstNames: text("user_first_names"),
}).as(sql`SELECT t.name AS team_name, array_agg(u.first_name) AS user_first_names FROM user_teams ut JOIN users u ON ut.user_id = u.id JOIN teams t ON ut.team_id = t.id WHERE u.company_id = t.company_id GROUP BY t.name`);