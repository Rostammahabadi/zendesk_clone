import {
  User,
  Users,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { useUpdateUser } from "../hooks/queries/useUsers";
import { useAddTeamMember } from "../hooks/queries/useTeams";

interface Team {
  id: number;
  name: string;
  company_id: string;
}

type OnboardingData = {
  firstName: string;
  lastName: string;
  teamId?: number;
  phoneNumber?: string;
};

const STEPS = [
  {
    title: "Welcome! Let's get to know you",
    subtitle: "First, what's your name?",
  },
  {
    title: "Join your team",
    subtitle: "Which team will you be working with?",
  },
  {
    title: "Almost there!",
    subtitle: "How can your teammates reach you?",
  },
];

export function OnboardingWalkthrough() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const addTeamMember = useAddTeamMember();
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    teamId: undefined,
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teams when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // First get the user's company_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (userError) throw userError;
        if (!userData?.company_id) {
          console.error('No company ID found for user');
          return;
        }

        // Then fetch teams for that company
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('company_id', userData.company_id);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      }
    };

    if (user?.id) {
      fetchTeams();
    }
  }, [user?.id]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }
    // Phone number validation is optional but if provided should be valid
    if (
      step === 3 &&
      formData.phoneNumber &&
      !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (step === STEPS.length) {
        try {
          // Update user with the collected information
          await updateUser.mutateAsync({
            userId: user?.id || '',
            userData: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: formData.phoneNumber,
            }
          });
          
          // If a team was selected, add the user to the team
          if (formData.teamId) {
            await addTeamMember.mutateAsync({
              teamId: formData.teamId.toString(),
              userId: user?.id || ''
            });
          }
          
          // Fetch updated user data and store in localStorage
          const { data: updatedUserData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user?.id)
            .single();
            
          if (userError) throw userError;
          
          // Clear and update localStorage with new user data
          localStorage.removeItem('userData');
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          
          toast.success("Profile updated successfully!");
          // Navigate to the appropriate dashboard based on role
          navigate(`/${user?.user_metadata.role}/dashboard`);
        } catch (error) {
          console.error('Error updating user:', error);
          toast.error("Failed to update profile");
        }
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{
              width: `${(step / STEPS.length) * 100}%`,
            }}
          />
        </div>
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {STEPS[step - 1].title}
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {STEPS[step - 1].subtitle}
            </p>
          </div>
          {/* Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Your Team
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.teamId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a team (optional)</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                {teams.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No teams available. Teams can be created in the dashboard after setup.
                  </p>
                )}
              </div>
            )}
            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    placeholder="+1 (555) 123-4567 (optional)"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            ) : (
              <div />
            )}
            <div className="flex space-x-3">
              {step !== 1 && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {step === STEPS.length ? (
                  <>
                    Complete
                    <CheckCircle className="w-5 h-5 ml-1" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
