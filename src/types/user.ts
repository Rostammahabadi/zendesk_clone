export interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
  status?: 'Online' | 'Busy' | 'Away';
  activeTickets?: number;
  resolvedToday?: number;
  responseTime?: string;
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
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}