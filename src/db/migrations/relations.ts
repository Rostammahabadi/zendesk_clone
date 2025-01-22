import { relations } from "drizzle-orm/relations";
import { users, ticketMessages, tickets, ticketEvents, companies, tags, teams, usersInAuth, userRoles, ticketTags, userTeams } from "./schema";

export const ticketMessagesRelations = relations(ticketMessages, ({one}) => ({
	user: one(users, {
		fields: [ticketMessages.senderId],
		references: [users.id]
	}),
	ticket: one(tickets, {
		fields: [ticketMessages.ticketId],
		references: [tickets.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	ticketMessages: many(ticketMessages),
	ticketEvents: many(ticketEvents),
	tickets_assignedTo: many(tickets, {
		relationName: "tickets_assignedTo_users_id"
	}),
	tickets_createdBy: many(tickets, {
		relationName: "tickets_createdBy_users_id"
	}),
	company: one(companies, {
		fields: [users.companyId],
		references: [companies.id]
	}),
	userTeams_assignedBy: many(userTeams, {
		relationName: "userTeams_assignedBy_users_id"
	}),
	userTeams_userId: many(userTeams, {
		relationName: "userTeams_userId_users_id"
	}),
}));

export const ticketsRelations = relations(tickets, ({one, many}) => ({
	ticketMessages: many(ticketMessages),
	ticketEvents: many(ticketEvents),
	user_assignedTo: one(users, {
		fields: [tickets.assignedTo],
		references: [users.id],
		relationName: "tickets_assignedTo_users_id"
	}),
	company: one(companies, {
		fields: [tickets.companyId],
		references: [companies.id]
	}),
	user_createdBy: one(users, {
		fields: [tickets.createdBy],
		references: [users.id],
		relationName: "tickets_createdBy_users_id"
	}),
	ticketTags: many(ticketTags),
}));

export const ticketEventsRelations = relations(ticketEvents, ({one}) => ({
	ticket: one(tickets, {
		fields: [ticketEvents.ticketId],
		references: [tickets.id]
	}),
	user: one(users, {
		fields: [ticketEvents.triggeredBy],
		references: [users.id]
	}),
}));

export const tagsRelations = relations(tags, ({one, many}) => ({
	company: one(companies, {
		fields: [tags.companyId],
		references: [companies.id]
	}),
	ticketTags: many(ticketTags),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	tags: many(tags),
	teams: many(teams),
	tickets: many(tickets),
	users: many(users),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	company: one(companies, {
		fields: [teams.companyId],
		references: [companies.id]
	}),
	userTeams: many(userTeams),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [userRoles.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	userRoles: many(userRoles),
}));

export const ticketTagsRelations = relations(ticketTags, ({one}) => ({
	tag: one(tags, {
		fields: [ticketTags.tagId],
		references: [tags.id]
	}),
	ticket: one(tickets, {
		fields: [ticketTags.ticketId],
		references: [tickets.id]
	}),
}));

export const userTeamsRelations = relations(userTeams, ({one}) => ({
	user_assignedBy: one(users, {
		fields: [userTeams.assignedBy],
		references: [users.id],
		relationName: "userTeams_assignedBy_users_id"
	}),
	team: one(teams, {
		fields: [userTeams.teamId],
		references: [teams.id]
	}),
	user_userId: one(users, {
		fields: [userTeams.userId],
		references: [users.id],
		relationName: "userTeams_userId_users_id"
	}),
}));