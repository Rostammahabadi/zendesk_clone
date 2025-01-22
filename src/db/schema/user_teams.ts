import { pgTable, uuid, timestamp, index, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { teams } from './teams';

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
