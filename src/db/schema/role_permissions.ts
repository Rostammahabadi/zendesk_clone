import { bigint, pgEnum, pgTable, unique } from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ['admin', 'moderator'])
export const appPermission = pgEnum("app_permission", ['channels.delete', 'messages.delete', 'users.insert', 'users.select', 'users.update', 'users.delete', 'user_teams.insert', 'user_teams.select'])
// role_permissions table using enums
export const rolePermissions = pgTable("role_permissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "role_permissions_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
	role: appRole().notNull(),
	permission: appPermission().notNull(),
}, (table) => [
	unique("role_permissions_role_permission_key").on(table.role, table.permission),
]);