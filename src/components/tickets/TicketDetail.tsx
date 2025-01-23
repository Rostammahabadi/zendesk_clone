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
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { TagInput } from "../ui/TagInput";
import { RichTextEditor } from "../ui/RichTextEditor";
import { convertFromRaw } from 'draft-js';
import { useTicket, useUpdateTicket, useAddTicketMessage } from "../../hooks/queries/useTickets";
import { supabase } from "../../lib/supabaseClient";

const statusOptions = ['open', 'pending', 'closed'];
const priorityOptions = ['low', 'medium', 'high'];
const topicOptions = ['support', 'billing', 'technical'];
const typeOptions = ['question', 'problem', 'feature_request'];
type UpdatableTicketField = 'type' | 'priority' | 'assigned_to' | 'status' | 'tags' | 'topic';
export function TicketDetail() {
  const { ticketId = '', role } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [clearMessage, setClearMessage] = useState(false);
  const [clearInternalNote, setClearInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAgent = role === 'agent' || role === 'admin';

  const { data: ticket, isLoading, refetch } = useTicket(ticketId);
  const { mutate: updateTicket } = useUpdateTicket();
  const { mutate: addMessage } = useAddTicketMessage();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  useEffect(() => {
    // Subscribe to ticket messages
    const subscription = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    // Subscribe to ticket events
    const eventsSubscription = supabase
      .channel(`ticket-events-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_events',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, [ticketId, refetch]);

  const handleBack = () => {
    navigate(`/${role}/dashboard/tickets`);
  };

  const handleFieldUpdate = async (field: UpdatableTicketField, value: any) => {
    if (!ticket) return;

    updateTicket({ ticketId: ticket.id, field, value }, {
      onSuccess: () => {
        toast.success(`Updated ${field} successfully`);
      },
      onError: (error) => {
        console.error(`Error updating ${field}:`, error);
        toast.error(`Failed to update ${field}`);
      }
    });
  };

  const getPlainTextFromDraftJS = (contentString: string) => {
    try {
      const content = JSON.parse(contentString);
      const contentState = convertFromRaw(content);
      return contentState.getPlainText();
    } catch (e) {
      return contentString;
    }
  };

  const handleSubmitComment = async () => {
    if (!message.trim() || !ticket || !user) return;

    const plainTextMessage = getPlainTextFromDraftJS(message);
    
    addMessage({ ticketId: ticket.id, message: plainTextMessage, type: 'public' }, {
      onSuccess: () => {
        toast.success('Comment added successfully');
        setMessage('');
        setClearMessage(true);
        setTimeout(() => setClearMessage(false), 100);
      },
      onError: (error) => {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
      }
    });
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim() || !ticket || !user) return;

    const plainTextNote = getPlainTextFromDraftJS(internalNote);

    addMessage({ ticketId: ticket.id, message: plainTextNote, type: 'internal_note' }, {
      onSuccess: () => {
        toast.success('Internal note added successfully');
        setInternalNote('');
        setClearInternalNote(true);
        setTimeout(() => setClearInternalNote(false), 100);
      },
      onError: (error) => {
        console.error('Error adding internal note:', error);
        toast.error('Failed to add internal note');
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'comment' | 'internal_note') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'comment') {
        handleSubmitComment();
      } else {
        handleAddInternalNote();
      }
    }
  };

  // const getEventDescription = (event: any) => {
  //   switch (event.event_type) {
  //     case 'status':
  //       return `Status changed from ${event.old_value || 'none'} to ${event.new_value}`;
  //     case 'priority':
  //       return `Priority changed from ${event.old_value || 'none'} to ${event.new_value}`;
  //     case 'assigned_to':
  //       return `Assignment changed from ${event.old_value || 'unassigned'} to ${event.new_value || 'unassigned'}`;
  //     default:
  //       return `${event.event_type} updated`;
  //   }
  // };

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
    <div className="h-full bg-gray-50 dark:bg-gray-900">
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
                <select disabled={role !== 'admin' && role !== 'agent'} className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white">
                  <option>{typeof ticket.assigned_to === 'object' ? ticket.assigned_to?.full_name : 'Unassigned'}</option>
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
                  disabled={role !== 'admin' && role !== 'agent'}
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
          <div className={`flex-1 flex flex-col h-[calc(100vh-200px)] ${!isAgent ? 'lg:border-r-0' : ''}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticket.messages?.filter(m => m.message_type === 'public').map(message => (
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
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <RichTextEditor
                initialContent={message}
                onChange={setMessage}
                onKeyPress={(e) => handleKeyPress(e, 'comment')}
                placeholder="Type your message here..."
                className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 mb-4"
                clearContent={clearMessage}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSubmitComment}
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
          {/* Right Sidebar - Internal Notes */}
          {isAgent && (
            <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-800">
              <div className="p-4">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Internal Notes</h3>
                <div className="space-y-4">
                  {ticket.messages?.filter(m => m.message_type === 'internal_note').map(note => (
                    <div key={note.id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">
                            {note.sender?.full_name?.[0] || '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {note.sender?.full_name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.body}</p>
                    </div>
                  ))}
                  <RichTextEditor
                    initialContent={internalNote}
                    onChange={setInternalNote}
                    onKeyPress={(e) => handleKeyPress(e, 'internal_note')}
                    placeholder="Add an internal note..."
                    className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 mb-4"
                    clearContent={clearInternalNote}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
