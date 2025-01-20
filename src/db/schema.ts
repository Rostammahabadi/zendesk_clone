import { sql } from "drizzle-orm";
import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  pgEnum,
  bigint,
  boolean,
  primaryKey,
  varchar,
  pgPolicy,
  integer
} from "drizzle-orm/pg-core";
import {
  authenticatedRole,
  serviceRole,
} from "./roles";

// Preserve existing countries table
export const countries = pgTable('countries', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull()
});

// Change the enum name temporarily
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'agent', 
  'customer',
  'company_admin'
]);

// Enums
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high']);
export const eventTypeEnum = pgEnum('event_type', ['created', 'updated', 'status_changed', 'assigned', 'commented']);

// Tables
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // same as auth.users.id
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  // Now that userRoleEnum includes 'super_admin', 'admin', 'agent', 'customer':
  role: userRoleEnum("role")
    .notNull()
    .default('customer'),
  isActive: boolean("is_active").default(true).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`NOW()`).notNull(),
}, () => [
  //---------------------------------------------------------------------
  // SELECT
  //   - super_admin sees everyone
  //   - admin sees everyone in their company
  //   - agent sees only 'customer' profiles in their company + themselves
  //   - customer sees only their own profile
  //---------------------------------------------------------------------
  pgPolicy("select_profiles_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        -- super admin -> sees all
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        -- admin -> sees everyone in their company
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND table.company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
      OR (
        -- agent -> sees 'customer' profiles in same company, plus themselves
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'agent'
        AND table.company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (
          table.role = 'customer'
          OR table.id = auth.uid()
        )
      )
      OR (
        -- customer -> sees only themselves
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
        AND table.id = auth.uid()
      )
    `,
  }),

  //---------------------------------------------------------------------
  // INSERT
  //   - super_admin can create any profile
  //   - admin can create new profiles in their company
  //   - agent/customer cannot
  //---------------------------------------------------------------------
  pgPolicy("insert_profiles_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  //---------------------------------------------------------------------
  // UPDATE
  //   - super_admin can update any profile
  //   - admin can update any profile in their company
  //   - agent can only update themselves
  //   - customer can only update themselves
  //---------------------------------------------------------------------
  pgPolicy("update_profiles_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND table.company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('agent', 'customer')
        AND table.id = auth.uid()
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND table.company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('agent', 'customer')
        AND table.id = auth.uid()
      )
    `,
  }),

  //---------------------------------------------------------------------
  // DELETE
  //   - super_admin can delete any
  //   - admin can delete any profile in their company
  //   - agent/customer cannot delete
  //---------------------------------------------------------------------
  pgPolicy("delete_profiles_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND table.company_id = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
    `,
  }),
]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain"),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`NOW()`).notNull(),
}, (table) => [
  // SELECT
  pgPolicy("select_companies_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        -- super_admin sees everything
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        -- all other roles can see only their own company
        ${table.id} = (
          SELECT p.company_id 
          FROM profiles p 
          WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  // INSERT
  pgPolicy("insert_companies_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    `,
  }),

  // UPDATE
  // super_admin can update any;
  // admin can update only their own company
  pgPolicy("update_companies_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND ${table.id} = (
          SELECT p.company_id 
          FROM profiles p 
          WHERE p.id = auth.uid()
        )
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND ${table.id} = (
          SELECT p.company_id 
          FROM profiles p 
          WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  // DELETE
  pgPolicy("delete_companies_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    `,
  }),
]);

export const tickets = pgTable("tickets", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => profiles.id, { onDelete: "set null" })
    .notNull(),
  assignedTo: uuid("assigned_to")
    .references(() => profiles.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`NOW()`).notNull(),
}, (t) => [
  // SELECT
  pgPolicy("select_tickets_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        -- super_admin sees all
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        -- admin or agent can see all tickets in their company
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent')
        AND ${t.companyId} = (
          SELECT p.company_id 
          FROM profiles p 
          WHERE p.id = auth.uid()
        )
      )
      OR (
        -- customer sees only tickets they created
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
        AND ${t.createdBy} = auth.uid()
      )
    `,
  }),

  // INSERT
  //   - admin, agent, or customer can insert tickets in their own company
  //     typically you might allow all employees & customers to create tickets
  pgPolicy("insert_tickets_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      company_id = (
        SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
      )
      AND created_by = auth.uid()
    `,
  }),

  // UPDATE
  //   - super_admin can update any
  //   - admin, agent can update any ticket in their company
  //   - customer can update only their own tickets
  pgPolicy("update_tickets_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent')
        AND ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
        AND ${t.createdBy} = auth.uid()
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent')
        AND ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
        AND ${t.createdBy} = auth.uid()
      )
    `,
  }),

  // DELETE
  //   - super_admin can delete any
  //   - admin can delete any ticket in their company
  //   - agent, customer typically can't delete (but you can allow if you want)
  pgPolicy("delete_tickets_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
    `,
  }),
]);

export const ticketComments = pgTable("ticket_comments", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id").notNull(),
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "set null" })
    .notNull(),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
}, (tc) => [
  // SELECT
  pgPolicy("select_ticket_comments_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${tc.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (
          -- if isInternal = false, any user in same company can read
          ${tc.isInternal} = false
          OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company_admin','agent')
        )
      )
    `,
  }),

  // INSERT
  pgPolicy("insert_ticket_comments_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      author_id = auth.uid()
      AND company_id = (
        SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
      )
    `,
  }),

  // UPDATE
  pgPolicy("update_ticket_comments_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${tc.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND ${tc.authorId} = auth.uid()
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${tc.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND ${tc.authorId} = auth.uid()
      )
    `,
  }),

  // DELETE
  pgPolicy("delete_ticket_comments_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${tc.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),
]);

export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`NOW()`).notNull(),
}, (kb) => [
  // SELECT
  pgPolicy("select_knowledge_base_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${kb.companyId} = (
          SELECT p.company_id 
          FROM profiles p
          WHERE p.id = auth.uid()
        )
        AND (
          ${kb.isPublished} = true
          OR (request.jwt.claims->>'role') IN ('company_admin','agent')
        )
      )
    `,
  }),

  // INSERT (company_admin or super_admin in that same company)
  pgPolicy("insert_knowledge_base_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      ${kb.companyId} = (
        SELECT p.company_id 
        FROM profiles p 
        WHERE p.id = auth.uid()
      )
      AND (
        (request.jwt.claims->>'role') = 'company_admin'
        OR (request.jwt.claims->>'role') = 'super_admin'
      )
    `,
  }),

  // UPDATE
  pgPolicy("update_knowledge_base_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${kb.companyId} = (
          SELECT p.company_id FROM profiles p
          WHERE p.id = auth.uid()
        )
        AND (request.jwt.claims->>'role') = 'company_admin'
      )
    `,
    withCheck: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${kb.companyId} = (
          SELECT p.company_id FROM profiles p
          WHERE p.id = auth.uid()
        )
        AND (request.jwt.claims->>'role') = 'company_admin'
      )
    `,
  }),
]);

export const ticketEvents = pgTable("ticket_events", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id").notNull(),
  ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "cascade" }).notNull(),
  eventType: text("event_type").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  triggeredBy: uuid("triggered_by").references(() => profiles.id, { onDelete: "set null" }),
  eventTimestamp: timestamp("event_timestamp").default(sql`NOW()`).notNull(),
}, (te) => [
  pgPolicy("select_ticket_events_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${te.companyId} = (
          SELECT p.company_id 
          FROM profiles p
          WHERE p.id = auth.uid()
        )
      )
    `,
  }),
  // Insert typically by service or system triggers
  pgPolicy("insert_ticket_events_policy", {
    as: "permissive",
    for: "insert",
    to: serviceRole,
    withCheck: sql`true`,
  }),
]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  senderId: uuid("sender_id").references(() => profiles.id, { onDelete: "set null" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
}, (cm) => [
  pgPolicy("select_chat_messages_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${cm.companyId} = (
          SELECT p.company_id FROM profiles p
          WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  pgPolicy("insert_chat_messages_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      ${cm.senderId} = auth.uid()
      AND ${cm.companyId} = (
        SELECT p.company_id FROM profiles p
        WHERE p.id = auth.uid()
      )
    `,
  }),
]);

export const dailyTicketMetrics = pgTable("daily_ticket_metrics", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").notNull(),
  openCount: integer("open_count").default(0).notNull(),
  closedCount: integer("closed_count").default(0).notNull(),
  averageResolutionTime: integer("average_resolution_time"),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
}, (dm) => [
  pgPolicy("select_metrics_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (request.jwt.claims->>'role') = 'super_admin'
      OR (
        ${dm.companyId} = (
          SELECT p.company_id 
          FROM profiles p
          WHERE p.id = auth.uid()
        )
      )
    `,
  }),
  // Insert/Update typically by a nightly job or service role
  pgPolicy("insert_metrics_policy", {
    as: "permissive",
    for: "insert",
    to: serviceRole,
    withCheck: sql`true`,
  }),
  pgPolicy("update_metrics_policy", {
    as: "permissive",
    for: "update",
    to: serviceRole,
    using: sql`true`,
    withCheck: sql`true`,
  }),
]);

export const teams = pgTable("teams", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").default(sql`NOW()`).notNull(),
}, (t) => [
  // SELECT
  pgPolicy("select_teams_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  // INSERT
  pgPolicy("insert_teams_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),

  // UPDATE
  pgPolicy("update_teams_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),

  // DELETE
  pgPolicy("delete_teams_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${t.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),
]);

export const profileTeams = pgTable("profile_teams", {
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  companyId: uuid("company_id").notNull(),
}, (pt) => [
  primaryKey(pt.profileId, pt.teamId),

  // SELECT
  pgPolicy("select_profile_teams_policy", {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${pt.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
      )
    `,
  }),

  // INSERT
  pgPolicy("insert_profile_teams_policy", {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${pt.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),

  // UPDATE (often unnecessary for a join table, but included if needed)
  pgPolicy("update_profile_teams_policy", {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${pt.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
    withCheck: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${pt.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),

  // DELETE
  pgPolicy("delete_profile_teams_policy", {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
      )
      OR (
        ${pt.companyId} = (
          SELECT p.company_id FROM profiles p WHERE p.id = auth.uid()
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      )
    `,
  }),
]);

// Relations helper types
export type Profile = typeof profiles.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketComment = typeof ticketComments.$inferSelect;
export type TicketEvent = typeof ticketEvents.$inferSelect;
export type Country = typeof countries.$inferSelect; 