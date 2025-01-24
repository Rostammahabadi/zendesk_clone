import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../useAuth";

interface TicketStats {
  total: number;
  open: number;
  pending: number;
  resolvedToday: number;
  monthlyTrends: {
    name: string;
    tickets: number;
  }[];
}

export const useTicketStats = () => {
  const { userData } = useAuth();
  
  return useQuery({
    queryKey: ['ticketStats', userData?.company_id],
    queryFn: async (): Promise<TicketStats> => {
      if (!userData?.company_id) throw new Error('No company ID found');

      // Get all tickets for the company
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('company_id', userData.company_id);

      if (error) throw error;

      // Get today's start timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate monthly trends (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthlyTickets = tickets.filter(ticket => {
          const ticketDate = new Date(ticket.created_at);
          return ticketDate >= monthStart && ticketDate <= monthEnd;
        });

        monthlyTrends.push({
          name: monthNames[date.getMonth()],
          tickets: monthlyTickets.length
        });
      }

      return {
        total: tickets.length,
        open: tickets.filter(ticket => ticket.status === 'open').length,
        pending: tickets.filter(ticket => ticket.status === 'pending').length,
        resolvedToday: tickets.filter(ticket => 
          ticket.status === 'closed' && 
          new Date(ticket.updated_at) >= today
        ).length,
        monthlyTrends
      };
    },
    enabled: !!userData?.company_id,
  });
}; 