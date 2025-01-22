import { pgTable, serial, varchar, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companies } from "./companies";

export const skills = pgTable("skills", {
  // Primary key (serial)
  id: serial("id").primaryKey(),
  companyId: uuid("company_id") // references() => companies.id
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  // Skill name
  name: varchar("name", { length: 100 }).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
}, (table) => {
  return {
    // Unique constraint on name
    nameUniqueIdx: uniqueIndex("skills_name_unique").on(table.name),
  };
});