import {
  User,
  Users,
  Tag,
  Hash,
  Flag,
  MessageSquare,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { TagInput } from "../ui/TagInput";
import { RichTextEditor } from "../ui/RichTextEditor";
import { convertFromRaw, convertToRaw } from 'draft-js';
import { useTicket, useUpdateTicket, useAddTicketMessage, useUpdateTicketTags } from "../../hooks/queries/useTickets";
import { useAgents } from '../../hooks/queries/useAgents';
import { supabase } from "../../lib/supabaseClient";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

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
  const { data: agents } = useAgents();
  const [isRewriting, setIsRewriting] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const { data: ticket, isLoading, refetch } = useTicket(ticketId);
  const { mutate: updateTicket } = useUpdateTicket();
  const { mutate: updateTags } = useUpdateTicketTags();
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
    if (!ticket || !isAgent) return;

    if (field === 'tags') {
      updateTags({ 
        ticketId: ticket.id, 
        companyId: ticket.companyId, 
        tags: value 
      });
      return;
    }
    
    // Handle other fields normally
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

  const getEventDescription = (event: any) => {
    switch (event.event_type) {
      case 'status_changed':
        return `Status changed from ${event.old_value || 'none'} to ${event.new_value}`;
      case 'priority_changed':
        return `Priority changed from ${event.old_value || 'none'} to ${event.new_value}`;
      case 'assigned_to_changed':
        return `Assignment changed from ${event.old_value || 'unassigned'} to ${event.new_value || 'unassigned'}`;
      case 'type_changed':
        return `Type changed from ${event.old_value || 'none'} to ${event.new_value}`;
      case 'topic_changed':
        return `Topic changed from ${event.old_value || 'none'} to ${event.new_value}`;
      case 'tags_updated':
        return `Tags updated`;
      default:
        return `${event.event_type} updated`;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRewriteMessage = async () => {
    if (!message.trim()) return;

    setIsRewriting(true);
    try {
      const prompt = ChatPromptTemplate.fromTemplate(`
        You are a professional customer service expert. Your task is to rewrite the following message to be more professional, clear, and courteous while maintaining its original meaning.

        Guidelines:
        - Maintain a professional and polite tone
        - Keep the core message and all important details
        - Use clear and concise language
        - Ensure the message is well-structured
        - Do not use any placeholders like [Name] or [Title]
        - Do not add any greetings or signatures
        - Provide only the actual message content

        Original message: {message}

        Rewrite the message directly, without any additional formatting or placeholders.
      `);

      const model = new ChatOpenAI({
        modelName: "gpt-4-turbo-preview",
        temperature: 0.7,
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY
      });

      const chain = prompt.pipe(model);
      const response = await chain.invoke({
        message: getPlainTextFromDraftJS(message),
      });

      if (response?.content) {
        const cleanedMessage = response.content.toString().trim();
        const contentState = convertFromRaw({
          blocks: [
            {
              text: cleanedMessage,
              type: 'unstyled',
              depth: 0,
              inlineStyleRanges: [],
              entityRanges: [],
              key: '1',
            },
          ],
          entityMap: {},
        });
        setPreviewMessage(JSON.stringify(convertToRaw(contentState)));
        toast.success('Preview ready');
      } else {
        toast.error('Failed to generate rewritten message');
      }
    } catch (error) {
      console.error('Error rewriting message:', error);
      toast.error('Failed to rewrite message');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleAcceptRewrite = () => {
    if (previewMessage) {
      setForceUpdate(true);
      setMessage(previewMessage);
      setTimeout(() => {
        setForceUpdate(false);
      }, 100);
      setPreviewMessage(null);
      toast.success('Rewrite applied');
    }
  };

  const handleRejectRewrite = () => {
    setPreviewMessage(null);
    toast.info('Rewrite cancelled');
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
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sticky top-0 z-10">
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
                <select 
                  disabled={!isAgent}
                  value={typeof ticket.assigned_to === 'object' ? ticket.assigned_to?.id : ticket.assigned_to || ''}
                  onChange={(e) => handleFieldUpdate('assigned_to', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white disabled:opacity-75"
                >
                  <option value="">{typeof ticket.assigned_to === 'object' ? ticket.assigned_to?.full_name : 'Unassigned'}</option>
                  {isAgent && agents?.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                {isAgent ? (
                  <TagInput
                    tags={ticket.ticket_tags?.map(tag => ({ 
                      id: tag.tag?.id ?? '', 
                      name: tag.tag?.name ?? '' 
                    })) ?? []}
                    onTagsChange={(tags) => handleFieldUpdate('tags', tags.map(tag => ({ tag_id: tag.id })))}
                  />
                ) : (
                  <span className="text-sm text-gray-900 dark:text-white">
                    {ticket.tags?.map(tag => tag.name).join(', ') || 'No tags'}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                <select
                  value={ticket?.type || 'question'}
                  onChange={(e) => handleFieldUpdate('type', e.target.value)}
                  disabled={!isAgent}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white disabled:opacity-75"
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
                  value={ticket?.priority.toLowerCase() || 'medium'}
                  onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                  disabled={!isAgent}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white disabled:opacity-75"
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
                  value={ticket?.topic?.toLowerCase() || 'support'}
                  onChange={(e) => handleFieldUpdate('topic', e.target.value)}
                  disabled={!isAgent}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white disabled:opacity-75"
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
                  disabled={!isAgent}
                  value={ticket?.status.toLowerCase() || 'open'}
                  onChange={(e) => handleFieldUpdate('status', e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0 text-gray-900 dark:text-white disabled:opacity-75"
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
          <div className={`flex-1 flex flex-col ${!isAgent ? 'lg:border-r-0' : ''}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Messages */}
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
                          {formatDate(message.created_at)}
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <RichTextEditor
                initialContent={message}
                onChange={setMessage}
                onKeyPress={(e) => handleKeyPress(e, 'comment')}
                placeholder="Type your message here..."
                className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 mb-4"
                clearContent={clearMessage}
                forceUpdate={forceUpdate}
                onRewrite={handleRewriteMessage}
                isRewriting={isRewriting}
              />
              {previewMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        AI Suggestion
                      </h3>
                      <button
                        onClick={handleRejectRewrite}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Message:</div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-gray-700 dark:text-gray-300">
                          {getPlainTextFromDraftJS(message)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rewritten Message:</div>
                        <RichTextEditor
                          initialContent={previewMessage}
                          onChange={() => {}}
                          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                      <button
                        onClick={handleRejectRewrite}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAcceptRewrite}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-2 flex justify-end space-x-2">
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
          {/* Right Sidebar - Internal Notes & Events */}
          {isAgent && (
            <div className="overflow-hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              {/* Internal Notes Section */}
              <div className="flex-1 overflow-auto">
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
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{note.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Note Input Section */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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

              {/* Ticket Events Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="p-4">
                  <h3 className="font-medium mb-4 text-gray-900 dark:text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Event History
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ticket.events?.slice().reverse().map((event) => (
                      <div key={event.id} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {getEventDescription(event)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(event.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
