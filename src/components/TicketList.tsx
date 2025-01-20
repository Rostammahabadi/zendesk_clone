import { Clock, Tag } from "lucide-react";
const tickets = [
  {
    id: 1,
    subject: "Can't access my account",
    customer: "John Doe",
    status: "Open",
    priority: "High",
    time: "2h ago",
  },
  {
    id: 2,
    subject: "Payment failed",
    customer: "Jane Smith",
    status: "Pending",
    priority: "Medium",
    time: "4h ago",
  },
  {
    id: 3,
    subject: "Feature request",
    customer: "Mike Johnson",
    status: "New",
    priority: "Low",
    time: "1d ago",
  },
];
export function TicketList() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All tickets</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            New Ticket
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">{ticket.customer}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${ticket.status === "Open" ? "bg-green-100 text-green-800" : ticket.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {ticket.status}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${ticket.priority === "High" ? "bg-red-100 text-red-800" : ticket.priority === "Medium" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {ticket.time}
                </div>
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Support
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
