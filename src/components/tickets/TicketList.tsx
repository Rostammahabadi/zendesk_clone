import { useState, useEffect } from "react";
import { Clock, Tag } from "lucide-react";
import { NewTicketModal } from "./NewTicketModal";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types/ticket";

export function TicketList() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const userRole = user.user_metadata?.role;
        const ticketsData = await ticketService.fetchTickets(user.id, userRole);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/${role}/dashboard/tickets/${ticketId}`);
  };

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

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All tickets</h2>
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
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
                onClick={() => handleTicketClick(ticket.id)}
                className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {ticket.created_by?.full_name || 'Unknown Customer'}
                      {ticket.assigned_to && ` • Assigned to ${ticket.assigned_to.full_name}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        ticket.status === "open" ? "bg-green-100 text-green-800" 
                        : ticket.status === "pending" ? "bg-yellow-100 text-yellow-800" 
                        : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        ticket.priority === "high" ? "bg-red-100 text-red-800"
                        : ticket.priority === "medium" ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
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
        <NewTicketModal
          isOpen={isNewTicketModalOpen}
          onClose={() => setIsNewTicketModalOpen(false)}
        />
      </div>
    </div>
  );
}
