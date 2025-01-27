import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCompanyUsers } from "../../hooks/queries/useUsers";
import { useCreateTeam } from "../../hooks/queries/useTeams";
import { toast } from "sonner";
import { User } from "../../types/user";

interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  members: User[];
}

export function NewTeamModal({ isOpen, onClose }: NewTeamModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    members: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: users, isLoading: isLoadingUsers } = useCompanyUsers();
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam();

  // Filter users to only include agents
  const agentUsers = users?.filter(user => user.role === 'agent') ?? [];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSearchQuery("");
      setFormData({
        name: "",
        members: [],
      });
      setErrors({});
    }
  }, [isOpen]);

  const filteredUsers = agentUsers.filter(
    (user) =>
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.name.trim()) {
      newErrors.name = "Team name is required";
    }
    if (step === 2 && formData.members.length === 0) {
      newErrors.members = "Please select at least one team member";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: "Team name is required" });
      return;
    }

    createTeam(
      { 
        name: formData.name.trim(), 
        memberIds: formData.members.map(m => m.id ?? '') 
      },
      {
        onSuccess: () => {
          toast.success("Team created successfully");
          onClose();
          setFormData({ name: "", members: [] });
          setStep(1);
        },
        onError: (error) => {
          toast.error("Failed to create team");
          console.error("Error creating team:", error);
        }
      }
    );
  };

  const toggleMember = (userId: string) => {
    const userToAdd = users?.find(u => u.id === userId);
    if (!userToAdd) return;
    
    setFormData((prev) => ({
      ...prev,
      members: prev.members.some(m => m.id === userId)
        ? prev.members.filter(m => m.id !== userId)
        : [...prev.members, userToAdd as User]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-neutral-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Create New Team
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-b-none">
          <div
            className="h-1 bg-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {step === 1 ? (
            <>
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-50 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300 focus:ring-indigo-500 dark:focus:ring-indigo-500"
                  }`}
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-50"
                />
              </div>

              {/* User List */}
              {errors.members && (
                <p className="flex items-center text-sm text-red-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.members}
                </p>
              )}
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleMember(user.id ?? '')}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.members.some(member => member.id === user.id)
                          ? "bg-indigo-50 border border-indigo-500 dark:bg-indigo-800/30 dark:border-indigo-600"
                          : "bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800/30 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {user.email}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {user.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={step === 1 ? handleNext : handleSubmit}
            disabled={isCreating}
            className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : step === 1 ? (
              <>
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <span>Create Team</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}