import { pgTable, uuid, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { teams } from './teams';

export const userTeams = pgTable('user_teams', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
  assignedBy: uuid('assigned_by')
    .references(() => users.id, { onDelete: 'set null' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.teamId] }),
  userIdIdx: index('idx_user_teams_user_id').on(table.userId),
  teamIdIdx: index('idx_user_teams_team_id').on(table.teamId)
}));
