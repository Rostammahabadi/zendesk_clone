import { pgTable, serial, uuid, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { skills } from "./skills";

export const userSkills = pgTable("user_skills", {
  // Primary key (serial)
  id: serial("id").primaryKey(),

  // References users.user_id
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // References skills.id
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),

  // Optional proficiency level
  proficiency: varchar("proficiency", { length: 50 }),

  // Timestamp
  addedAt: timestamp("added_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
});