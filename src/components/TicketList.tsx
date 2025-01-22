import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Ticket, formatUser } from "../types/ticket";

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [_, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { role } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        
        // Get user's role from metadata
        const userRole = user.user_metadata?.role;
        
        let query = supabase
          .from('tickets')
          .select(`
            id,
            subject,
            status,
            priority,
            created_at,
            updated_at,
            created_by:users!tickets_created_by_users_id_fk (
              id,
              first_name,
              last_name
            ),
            company_id
          `);

        // If user is a customer, only show their tickets
        if (userRole === 'customer') {
          query = query.eq('customer_id', user?.id);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false });
        if (error) throw error;
        
        const formattedTickets = data.map(ticket => ({
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          companyId: ticket.company_id,
          created_by: formatUser(ticket.created_by),
          description: null,
          topic: null,
          type: null,
          assigned_to: null,
          tags: []
        }));

        setTickets(formattedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id]);

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/${role}/dashboard/tickets/${ticketId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {ticket.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {ticket.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {ticket.created_by?.full_name || 'Unknown Customer'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ticket.status === 'open' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 
                      ticket.status === 'closed' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 
                      'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${ticket.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 
                      ticket.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' : 
                      'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getTimeAgo(ticket.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
