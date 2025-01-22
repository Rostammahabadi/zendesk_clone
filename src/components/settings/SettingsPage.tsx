import { useState, useRef } from "react";
import { User, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

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
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useAuth();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`user-${userData?.id}/avatar.jpg`, file, {
          upsert: true
        });
        console.log(data, uploadError);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`user-${userData?.id}/avatar.jpg`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userData?.id);

      if (updateError) throw updateError;

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to update profile photo');
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Settings Navigation */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
        </div>
        <nav className="space-y-1 px-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                activeSection === section.id 
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <section.icon className="w-5 h-5 mr-3" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800">
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and profile settings
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  JD
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Change Photo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue="Support Agent"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
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
            <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 
                          rounded focus:ring-blue-500 dark:bg-gray-700"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 
                          rounded focus:ring-blue-500 dark:bg-gray-700"
                        defaultChecked
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Push</span>
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
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}{" "}
            settings coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
