import { pgView, text, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Declare the view with Drizzle
export const teamUserGroups = pgView(
  "team_user_groups",
  {
    teamName: text("team_name").notNull(),
    userFirstNames: text("user_first_names").array().notNull(),
    companyId: uuid("company_id").notNull(),
  }
).as(
  sql`
    SELECT
      t.name AS team_name,
      array_agg(u.first_name) AS user_first_names,
      t.company_id
    FROM user_teams ut
    JOIN users u ON ut.user_id = u.id
    JOIN teams t ON ut.team_id = t.id
    WHERE u.company_id = t.company_id
    GROUP BY t.name, t.company_id
  `
);