import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import {
  User,
  Users,
  Tag,
  Hash,
  Flag,
  MessageSquare,
  Clock,
  X,
} from "lucide-react";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface TicketComment {
  id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  author: Profile;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  topic: 'support' | 'billing' | 'technical';
  type: 'question' | 'problem' | 'feature_request';
  created_at: string;
  updated_at: string;
  created_by: Profile;
  assigned_to: Profile | null;
  company_id: string;
  comments: TicketComment[];
}

const statusOptions = ['open', 'pending', 'closed'];
const priorityOptions = ['low', 'medium', 'high'];
const topicOptions = ['support', 'billing', 'technical'];
const typeOptions = ['question', 'problem', 'feature_request'];

export function EditTicketList() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<Profile[]>([]);
  const { ticketId, role } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTicketAndAgents = async () => {
      try {
        setIsLoading(true);
        // Fetch ticket with all related data
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
            tags,
            created_at,
            updated_at,
            company_id,
            created_by:profiles!tickets_created_by_fkey (
              id,
              first_name,
              last_name
            ),
            assigned_to:profiles!tickets_assigned_to_fkey (
              id,
              first_name,
              last_name
            )
          `)
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;

        // Fetch comments for the ticket
        const { data: commentsData, error: commentsError } = await supabase
          .from('ticket_comments')
          .select(`
            id,
            message,
            is_internal,
            created_at,
            author:profiles!ticket_comments_author_id_profiles_id_fk (
              id,
              first_name,
              last_name
            )
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        // Fetch available agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('company_id', ticketData.company_id)
          .in('role', ['agent', 'admin']);

        if (agentsError) throw agentsError;

        // Format the ticket data with full names
        const formattedTicket = {
          ...ticketData,
          created_by: {
            ...ticketData.created_by,
            full_name: `${ticketData.created_by.first_name} ${ticketData.created_by.last_name}`.trim()
          },
          assigned_to: ticketData.assigned_to ? {
            ...ticketData.assigned_to,
            full_name: `${ticketData.assigned_to.first_name} ${ticketData.assigned_to.last_name}`.trim()
          } : null,
          comments: commentsData.map(comment => ({
            ...comment,
            author: {
              ...comment.author,
              full_name: `${comment.author.first_name} ${comment.author.last_name}`.trim()
            }
          }))
        };

        setTicket(formattedTicket);
        setAgents(agentsData || []);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to load ticket details');
        navigate(`/${role}/dashboard/tickets`);
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketAndAgents();
    }
  }, [ticketId, role, navigate]);

  const handleBack = () => {
    navigate(`/${role}/dashboard/tickets`);
  };

  const handleFieldUpdate = async (field: keyof Ticket, value: any) => {
    if (!ticket) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ [field]: value })
        .eq('id', ticket.id);

      if (error) throw error;

      setTicket(prev => prev ? { ...prev, [field]: value } : null);
      toast.success(`Updated ${field} successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
          <button
            onClick={handleBack}
            className="text-blue-500 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">#{ticket.id}</span>
              {ticket.subject}
            </h2>
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Requester:</span>
                <span className="text-sm font-medium">{ticket.created_by.full_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Assignee:</span>
                <select 
                  value={ticket.assigned_to?.id || ''}
                  onChange={(e) => handleFieldUpdate('assigned_to', e.target.value || null)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">{getTimeAgo(ticket.created_at)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Type:</span>
                <select
                  value={ticket.type}
                  onChange={(e) => handleFieldUpdate('type', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Priority:</span>
                <select
                  value={ticket.priority}
                  onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Topic:</span>
                <select
                  value={ticket.topic}
                  onChange={(e) => handleFieldUpdate('topic', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={ticket.status}
                  onChange={(e) => handleFieldUpdate('status', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="font-medium mb-4">Comments</h3>
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg ${
                    comment.is_internal ? 'bg-yellow-50' : 'bg-white'
                  } shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        {comment.author.first_name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{comment.author.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {getTimeAgo(comment.created_at)}
                        </div>
                      </div>
                    </div>
                    {comment.is_internal && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Internal Note
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{comment.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
