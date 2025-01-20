import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  InboxIcon,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      view: "home",
      path: "/",
    },
    {
      icon: InboxIcon,
      label: "Tickets",
      view: "tickets",
      path: "/tickets",
    },
    {
      icon: Users,
      label: "Customers",
      view: "customers",
      path: "/customers",
    },
    {
      icon: BarChart2,
      label: "Analytics",
      view: "analytics",
      path: "/analytics",
    },
    {
      icon: Settings,
      label: "Settings",
      view: "settings",
      path: "/settings",
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      view: "help",
      path: "/help",
    },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    onNavigate(item.view);
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-64 bg-[#1D364D] text-white h-full transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1D364D] font-bold text-xl">Z</span>
            </div>
            <span className="font-semibold text-lg">Zendesk Clone</span>
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
                    ? "bg-[#2F4A63] text-white"
                    : "text-gray-300 hover:bg-[#2F4A63] hover:text-white"
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
