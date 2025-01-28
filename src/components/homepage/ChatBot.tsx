import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<[SpeechRecognitionResult]> & {
    [index: number]: [SpeechRecognitionResult];
  };
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  addEventListener(type: string, callback: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject): void;
}

const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = (onResult: (text: string) => void) => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onResult(transcript);
      };
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};

async function queryMedicare(question: string) {
  const url = 'https://ltjtbwxymwaslefbrheu.supabase.co/functions/v1/query-medicare';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} – ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling queryMedicare function:', error);
    return null;
  }
}

const STORAGE_KEY = 'chatbot_messages';

const clearChatHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const defaultMessage = 'Hello, how can I help you today?';
  const { isListening, startListening, stopListening } = useSpeechToText();
  
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

  // Add smooth scrolling when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

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
      const response = await queryMedicare(question);
      
      if (response && response.answer) {
        const aiMessage: Message = {
          text: response.answer,
          isUser: false,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          text: "I apologize, but I couldn't process your question at the moment. Please try again later.",
          isUser: false,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        text: "I apologize, but there was an error processing your question. Please try again later.",
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`mb-4 bg-white rounded-lg shadow-lg overflow-hidden ${
              isFullscreen 
                ? 'fixed inset-0 z-50 mb-0' 
                : 'w-[400px]'
            }`}
            style={{ 
              position: isFullscreen ? 'fixed' : 'absolute',
              bottom: isFullscreen ? '0' : '60px',
              right: isFullscreen ? '0' : '0'
            }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <span className="font-semibold">Support Chat</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:text-gray-200 p-1"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsFullscreen(false);
                    setIsOpen(false);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`p-4 bg-gray-50 flex flex-col ${
              isFullscreen ? 'h-[calc(100vh-64px)]' : 'h-80'
            }`}>
              <div className="flex-1 overflow-y-auto">
                {messages.map((message, _) => (
                  <div key={message.timestamp} className={`flex items-start mb-4 ${message.isUser ? 'justify-end' : ''}`}>
                    {!message.isUser && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          S
                        </div>
                      </div>
                    )}
                    <div className={`rounded-lg py-2 px-3 max-w-[80%] ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-gray-800'
                    }`}>
                      <p>{message.text}</p>
                    </div>
                    {message.isUser && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                          U
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="mt-4 flex gap-2 px-2">
                <div className="flex-1 flex gap-2 min-w-0">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    disabled={isLoading || isListening}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening((text) => setQuestion(text));
                      }
                    }}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    isLoading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform duration-200 hover:scale-110 relative ${isFullscreen ? 'hidden' : ''}`}
        style={{ zIndex: 51 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
}
