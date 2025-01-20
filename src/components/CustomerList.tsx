import { Mail, Tag, MoreVertical } from "lucide-react";
const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    tickets: 3,
    lastActive: "2 hours ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    status: "Inactive",
    tickets: 1,
    lastActive: "5 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@example.com",
    phone: "+1 (555) 456-7890",
    status: "Active",
    tickets: 5,
    lastActive: "1 hour ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
];
export function CustomerList() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customers</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Add Customer
          </button>
        </div>
        <div className="hidden md:block bg-white rounded-lg shadow">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Tickets</div>
            <div className="col-span-3">Last Active</div>
            <div className="col-span-1"></div>
          </div>
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 items-center"
            >
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <Mail className="w-3 h-3" />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${customer.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{customer.tickets} tickets</span>
                </div>
              </div>
              <div className="col-span-3 text-gray-500">
                {customer.lastActive}
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {customer.email}
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${customer.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {customer.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tickets</span>
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span>{customer.tickets} tickets</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Active</span>
                  <span className="text-sm">{customer.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
