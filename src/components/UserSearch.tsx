import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { useCustomers } from "../hooks/queries/useCustomers";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number?: string;
  role: string;
}
interface UserSearchProps {
  onUserSelect: (user: User) => void;
  onCreateNewUser: () => void;
}
export function UserSearch({ onUserSelect, onCreateNewUser }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users = [] } = useCustomers();
  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm),
  );
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Ticket</h1>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <button
          onClick={onCreateNewUser}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <span className="text-blue-500">Create New User</span>
          </div>
        </button>
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="font-medium">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <div className="text-sm text-gray-500">{user.phone_number}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
