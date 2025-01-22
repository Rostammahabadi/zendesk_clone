import { appRole } from "./role_permissions";

import { bigint, pgTable, uuid, pgPolicy, unique, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const userRoles = pgTable("user_roles", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_roles_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
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