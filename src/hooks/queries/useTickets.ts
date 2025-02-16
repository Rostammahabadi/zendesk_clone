import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Ticket, formatUser, formatTicketEvent, formatTicketMessage } from '../../types/ticket';
import { useAuth } from '../useAuth';
import { toast } from 'sonner';

export const useTickets = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['tickets', userData?.company_id, userData?.role],
    queryFn: async () => {

      if (!userData?.company_id) {
        console.log('No company ID found');
        return [];
      }

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

      if (userData?.role === 'customer') {
        query = query.eq('created_by', userData.id);
      }

      if (userData?.role === 'agent') {
        query = query.eq('assigned_to', userData.id);
      }

      const { data, error } = await query
        .eq('company_id', userData.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      if (!data) {
        console.log('No tickets found');
        return [];
      }

      const formattedTickets = data.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        companyId: ticket.company_id,
        created_by: ticket.created_by ? formatUser(ticket.created_by) : null,
        assigned_to: ticket.assigned_to ? formatUser(ticket.assigned_to) : null,
        topic: null,
        type: null
      })) as Ticket[];

      return formattedTickets;
    },
    enabled: !!userData?.company_id,
    staleTime: 30000, // Cache data for 30 seconds
    retry: 3, // Retry failed requests 3 times
  });
};

export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: async () => {
      // Fetch ticket data
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
            tag_id,
            tag:tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      // Fetch ticket events
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

      // Fetch ticket messages
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

      return {
        ...ticketData,
        companyId: ticketData.company_id,
        created_by: formatUser(ticketData.created_by),
        assigned_to: ticketData.assigned_to ? formatUser(ticketData.assigned_to) : null,
        events: eventsData.map(formatTicketEvent),
        messages: messagesData.map(formatTicketMessage)
      } as Ticket;
    },
    enabled: !!ticketId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async (ticketData: Partial<Ticket>) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          company_id: userData?.company_id,
          created_by: ticketData.created_by?.id || userData?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      field, 
      value 
    }: { 
      ticketId: string; 
      field: keyof Ticket; 
      value: any 
    }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ [field]: value })
        .eq('id', ticketId);

      if (error) throw error;

      return { ticketId, [field]: value };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.ticketId] });
    },
  });
};

export const useAddTicketMessage = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      message, 
      type 
    }: { 
      ticketId: string; 
      message: string; 
      type: 'public' | 'internal_note' 
    }) => {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: userData?.id,
          message_type: type,
          body: message.trim()
        });

      if (error) throw error;
      return { ticketId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', data.ticketId] });
    },
  });
};

export const useUpdateTicketTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      companyId,
      tags 
    }: { 
      ticketId: string;
      companyId: string;
      tags: { tag_id: string }[];
    }) => {
      try {
        // First, remove all existing ticket_tags for this ticket
        const { error: deleteError } = await supabase
          .from('ticket_tags')
          .delete()
          .eq('ticket_id', ticketId);

        if (deleteError) throw deleteError;

        // For each tag, check if it exists or needs to be created
        const tagPromises = tags.map(async (tagData) => {
          // First check if a tag with this name already exists for this company
          if (!tagData.tag_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
            const { data: existingTag } = await supabase
              .from('tags')
              .select()
              .eq('name', tagData.tag_id)
              .eq('company_id', companyId)
              .single();

            if (existingTag) {
              return existingTag.id;
            }
          }

          // If it's a UUID, it's an existing tag
          if (tagData.tag_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
            return tagData.tag_id;
          }

          // If it's not a UUID and doesn't exist, create a new tag
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({
              name: tagData.tag_id,
              color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), // Random color
              company_id: companyId
            })
            .select()
            .single();

          if (createError) throw createError;
          return newTag.id;
        });

        const resolvedTagIds = await Promise.all(tagPromises);

        // Create new ticket_tags associations
        const { error: insertError } = await supabase
          .from('ticket_tags')
          .insert(
            resolvedTagIds.map(tagId => ({
              ticket_id: ticketId,
              tag_id: tagId
            }))
          );

        if (insertError) throw insertError;

        return { ticketId };
      } catch (error) {
        console.error('Error handling tags:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.ticketId] });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  });
}; 