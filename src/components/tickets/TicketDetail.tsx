import {
  User,
  Users,
  Tag,
  Hash,
  Flag,
  MessageSquare,
  Clock,
  X,
  History,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { TagInput } from "../ui/TagInput";
import { Ticket, TicketEvent, TicketMessage, formatTicketMessage } from '../../types/ticket';
import { ticketService } from '../../services/ticketService';
import { supabase } from '../../lib/supabaseClient';
import { RichTextEditor } from "../ui/RichTextEditor";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'agent' | 'customer';
  company_id: string;
  full_name?: string;
}

const statusOptions = ['open', 'pending', 'closed'];
const priorityOptions = ['low', 'medium', 'high'];
const topicOptions = ['support', 'billing', 'technical'];
const typeOptions = ['question', 'problem', 'feature_request'];

export function TicketDetail() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publicMessages, setPublicMessages] = useState<TicketMessage[]>([]);
  const [internalNotes, setInternalNotes] = useState<TicketMessage[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const { ticketId, role } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [showMacros] = useState(false);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId) return;
      
      try {
        setIsLoading(true);
        const [ticketData, eventsData, messagesData] = await Promise.all([
          ticketService.fetchTicket(ticketId),
          ticketService.fetchTicketEvents(ticketId),
          ticketService.fetchTicketMessages(ticketId)
        ]);

        setTicket(ticketData);
        setEvents(eventsData);
        setPublicMessages(messagesData.filter(msg => msg.message_type === 'public'));
        setInternalNotes(messagesData.filter(msg => msg.message_type === 'internal_note'));
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to load ticket details');
        navigate(`/${role}/dashboard/tickets`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();

    // Set up realtime subscriptions
    const ticketSubscription = supabase
      .channel('ticket_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${ticketId}`
      }, (payload) => {
        setTicket(prev => prev ? { ...prev, ...payload.new } : null);
      })
      .subscribe();

    const eventsSubscription = supabase
      .channel('ticket_events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_events',
        filter: `ticket_id=eq.${ticketId}`
      }, (payload) => {
        setEvents(prev => [...prev, payload.new as TicketEvent]);
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('ticket_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, async (payload) => {
        const { data: senderData } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, company_id')
          .eq('id', payload.new.sender_id)
          .single();
          
        const message = formatTicketMessage({ ...payload.new, sender: senderData });
        if (message.message_type === 'public') {
          setPublicMessages(prev => [...prev, message]);
        } else {
          setInternalNotes(prev => [...prev, message]);
        }
      })
      .subscribe();

    return () => {
      ticketSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [ticketId, role]);

  useEffect(() => {
    if (!scrollableRef.current) return;
    const container = scrollableRef.current;
    container.scrollTop = container.scrollHeight;
  }, [events]);

  const handleBack = () => {
    navigate(`/${role}/dashboard/tickets`);
  };

  const handleFieldUpdate = async (field: keyof Ticket, value: any) => {
    if (!ticket) return;

    try {
      await ticketService.updateTicketField(ticket.id, field, value);
      setTicket(prev => prev ? { ...prev, [field]: value } : null);
      toast.success(`Updated ${field} successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleSubmitComment = async () => {
    if (!message.trim() || !ticket || !user) return;

    try {
      await ticketService.addTicketMessage(ticket.id, user.id, message, 'public');
      toast.success('Comment added successfully');
      setMessage('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim() || !ticket || !user) return;

    try {
      await ticketService.addTicketMessage(ticket.id, user.id, internalNote, 'internal_note');
      toast.success('Internal note added successfully');
      setInternalNote('');
    } catch (error) {
      console.error('Error adding internal note:', error);
      toast.error('Failed to add internal note');
    }
  };

  const getEventDescription = (event: TicketEvent) => {
    switch (event.event_type) {
      case 'created':
        return 'Ticket created';
      case 'updated_description':
        return 'Description updated';
      case 'comment_added':
        return 'Comment added';
      case 'assigned':
        return `Assigned to ${event.new_value}`;
      case 'priority_changed':
        return `Priority changed from ${event.old_value} to ${event.new_value}`;
      case 'topic_changed':
        return `Topic changed from ${event.old_value} to ${event.new_value}`;
      case 'type_changed':
        return `Type changed from ${event.old_value} to ${event.new_value}`;
      case 'tags_added':
        return `Tags added: ${event.new_value}`;
      case 'tags_removed':
        return `Tags removed: ${event.old_value}`;
      case 'status_changed':
        return `Status changed from ${event.old_value} to ${event.new_value}`;
      case 'closed':
        return 'Ticket closed';
      case 'reopened':
        return 'Ticket reopened';
      case 'merged':
        return `Merged with ticket ${event.new_value}`;
      default:
        return 'Unknown event';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Ticket not found</h2>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">#{ticket.id}</span>
              {ticket.subject}
            </h2>
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Requester:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {ticket.created_by?.full_name || 'Unknown User'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Assignee:</span>
                <select className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white">
                  <option>{ticket.assigned_to?.full_name || 'Unassigned'}</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                <TagInput
                  tags={ticket.tags?.map(tag => tag.id) || []}
                  onTagsChange={(tags) => handleFieldUpdate('tags', tags.map(tag => ({ tag_id: tag })))}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <select
                  value={ticket?.type || 'question'}
                  onChange={(e) => handleFieldUpdate('type', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type} className="bg-white dark:bg-gray-800">
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                <select 
                  value={ticket?.priority || 'medium'}
                  onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority} className="bg-white dark:bg-gray-800">
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Topic:</span>
                <select
                  value={ticket?.topic || 'support'}
                  onChange={(e) => handleFieldUpdate('topic', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic} className="bg-white dark:bg-gray-800">
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={ticket?.status || 'open'}
                  onChange={(e) => handleFieldUpdate('status', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status} className="bg-white dark:bg-gray-800">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Thread */}
          <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {publicMessages.map(message => (
                <div key={message.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        {message.sender?.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {message.sender?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(message.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {message.body}
                  </p>
                </div>
              ))}
            </div>
            {/* Reply Box */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <RichTextEditor
                initialContent={message}
                onChange={(value) => setMessage(value)}
                placeholder="Type your reply..."
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={internalNote.trim() !== ''}
                    onChange={(e) => setInternalNote(e.target.checked ? 'Internal note' : '')}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Internal Note
                  </span>
                </label>
                <button
                  onClick={handleSubmitComment}
                  disabled={!message.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-800">
            <div className="p-4">
              <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Internal Notes</h3>
              <div className="space-y-4">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add an internal note..."
                  className="w-full p-3 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 
                    focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                />
                <button 
                  onClick={handleAddInternalNote}
                  disabled={!internalNote.trim()}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                    rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {internalNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.sender.email}`}
                          alt={note.sender.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {note.sender.full_name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {note.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Activity History</h3>
                <div className="max-h-[400px] overflow-y-auto pr-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800" ref={scrollableRef}>
                  {events.map((event) => (
                    <div key={event.id} className="text-sm">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <History className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{new Date(event.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {getEventDescription(event)}
                        {event.triggered_by && (
                          <span className="text-gray-500 dark:text-gray-400"> by {event.triggered_by.first_name} {event.triggered_by.last_name}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
