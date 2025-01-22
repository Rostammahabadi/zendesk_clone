import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { ticketService } from "../../services/ticketService";
import { TicketStatus, TicketPriority, TicketTopic, TicketType } from "../../types/ticket";
import { Dialog } from "@headlessui/react";
import { RichTextEditor } from "../ui/RichTextEditor";

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions: TicketStatus[] = ['open', 'pending', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high'];
const topicOptions: TicketTopic[] = ['support', 'billing', 'technical'];
const typeOptions: TicketType[] = ['question', 'problem', 'feature_request'];

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const { user, userData } = useAuth();
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
      if (userData) {
        const agentsData = await ticketService.fetchAgents(userData.company_id);
        setAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    debugger;
    try {
      await ticketService.createTicket({
        subject: formData.subject,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        topic: formData.topic,
        type: formData.type,
        assigned_to: formData.assigned_to,
        created_by: user.id,
        company_id: userData?.company_id
      });
      
      toast.success("Ticket created successfully");
      setFormData({
        subject: "",
        description: "",
        status: "open" as TicketStatus,
        priority: "medium" as TicketPriority,
        topic: "support" as TicketTopic,
        type: "question" as TicketType,
        assigned_to: null,
      });
      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create New Ticket
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <RichTextEditor
                initialContent={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Describe your issue..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value as TicketTopic })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
