import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  InboxIcon,
  Users,
  Settings,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user role from metadata - fallback to customer if not set
  const userRole = user?.user_metadata?.role || 'customer';
  
  const getNavItems = (role: string) => {
    const baseItems = [
      {
        icon: Home,
        label: "Home",
        view: "home",
        path: `/${role}/dashboard`,
      },
    ];

    // Add admin-specific items
    if (role === 'admin') {
      return [
        ...baseItems,
        {
          icon: Users,
          label: "Agents",
          view: "agents",
          path: `/${role}/dashboard/agents`,
        },
        {
          icon: Briefcase,
          label: "Teams",
          view: "teams",
          path: `/${role}/dashboard/teams`,
        },
        {
          icon: Settings,
          label: "Settings",
          view: "settings",
          path: `/${role}/dashboard/settings`,
        },
      ];
    }

    // Non-admin items
    return [
      ...baseItems,
      {
        icon: InboxIcon,
        label: "Tickets",
        view: "tickets",
        path: `/${role}/dashboard/tickets`,
      },
      {
        icon: BookOpen,
        label: "Knowledge Base",
        view: "knowledgebase",
        path: `/${role}/dashboard/knowledgebase`,
      },
      {
        icon: Settings,
        label: "Settings",
        view: "settings",
        path: `/${role}/dashboard/settings`,
      },
      {
        icon: HelpCircle,
        label: "Help Center",
        view: "help",
        path: `/${role}/dashboard/help`,
      },
    ];
  };

  const navItems = getNavItems(userRole);

  const handleNavigation = (item: typeof navItems[0]) => {
    onNavigate(item.view);
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 bg-[#1D364D] dark:bg-gray-900 text-white h-full transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-[#1D364D] dark:text-white font-bold text-xl">A</span>
            </div>
            <span className="font-semibold text-lg">Assistly</span>
          </div>
        </div>
        <div className="flex-1 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`flex items-center px-4 py-2 w-full ${
                  currentView === item.view
                    ? "bg-[#2F4A63] dark:bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-[#2F4A63] dark:hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
