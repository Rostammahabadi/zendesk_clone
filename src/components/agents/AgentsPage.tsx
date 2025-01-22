import {
  Mail,
  MessageSquare,
  MoreVertical,
  Plus,
} from "lucide-react";
const agents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    status: "Online",
    role: "Senior Support Agent",
    department: "Technical Support",
    metrics: {
      responseTime: "8 min",
      resolutionRate: "94%",
      satisfaction: "4.8/5",
      ticketsResolved: 145,
      activeTickets: 4,
    },
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    status: "Busy",
    role: "Support Team Lead",
    department: "Customer Success",
    metrics: {
      responseTime: "12 min",
      resolutionRate: "92%",
      satisfaction: "4.7/5",
      ticketsResolved: 132,
      activeTickets: 6,
    },
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    status: "Away",
    role: "Support Agent",
    department: "Billing Support",
    metrics: {
      responseTime: "10 min",
      resolutionRate: "88%",
      satisfaction: "4.6/5",
      ticketsResolved: 98,
      activeTickets: 2,
    },
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "Online",
    role: "Support Agent",
    department: "Technical Support",
    metrics: {
      responseTime: "15 min",
      resolutionRate: "90%",
      satisfaction: "4.5/5",
      ticketsResolved: 112,
      activeTickets: 5,
    },
  },
];
export function AgentsPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Agents
          </h1>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Agent
          </button>
        </div>
        <div className="grid gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Agent Info */}
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                        ${agent.status === "Online" ? "bg-green-500" : agent.status === "Busy" ? "bg-yellow-500" : "bg-gray-500"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent.role}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {agent.email}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {agent.department}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Metrics */}
                <div className="flex flex-wrap gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Response Time
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agent.metrics.responseTime}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Resolution Rate
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agent.metrics.resolutionRate}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Satisfaction
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agent.metrics.satisfaction}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Resolved
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agent.metrics.ticketsResolved}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Active
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {agent.metrics.activeTickets}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
