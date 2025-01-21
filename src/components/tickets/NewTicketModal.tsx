import { useState } from "react";
import { X, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
];
const statusOptions = ["Open", "Pending", "In Progress", "Resolved"];
const priorityOptions = ["Low", "Medium", "High", "Urgent"];
export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "Open",
    priority: "Medium",
    assignee: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.subject.trim()) {
        newErrors.subject = "Subject is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }
    }
    if (step === 2) {
      if (!formData.assignee) {
        newErrors.assignee = "Please select an assignee";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };
  const handleSubmit = () => {
    if (validateStep()) {
      // Handle ticket creation here
      console.log("Submit ticket:", formData);
      onClose();
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Create New Ticket</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-500 h-2 transition-all duration-300"
              style={{
                width: `${(step / 2) * 100}%`,
              }}
            />
          </div>
          {/* Content */}
          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter ticket subject"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Describe the issue"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            assignee: user.id,
                          })
                        }
                        className={`p-3 border rounded-lg cursor-pointer flex items-center space-x-3 ${formData.assignee === user.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.assignee && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.assignee}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={step === 1 ? handleNext : handleSubmit}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {step === 1 ? (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              ) : (
                "Create Ticket"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
