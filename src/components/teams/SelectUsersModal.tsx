import { Search, X } from "lucide-react";
import { useState } from "react";
import { useCompanyUsers } from "../../hooks/queries/useUsers";

interface SelectUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUserIds: string[]) => void;
  selectedUserIds?: string[];
  title?: string;
}

export function SelectUsersModal({
  isOpen,
  onClose,
  onConfirm,
  selectedUserIds = [],
  title = "Select Users"
}: SelectUsersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedUserIds);
  const { data: users, isLoading: isLoadingUsers } = useCompanyUsers();

  const filteredUsers = users?.filter(
    (user) =>
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) ?? [];

  const toggleUser = (userId: string) => {
    setSelected(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
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

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selected.includes(user.id)
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
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 