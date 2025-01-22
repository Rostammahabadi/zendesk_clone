import { useState } from "react";
import {
  X,
  Plus,
  Mail,
  Phone,
  Check,
} from "lucide-react";
import { useUpdateUser } from "../../hooks/queries/useUsers";
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

const skillCategories = [
  {
    name: "Technical",
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
  },
  {
    name: "Soft Skills",
    skills: [
      "Communication",
      "Leadership",
      "Problem Solving",
      "Time Management",
    ],
  },
  {
    name: "Products",
    skills: ["Product A", "Product B", "Product C", "Product D"],
  },
];

export function AgentDetailsPanel({
  agent,
  isOpen,
  onClose,
}: AgentDetailsPanelProps) {
  const [skills, setSkills] = useState<string[]>([
    "Customer Service",
    "Technical Support",
  ]);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(skillCategories[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: agent?.email || "",
    phone: formatPhoneNumber(agent?.phone_number || ""),
  });

  const updateUser = useUpdateUser();

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        userId: agent.id,
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
                Add Skill
              </button>
            </div>
            {/* Skill selector */}
            {showSkillSelector && (
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {skillCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${selectedCategory.name === category.name ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCategory.skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        if (!skills.includes(skill)) {
                          setSkills([...skills, skill]);
                        }
                      }}
                      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {skill}
                  <button
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
