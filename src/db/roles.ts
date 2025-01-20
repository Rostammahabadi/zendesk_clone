import { pgRole } from 'drizzle-orm/pg-core';

// Define roles
export const adminRole = pgRole('admin');
export const agentRole = pgRole('agent');
export const customerRole = pgRole('customer');

// Supabase default roles
export const anonRole = pgRole('anon');
export const authenticatedRole = pgRole('authenticated');
export const serviceRole = pgRole('service_role'); 