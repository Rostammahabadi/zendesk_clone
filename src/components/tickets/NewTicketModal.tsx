import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { ticketService } from "../../services/ticketService";
import { TicketStatus, TicketPriority, TicketTopic, TicketType } from "../../types/ticket";

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions: TicketStatus[] = ['open', 'pending', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high'];
const topicOptions: TicketTopic[] = ['support', 'billing', 'technical'];
const typeOptions: TicketType[] = ['question', 'problem', 'feature_request'];

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "open" as TicketStatus,
    priority: "medium" as TicketPriority,
    topic: "support" as TicketTopic,
    type: "question" as TicketType,
    assigned_to: null as string | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchAgents();
    }
  }, [isOpen, user?.id]);

  const fetchAgents = async () => {
    try {
      const { data: currentUser } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (currentUser) {
        const agentsData = await ticketService.fetchAgents(currentUser.company_id);
        setAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    }
  };

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        setIsLoading(true);
        const { data: currentUser } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!currentUser) throw new Error("User not found");

        await ticketService.createTicket({
          ...formData,
          created_by: user?.id,
          company_id: currentUser.company_id,
        });

        toast.success("Ticket created successfully!");
        onClose();
      } catch (error: any) {
        console.error('Error creating ticket:', error);
        toast.error(error.message || "Failed to create ticket");
      } finally {
        setIsLoading(false);
      }
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
                    <select
                      value={formData.assigned_to || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assigned_to: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as TicketStatus,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
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
                          priority: e.target.value as TicketPriority,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          topic: e.target.value as TicketTopic,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {topicOptions.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic.charAt(0).toUpperCase() + topic.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as TicketType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {typeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
              disabled={isLoading}
              className={`flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
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
