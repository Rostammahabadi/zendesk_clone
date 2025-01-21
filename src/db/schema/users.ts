import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { companies } from './companies';
import { pgPolicy } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: varchar('role', { length: 50, enum: ['admin', 'agent', 'customer'] }).notNull(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
}, (table) => ([
  index('idx_users_email').on(table.email),
  index('idx_users_company_id').on(table.companyId),
  index('idx_users_role').on(table.role),

  //////////////////////////////////////////////////////////////////
  // SELECT Policy
  //////////////////////////////////////////////////////////////////
  pgPolicy('select_users_policy', {
    for: 'select',
    to: 'authenticated', // or whichever Postgres role should have this policy
    using: sql`
      (
        current_user_role() = 'admin'
        OR
        (current_user_role() = 'agent' AND company_id = current_user_company_id())
        OR
        (current_user_role() = 'customer' AND id = auth.uid())
      )
    `
  }),

  //////////////////////////////////////////////////////////////////
  // INSERT Policy
  //////////////////////////////////////////////////////////////////
  pgPolicy('insert_users_policy', {
    for: 'insert',
    to: 'authenticated',
    withCheck: sql`
      (
        current_user_role() = 'admin'
        OR
        (
          current_user_role() = 'agent'
          AND company_id = current_user_company_id()
        )
      )
    `
  }),

  //////////////////////////////////////////////////////////////////
  // UPDATE Policy
  //////////////////////////////////////////////////////////////////
  pgPolicy('update_users_policy', {
    for: 'update',
    to: 'authenticated',
    using: sql`
      (
        current_user_role() = 'admin'
        OR
        (
          current_user_role() = 'agent'
          AND company_id = current_user_company_id()
        )
        OR
        (
          current_user_role() = 'customer'
          AND id = auth.uid()
        )
      )
    `,
    withCheck: sql`
      (
        current_user_role() = 'admin'
        OR
        (
          current_user_role() = 'agent'
          AND company_id = current_user_company_id()
        )
        OR
        (
          current_user_role() = 'customer'
          AND id = auth.uid()
        )
      )
    `
  }),

  //////////////////////////////////////////////////////////////////
  // DELETE Policy
  //////////////////////////////////////////////////////////////////
  pgPolicy('delete_users_policy', {
    for: 'delete',
    to: 'authenticated',
    using: sql`
      (current_user_role() = 'admin')
    `
  }),
]));