import { Bell, User, LogOut, Moon, Sun, Plus, Bot, MoreVertical } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../hooks/useAuth";
import { CreateTicketFlow } from "./tickets/CreateTicketFlow";
import { CustomerAssistant } from './homepage/CustomerAssistant';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { userData } = useAuth();
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const isCustomer = userData?.role === 'customer';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    localStorage.theme = 'light';
    document.documentElement.classList.remove('dark');
    navigate(`/login`);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Help Desk</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Actions Button - Only show if not admin */}
          {userData?.role !== 'admin' && (
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <MoreVertical className="h-4 w-4" />
                <span>Actions</span>
              </button>
              
              {isActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCreateTicket(true);
                      setIsActionsOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ticket
                  </button>
                  
                  {isCustomer && (
                    <button
                      onClick={() => {
                        setShowAssistant(true);
                        setIsActionsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      AI Assistant
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 border
                bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        <CreateTicketFlow
          isOpen={showCreateTicket}
          onClose={() => setShowCreateTicket(false)}
        />
        
        {isCustomer && (
          <CustomerAssistant
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
          />
        )}
      </div>
    </header>
  );
}
