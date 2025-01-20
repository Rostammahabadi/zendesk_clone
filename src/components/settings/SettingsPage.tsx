import { useState } from "react";
import { User, Bell, Shield, Palette, Globe, CreditCard } from "lucide-react";
const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    id: "language",
    label: "Language & Region",
    icon: Globe,
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
  },
];
export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Settings Navigation */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        </div>
        <nav className="space-y-1 px-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === section.id ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <section.icon className="w-5 h-5 mr-3" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-lg font-medium">Profile Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and profile settings
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                  JD
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Change Photo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue="Support Agent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>(GMT-08:00) Pacific Time</option>
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT+00:00) UTC</option>
                    <option>(GMT+01:00) Central European Time</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage how you receive notifications and updates
              </p>
            </div>
            <div className="space-y-4 max-w-2xl">
              {[
                "New ticket assigned",
                "Ticket updates",
                "Customer replies",
                "Team mentions",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      {item}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-500"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-600">Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-500"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-600">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Other sections would be implemented similarly */}
        {(activeSection === "security" ||
          activeSection === "appearance" ||
          activeSection === "language" ||
          activeSection === "billing") && (
          <div className="flex items-center justify-center h-full text-gray-500">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}{" "}
            settings coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
