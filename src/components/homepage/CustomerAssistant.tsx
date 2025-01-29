import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'customer_assistant_messages';

const clearChatHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

interface CustomerAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerAssistant({ isOpen, onClose }: CustomerAssistantProps) {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const defaultMessage = 'Hi! 👋 I\'m your personal assistant. How can I help you today?';

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        text: defaultMessage, 
        isUser: false, 
        timestamp: Date.now() 
      }]);
    }
  }, [isOpen, messages.length]);

  // Add event listener for window unload
  useEffect(() => {
    const handleUnload = () => {
      clearChatHistory();
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  // Listen for user logout
  useEffect(() => {
    const handleLogout = () => {
      clearChatHistory();
    };

    window.addEventListener('logout', handleLogout);
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add smooth scrolling when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    const userMessage: Message = {
      text: question,
      isUser: true,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      // Here we'll call the task-bot endpoint instead of queryMedicare
      const isOnTicketDetail = window.location.pathname.includes('/tickets/');
      const ticketId = isOnTicketDetail ? window.location.pathname.split('/').pop() : null;

      const response = await fetch('http://127.0.0.1:8000/functions/v1/task-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [question],
          thread_id: Date.now().toString(),
          current_user: userData?.id,
          company_id: userData?.company_id,
          ticket_id: ticketId
        })
      });
      // const response = await fetch('https://ltjtbwxymwaslefbrheu.supabase.co/functions/v1/task-bot', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ 
      //     messages: [question],
      //     thread_id: Date.now().toString(),
      //     current_user: userData?.id,
      //     company_id: userData?.company_id
      //   })
      // });
      
      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      
      if (data && data.response) {
        const aiMessage: Message = {
          text: data.response,
          isUser: false,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage: Message = {
        text: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // async function callBotWithStreaming(payload: any) {
  //   const response = await fetch("http://127.0.0.1:8000/functions/v1/task-bot", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });

  //   if (!response.body) {
  //     throw new Error("No response body from SSE endpoint.");
  //   }

  //   const reader = response.body.getReader();
  //   const decoder = new TextDecoder();

  //   let partialChunk = "";

  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) {
  //       // The stream has ended
  //       break;
  //     }
  //     // Decode the chunk
  //     const chunk = decoder.decode(value, { stream: true });
  //     partialChunk += chunk;

  //     // SSE splits events by double-newline
  //     const lines = partialChunk.split("\n\n");
  //     // The last line might be incomplete, keep it for next iteration
  //     partialChunk = lines.pop() || "";

  //     // Each 'line' is an SSE event, typically in the format "data: [TEXT]"
  //     for (const line of lines) {
  //       const sseEvent = line.trim(); // e.g. "data: Hello"
  //       if (!sseEvent.startsWith("data: ")) continue;
  //       const text = sseEvent.slice("data: ".length); // e.g. "Hello"

  //       // Now do something with the text chunk
  //       console.log("Token/Chunk:", text);

  //       // E.g. set state in your React chat UI to show partial text
  //       // setAssistantAnswer(prev => prev + text);
  //     }
  //   }
  // }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed top-20 right-4 z-50 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-[400px]"
        >
          <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              <span className="font-semibold">Customer Assistant</span>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.timestamp}
                  className={`flex items-start space-x-2 mb-4 ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {message.isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-2 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 