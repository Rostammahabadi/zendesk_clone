import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  pgEnum,
  bigint,
} from "drizzle-orm/pg-core";

// Preserve existing countries table
export const countries = pgTable('countries', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull()
});

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'agent', 'customer']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high']);
export const eventTypeEnum = pgEnum('event_type', ['created', 'updated', 'status_changed', 'assigned', 'commented']);

// Tables
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References Supabase auth.users
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdBy: uuid('created_by').notNull(), // References auth.users
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').notNull().default('open'),
  priority: ticketPriorityEnum('priority').notNull().default('medium'),
  assignedTo: uuid('assigned_to'), // References auth.users
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const ticketComments = pgTable('ticket_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
  authorId: uuid('author_id').notNull(), // References auth.users
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const ticketEvents = pgTable('ticket_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
  eventType: eventTypeEnum('event_type').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Relations helper types
export type Profile = typeof profiles.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketComment = typeof ticketComments.$inferSelect;
export type TicketEvent = typeof ticketEvents.$inferSelect;
export type Country = typeof countries.$inferSelect; 