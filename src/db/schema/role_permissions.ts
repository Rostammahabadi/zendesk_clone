import { bigint, pgEnum, pgTable, unique } from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ['admin', 'agent', 'customer'])

export const appPermission = pgEnum("app_permission", [
	// Companies
	'companies.insert',
	'companies.select',
	'companies.update',
	'companies.delete',
	
	// Users
	'users.insert',
	'users.select',
	'users.update',
	'users.delete',
	
	// Teams
	'teams.insert',
	'teams.select',
	'teams.update',
	'teams.delete',
	
	// User Teams
	'user_teams.insert',
	'user_teams.select',
	'user_teams.update',
	'user_teams.delete',
	
	// Tags
	'tags.insert',
	'tags.select',
	'tags.update',
	'tags.delete',
	
	// Tickets
	'tickets.insert',
	'tickets.select',
	'tickets.update',
	'tickets.delete',
	
	// Ticket Messages
	'ticket_messages.insert',
	'ticket_messages.select',
	'ticket_messages.update',
	'ticket_messages.delete',
	
	// Ticket Events
	'ticket_events.insert',
	'ticket_events.select',
	'ticket_events.update',
	'ticket_events.delete',
	
	// Ticket Tags
	'ticket_tags.insert',
	'ticket_tags.select',
	'ticket_tags.update',
	'ticket_tags.delete',
	
	// User Roles
	'user_roles.insert',
	'user_roles.select',
	'user_roles.update',
	'user_roles.delete',
	
	// Skills
	'skills.insert',
	'skills.select',
	'skills.update',
	'skills.delete',
	
	// User Skills
	'user_skills.insert',
	'user_skills.select',
	'user_skills.update',
	'user_skills.delete',
])

// role_permissions table using enums
export const rolePermissions = pgTable("role_permissions", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "role_permissions_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
  role: appRole().notNull(),
  permission: appPermission().notNull(),
}, (table) => [
  unique("role_permissions_role_permission_key").on(table.role, table.permission),
]);
