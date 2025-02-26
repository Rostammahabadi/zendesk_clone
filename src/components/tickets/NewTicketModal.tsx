import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { TicketStatus, TicketPriority, TicketTopic, TicketType } from "../../types/ticket";
import { Dialog } from "@headlessui/react";
import { RichTextEditor } from "../ui/RichTextEditor";
import { useCreateTicket } from "../../hooks/queries/useTickets";
import { useAgents } from "../../hooks/queries/useUsers";
import { User } from "../../types/user";

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const statusOptions: TicketStatus[] = ['open', 'pending', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high'];
const topicOptions: TicketTopic[] = ['support', 'billing', 'technical'];
const typeOptions: TicketType[] = ['question', 'problem', 'feature_request'];

export function NewTicketModal({ isOpen, onClose, initialCustomer }: NewTicketModalProps) {
  const { userData } = useAuth();
  const isAgent = userData?.role === 'agent' || userData?.role === 'admin';
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "open" as TicketStatus,
    priority: "medium" as TicketPriority,
    topic: "support" as TicketTopic,
    type: "question" as TicketType,
    assigned_to: isAgent ? userData?.id : null as string | null,
    company_id: userData?.company_id || null,
    created_by: isAgent ? (initialCustomer?.id || null) : userData?.id,
  });

  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createTicket({
      ...formData,
      status: isAgent ? formData.status : 'open',
      assigned_to: isAgent ? formData.assigned_to : null,
      created_by: formData.created_by ? { id: formData.created_by } as User : undefined
    }, {
      onSuccess: () => {
        toast.success("Ticket created successfully");
        setFormData({
          subject: "",
          description: "",
          status: "open" as TicketStatus,
          priority: "medium" as TicketPriority,
          topic: "support" as TicketTopic,
          type: "question" as TicketType,
          assigned_to: isAgent ? userData?.id : null,
          company_id: userData?.company_id || null,
          created_by: isAgent ? (initialCustomer?.id || null) : userData?.id,
        });
        onClose();
      },
      onError: (error) => {
        console.error("Error creating ticket:", error);
        toast.error("Failed to create ticket");
      }
    });
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
            <div className={`grid ${isAgent ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
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
              {isAgent && (
                <>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign To
                    </label>
                    <select
                      value={formData.assigned_to || ''}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value || null })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100"
                      disabled={isLoadingAgents}
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
