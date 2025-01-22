import { pgTable, serial, uuid, varchar, timestamp, integer, foreignKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { skills } from "./skills";

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