export interface User {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'agent' | 'customer';  // make it optional
  company_id?: string;                    // make it optional
  full_name?: string;
}

export interface TicketComment {
  id: string;
  body: string;
  created_at: string;
  author: User;
}

export interface TicketEvent {
  id: string;
  event_type: 'created' | 'updated_description' | 'comment_added' | 'assigned' | 'priority_changed' | 'topic_changed' | 'type_changed' | 'tags_added' | 'tags_removed' | 'closed' | 'reopened' | 'merged' | 'status_changed';
  old_value: string | null;
  new_value: string | null;
  triggered_by: User | null;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  body: string;
  created_at: string;
  sender: User;
  message_type: 'public' | 'internal_note';
}

export interface Tag {
  id?: string;
  name?: string;
  color?: string;
}

export interface TicketTag {
  tag_id: string;
  tag: Tag;
}

export interface Ticket {
  id: string;
  subject: string;
  description?: string | null;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  companyId: string;
  topic?: string | null;
  customer?: string;
  type?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: User;
  assigned_to?: User | string | null;
  tags?: Tag[];
  messages?: TicketMessage[];
  events?: TicketEvent[];
  ticket_tags?: TicketTag[];
}

export type TicketStatus = 'open' | 'pending' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketTopic = 'support' | 'billing' | 'technical';
export type TicketType = 'question' | 'problem' | 'feature_request';

export const formatUser = (userData: any): User => ({
  id: userData.id,
  email: userData.email,
  first_name: userData.first_name,
  last_name: userData.last_name,
  role: userData.role,
  company_id: userData.company_id,
  full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
});

export const formatTicketEvent = (event: any): TicketEvent => ({
  ...event,
  triggered_by: event.triggered_by ? formatUser(event.triggered_by) : null
});

export const formatTicketMessage = (message: any): TicketMessage => ({
  ...message,
  sender: formatUser(message.sender)
}); 