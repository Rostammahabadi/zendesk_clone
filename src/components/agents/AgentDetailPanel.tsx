import { useState } from "react";
import {
  X,
  Plus,
  Mail,
  Phone,
  Check,
  Search,
} from "lucide-react";
import { useUpdateUser } from "../../hooks/queries/useUsers";
import { useSkills, useCreateSkill, Skill } from "../../hooks/queries/useSkills";
import { useUserSkills, useAddUserSkill, useRemoveUserSkill } from "../../hooks/queries/useUserSkills";
import { toast } from "sonner";

interface AgentDetailsPanelProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
}

const formatPhoneNumber = (value: string) => {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, "");
  
  // Format the number as (XXX) XXX-XXXX
  if (phoneNumber.length === 0) return "";
  if (phoneNumber.length <= 3) return phoneNumber;
  if (phoneNumber.length <= 6) 
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const unformatPhoneNumber = (value: string) => {
  return value.replace(/\D/g, "");
};

export function AgentDetailsPanel({
  agent,
  isOpen,
  onClose,
}: AgentDetailsPanelProps) {
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: agent?.email || "",
    phone: formatPhoneNumber(agent?.phone_number || ""),
  });

  const updateUser = useUpdateUser();
  const { data: availableSkills = [], isLoading: isLoadingSkills } = useSkills();
  const { data: userSkills = [], isLoading: isLoadingUserSkills } = useUserSkills(agent?.id);
  const createSkill = useCreateSkill();
  const addUserSkill = useAddUserSkill();
  const removeUserSkill = useRemoveUserSkill();

  const filteredSkills = availableSkills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await createSkill.mutateAsync(newSkillName);
      setNewSkillName("");
      toast.success("Skill created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create skill");
    }
  };

  const handleSkillClick = async (skill: Skill) => {
    const hasSkill = userSkills.some(us => us.skill_id === skill.id);
    
    try {
      if (hasSkill) {
        await removeUserSkill.mutateAsync({
          userId: String(agent.id),
          skillId: String(skill.id),
        });
        toast.success(`Removed ${skill.name} from ${agent.first_name}'s skills`);
      } else {
        await addUserSkill.mutateAsync({
          userId: String(agent.id),
          skillId: String(skill.id),
        });
        toast.success(`Added ${skill.name} to ${agent.first_name}'s skills`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update skill");
    }
  };

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        userId: String(agent.id),
        userData: {
          email: formData.email,
          phone_number: unformatPhoneNumber(formData.phone),
        },
      });
      setIsEditing(false);
      toast.success("Contact information updated successfully");
    } catch (error) {
      toast.error("Failed to update contact information");
    }
  };

  const handleEdit = () => {
    setFormData({
      email: agent?.email || "",
      phone: formatPhoneNumber(agent?.phone_number || ""),
    });
    setIsEditing(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    // Only update if the number is empty or has 10 or fewer digits
    if (formattedNumber === "" || unformatPhoneNumber(formattedNumber).length <= 10) {
      setFormData({ ...formData, phone: formattedNumber });
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button 
              onClick={isEditing ? handleSave : handleEdit}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {agent?.first_name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {agent?.first_name} {agent?.last_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {agent?.role}
              </p>
            </div>
          </div>
        </div>
        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{
            height: "calc(100vh - 140px)",
          }}
        >
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none py-1 text-gray-900 dark:text-white"
                    placeholder="Enter email"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {agent?.email}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none py-1 text-gray-900 dark:text-white"
                    placeholder="(XXX) XXX-XXXX"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {formatPhoneNumber(agent?.phone_number || "")}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Skills
              </h3>
              <button
                onClick={() => setShowSkillSelector(!showSkillSelector)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Manage Skills
              </button>
            </div>

            {/* Skill selector */}
            {showSkillSelector && (
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {/* Search and Add New Skill */}
                <div className="space-y-4 mb-4">
                  {/* Search Skills */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Add New Skill */}
                  <form onSubmit={handleCreateSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="New skill name..."
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSkillName.trim() || createSkill.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Skills List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoadingSkills ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      Loading skills...
                    </div>
                  ) : filteredSkills.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      {searchQuery ? "No matching skills found" : "No skills available"}
                    </div>
                  ) : (
                    filteredSkills.map((skill) => {
                      const hasSkill = userSkills.some(us => us.skill_id === skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => handleSkillClick(skill)}
                          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-between group"
                        >
                          <span>{skill.name}</span>
                          <span className={`text-blue-600 dark:text-blue-400 ${hasSkill ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {hasSkill ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              "Add"
                            )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2">
              {isLoadingUserSkills ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading skills...
                </div>
              ) : userSkills.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No skills assigned
                </div>
              ) : (
                userSkills.map((userSkill) => (
                  <span
                    key={userSkill.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {userSkill.skills.name}
                    <button
                      onClick={() => handleSkillClick(userSkill.skills)}
                      className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
