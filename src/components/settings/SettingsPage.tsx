import { useState, useRef } from "react";
import { User, Bell, Wrench, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";
import { useSkills, useCreateSkill, useDeleteSkill } from "../../hooks/queries/useSkills";

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
    id: "skills",
    label: "Skills",
    icon: Wrench,
    adminOnly: true,
  },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [newSkillName, setNewSkillName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';
  const { data: skills, isLoading: isLoadingSkills } = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();

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

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSkill.mutateAsync(newSkillName);
      setNewSkillName("");
      toast.success("Skill added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await deleteSkill.mutateAsync(skillId);
      toast.success("Skill deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete skill");
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex h-full">
      {/* Settings Navigation */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
        </div>
        <nav className="space-y-1 px-2">
          {settingsSections
            .filter(section => !section.adminOnly || isAdmin)
            .map((section) => (
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
      <div className="flex-1 p-6 bg-white dark:bg-gray-800 min-h-full">
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
        {activeSection === "skills" && isAdmin && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Skills Management</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage the skills that can be assigned to agents in your organization
              </p>
            </div>

            {/* Add new skill form */}
            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Enter skill name"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={createSkill.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </button>
            </form>

            {/* Skills list */}
            <div className="mt-6">
              {isLoadingSkills ? (
                <div className="text-gray-500 dark:text-gray-400">Loading skills...</div>
              ) : skills?.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No skills added yet</div>
              ) : (
                <ul className="space-y-2">
                  {skills?.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{skill.name}</span>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={deleteSkill.isPending}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
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
