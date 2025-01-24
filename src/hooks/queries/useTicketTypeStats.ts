import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../useAuth';

interface TicketTypeStats {
  name: string;
  value: number;
}

export const useTicketTypeStats = () => {
  const { userData } = useAuth();

  return useQuery({
    queryKey: ['ticketTypeStats', userData?.company_id],
    queryFn: async (): Promise<TicketTypeStats[]> => {
      if (!userData?.company_id) throw new Error('No company ID found');

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('type')
        .eq('company_id', userData.company_id);

      if (error) throw error;

      // Count tickets by type
      const typeCounts = tickets.reduce((acc: { [key: string]: number }, ticket) => {
        const type = ticket.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Convert to array format needed for the chart
      return Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
      }));
    },
    enabled: !!userData?.company_id,
  });
}; 