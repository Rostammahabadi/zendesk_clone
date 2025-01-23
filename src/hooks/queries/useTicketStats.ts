import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../useAuth";

interface TicketStats {
  openTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
}

export function useTicketStats(timeframe: '1m' | '3m' | '6m') {
  const { userData } = useAuth();

  return useQuery({
    queryKey: ['ticketStats', timeframe, userData?.id],
    queryFn: async (): Promise<TicketStats> => {
      if (!userData?.id) throw new Error('User not found');

      const now = new Date();
      const months = parseInt(timeframe);
      const startDate = new Date(now.setMonth(now.getMonth() - months));

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('status')
        .eq('created_by', userData.id)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      return {
        openTickets: tickets.filter(t => t.status === 'open').length,
        resolvedTickets: tickets.filter(t => t.status === 'closed').length,
        pendingTickets: tickets.filter(t => t.status === 'pending').length,
      };
    },
    enabled: !!userData?.id,
  });
} 