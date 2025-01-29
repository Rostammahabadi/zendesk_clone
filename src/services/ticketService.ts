import { supabase } from '../lib/supabaseClient';
import { Ticket, formatUser, formatTicketEvent, formatTicketMessage } from '../types/ticket';

export const ticketService = {
  async fetchTickets(userId: string, userRole: string) {
    let query = supabase
      .from('tickets')
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        created_at,
        updated_at,
        company_id,
        created_by:users!tickets_created_by_users_id_fk (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        ),
        assigned_to:users!tickets_assigned_to_users_id_fk (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        )
      `);

    if (userRole === 'customer') {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      companyId: ticket.company_id,
      created_by: formatUser(ticket.created_by),
      assigned_to: ticket.assigned_to ? formatUser(ticket.assigned_to) : null,
      topic: null,
      type: null
    })) as Ticket[];
  },

  async fetchTicket(ticketId: string) {
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        topic,
        type,
        created_at,
        updated_at,
        company_id,
        created_by:users!tickets_created_by_users_id_fk (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        ),
        assigned_to:users!tickets_assigned_to_users_id_fk (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        ),
        ticket_tags (
          tag_id
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    return {
      ...ticketData,
      companyId: ticketData.company_id,
      created_by: formatUser(ticketData.created_by),
      assigned_to: ticketData.assigned_to ? formatUser(ticketData.assigned_to) : null,
      ticket_tags: ticketData.ticket_tags.map(tag => ({ 
        tag_id: tag.tag_id,
        tag: { id: tag.tag_id, name: '', color: '#000000' }
      })),
      comments: [],
      events: []
    } as Ticket;
  },

  async fetchTicketEvents(ticketId: string) {
    const { data: eventsData, error: eventsError } = await supabase
      .from('ticket_events')
      .select(`
        id,
        event_type,
        old_value,
        new_value,
        created_at,
        triggered_by:users!ticket_events_triggered_by_users_id_fk (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (eventsError) throw eventsError;

    return eventsData.map(formatTicketEvent);
  },

  async fetchTicketMessages(ticketId: string) {
    const { data: messagesData, error: messagesError } = await supabase
      .from('ticket_messages')
      .select(`
        id,
        body,
        created_at,
        message_type,
        sender:sender_id (
          id,
          email,
          first_name,
          last_name,
          role,
          company_id
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return messagesData.map(formatTicketMessage);
  },

  async updateTicketField(ticketId: string, field: keyof Ticket, value: any) {
    const { error } = await supabase
      .from('tickets')
      .update({ [field]: value })
      .eq('id', ticketId);

    if (error) throw error;
  },

  async addTicketMessage(ticketId: string, userId: string, message: string, type: 'public' | 'internal_note') {
    const { error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: userId,
        message_type: type,
        body: message.trim()
      });

    if (error) throw error;
  },

  async fetchMessageSender(senderId: string) {
    const { data: senderData, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, company_id')
      .eq('id', senderId)
      .single();

    if (error) throw error;
    return senderData;
  },

  async fetchAgents(companyId: string) {
    const { data: agentsData, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, company_id')
      .eq('company_id', companyId)
      .in('role', ['agent', 'admin']);

    if (error) throw error;
    return agentsData;
  },

  async createTicket(ticketData: any) {
    const { error } = await supabase
      .from('tickets')
      .insert(ticketData);

    if (error) throw error;
  }
}; 