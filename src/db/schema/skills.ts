import { pgTable, varchar, timestamp, uniqueIndex, uuid, foreignKey } from "drizzle-orm/pg-core";
import { companies } from "./companies";


export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
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