import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, X, Mic, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface CustomerAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerAssistant({ isOpen, onClose }: CustomerAssistantProps) {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const location = useLocation();

  const [typing, setTyping] = useState(false);       // Are we currently typing a chunk?
  const [chunkQueue, setChunkQueue] = useState<string[]>([]); // Stores incoming chunks

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const defaultMessage = "Hi! 👋 I'm your personal assistant. How can I help you today?";

  // Speech recognition setup
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        const ticketId = getTicketId();
        console.log('Speech recognition result:', text);
        console.log('Current ticket ID:', ticketId);
        setQuestion(text);
        sendMessage(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  // Text to speech
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // On mount, add your default message if you like
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const defaultMsg = {
        text: defaultMessage,
        isUser: false,
        timestamp: Date.now()
      };
      setMessages([defaultMsg]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Extract ticket ID from URL if we're on a ticket detail page
  const getTicketId = () => {
    const match = location.pathname.match(/\/tickets\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = { text, isUser: true, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    // Add a placeholder AI message for the answer
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { text: '', isUser: false, timestamp: aiMessageId }]);

    try {
      // Transform old messages for server
      const chat_history = messages.map(m => {
        return m.isUser
          ? { type: 'human', content: m.text }
          : { type: 'ai', content: m.text };
      });

      const ticketId = getTicketId();

      // SSE call
      const response = await fetch(`${import.meta.env.VITE_LANGSERVER_URL}/stream_events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            input: text,
            chat_history,
            user_id: userData?.id,
            company_id: userData?.company_id,
            metadata: {
              user_email: userData?.email,
              user_role: userData?.role,
              ...(ticketId && { ticket_id: ticketId })
            },
            ticket_id: ticketId,
          }
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('SSE stream error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.event === 'on_chat_model_stream' && data.data?.chunk?.content) {
                // Update the last message with the new chunk
                setMessages(prev => prev.map((msg, idx) => {
                  if (idx === prev.length - 1 && !msg.isUser) {
                    return { ...msg, text: msg.text + data.data.chunk.content };
                  }
                  return msg;
                }));
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map((msg, idx) => {
        if (idx === prev.length - 1 && !msg.isUser) {
          return { ...msg, text: 'Sorry, there was an error processing your request.' };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(question);
  };

  /********************************************************************
   * 2) A useEffect that picks chunks off chunkQueue one at a time
   ********************************************************************/
  useEffect(() => {
    // If we're not already typing, and there's something in the queue, start typing it
    if (!typing && chunkQueue.length > 0) {
      const nextChunk = chunkQueue[0];
      // Remove it from the queue
      setChunkQueue(prev => prev.slice(1));
      // Start typing
      setTyping(true);
      animateChunk(nextChunk, () => {
        setTyping(false);
      });
    }
  }, [typing, chunkQueue]);

  /********************************************************************
   * 3) animateChunk: type out the chunk letter-by-letter
   *    Then call onDone() when finished.
   ********************************************************************/
  function animateChunk(chunkText: string, onDone: () => void) {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i >= chunkText.length) {
        clearInterval(intervalId);
        onDone();
        return;
      }
      const nextChar = chunkText[i++];
      // Append this character to the last AI message
      setMessages(prev => {
        return prev.map((msg, idx) => {
          // The last message in the array is the AI placeholder 
          // (or you can find it by "isUser=false and highest timestamp")
          if (idx === prev.length - 1 && !msg.isUser) {
            return { ...msg, text: msg.text + nextChar };
          }
          return msg;
        });
      });
    }, 50);
  }

  /********************************************************************
   * Your UI
   ********************************************************************/
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assistant</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.timestamp}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 rounded-full p-2 ${message.isUser ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {message.isUser ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    {!message.isUser && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speak(message.text)}
                        className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={startListening}
                className={`p-2 rounded-lg ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                } hover:bg-gray-200 dark:hover:bg-gray-600`}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!question.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}