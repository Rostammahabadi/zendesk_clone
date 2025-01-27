import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const defaultMessage = 'Hello, how can I help you today?';
  
  useEffect(() => {
    if (isOpen) {
      setDisplayedText('');
      let timeoutId: NodeJS.Timeout;
      
      const typeText = async () => {
        for (let i = 0; i <= defaultMessage.length; i++) {
          timeoutId = setTimeout(() => {
            setDisplayedText(defaultMessage.slice(0, i));
          }, i * 50);
        }
      };
      
      typeText();
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden"
            style={{ position: 'absolute', bottom: '60px', right: '0' }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <span className="font-semibold">Support Chat</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="p-4 h-80 bg-gray-50">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    S
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg py-2 px-3 max-w-[80%]">
                  <p className="text-gray-800">{displayedText}</p>
                  {displayedText.length < defaultMessage.length && (
                    <span className="inline-block animate-pulse">▋</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform duration-200 hover:scale-110 relative"
        style={{ zIndex: 51 }}
      >
        {!isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}
