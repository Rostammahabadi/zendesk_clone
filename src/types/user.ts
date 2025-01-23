export interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
  company_id?: string;
  created_at?: string;
  title?: string;
  updated_at?: string;
  status?: 'Online' | 'Busy' | 'Away';
  activeTickets?: number;
  resolvedToday?: number;
  responseTime?: string;
  phone_number?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'agent' | 'customer';

export interface User {
  id: string;
  email?: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  company_id?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}