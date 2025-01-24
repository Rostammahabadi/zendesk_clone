import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}
type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  title: string;
  avatarUrl: string;
  phoneNumber: string;
};

const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '');
  
  // Format according to length
  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export function NewAgentModal({ isOpen, onClose, onSubmit }: NewAgentModalProps) {
  const { userData } = useAuth();
  const [step, setStep] = useState(1);
  const [emailUsername, setEmailUsername] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    role: "agent",
    title: "",
    avatarUrl: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep(1);
    setEmailUsername("");
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "agent",
      title: "",
      avatarUrl: "",
      phoneNumber: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Extract domain from the current user's email
  const domain = userData?.email?.split('@')[1] || "company.com";

  // Update email whenever username changes
  const handleEmailChange = (username: string) => {
    setEmailUsername(username);
    setFormData(prev => ({
      ...prev,
      email: username ? `${username}@${domain}` : ""
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formattedNumber
    }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!emailUsername) newErrors.email = "Email is required";
      else if (!/^[a-zA-Z0-9._%+-]+$/.test(emailUsername))
        newErrors.email = "Please enter a valid email username";
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
    }
    if (step === 2) {
      if (!formData.role) newErrors.role = "Role is required";
      if (!formData.title) newErrors.title = "Title is required";
      if (
        formData.phoneNumber &&
        !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phoneNumber)
      )
        newErrors.phoneNumber = "Please enter a valid phone number in format (XXX) XXX-XXXX";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };
  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Agent
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{
              width: `${(step / 2) * 100}%`,
            }}
          />
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 ? (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative flex">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={emailUsername}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-l-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="username"
                      />
                    </div>
                    <div className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400">
                      @{domain}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        placeholder="John"
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
                        placeholder="Doe"
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
              </div>
            </>
          ) : (
            <>
              {/* Role and Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                      placeholder="Senior Support Agent"
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={step === 1 ? handleNext : handleSubmit}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {step === 1 ? (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            ) : (
              "Create Agent"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
