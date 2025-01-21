import { Clock, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Ticket, formatUser } from "../types/ticket";

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All tickets</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            New Ticket
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No tickets found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleTicketClick(ticket.id.toString())}
                >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600">{ticket.customer}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        ticket.status === "open" ? "bg-green-100 text-green-800" 
                        : ticket.status === "pending" ? "bg-yellow-100 text-yellow-800" 
                        : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        ticket.priority === "high" ? "bg-red-100 text-red-800"
                        : ticket.priority === "medium" ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getTimeAgo(ticket.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Support
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
