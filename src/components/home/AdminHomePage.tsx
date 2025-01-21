import {
  Users,
  Plus,
  UserPlus,
  Activity,
  PhoneCall,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NewTicketModal } from "../tickets/NewTicketModal";
import { NewCustomerModal } from "../signup/NewCustomerModal";
import { toast } from "sonner";
import { Agent } from "../../types/user";
import { userService } from "../../services/userService";

const teamMetrics = [
  {
    label: "Total Active Tickets",
    value: "47",
    change: "+12%",
    icon: Activity,
  },
  {
    label: "Avg Response Time",
    value: "11 min",
    change: "-8%",
    icon: Clock,
  },
  {
    label: "Resolution Rate",
    value: "94%",
    change: "+5%",
    icon: CheckCircle,
  },
  {
    label: "Waiting Customers",
    value: "23",
    change: "+15%",
    icon: PhoneCall,
  },
];

export function AdminHomePage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const agents = await userService.fetchAgents();


        // Transform the data to include the UI-specific fields
        const agentsWithStatus = agents.map(agent => ({
          ...agent,
          status: Math.random() > 0.5 ? "Online" : Math.random() > 0.5 ? "Busy" : "Away",
          activeTickets: Math.floor(Math.random() * 10),
          resolvedToday: Math.floor(Math.random() * 20),
          responseTime: `${Math.floor(Math.random() * 15 + 5)} min`,
        })) as Agent[];

        setAgents(agentsWithStatus);
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-[#1D364D] text-white rounded-lg p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">
              Managing {agents.length} agents · 0 active tickets · 0 customers waiting
            </p>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setIsNewTicketModalOpen(true)}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
          >
            <div className="bg-blue-500 p-3 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">New Ticket</div>
              <div className="text-sm text-gray-500">Create support ticket</div>
            </div>
          </button>
          <button 
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
          >
            <div className="bg-green-500 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">New Customer</div>
              <div className="text-sm text-gray-500">Add customer account</div>
            </div>
          </button>
          <button className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Manage Agents</div>
              <div className="text-sm text-gray-500">View all agents</div>
            </div>
          </button>
        </div>
        {/* Team Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <metric.icon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-green-600">{metric.change}</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Agent Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Agent Overview</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading agents...</div>
            ) : agents.map((agent) => (
              <div key={agent.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.email}`}
                      alt={`${agent.first_name} ${agent.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{`${agent.first_name} ${agent.last_name}`}</div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            agent.status === "Online"
                              ? "bg-green-500"
                              : agent.status === "Busy"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <span className="text-gray-500">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div>
                      <div className="font-medium text-gray-900">
                        {agent.activeTickets}
                      </div>
                      <div>Active</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {agent.resolvedToday}
                      </div>
                      <div>Resolved</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {agent.responseTime}
                      </div>
                      <div>Avg. Response</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NewTicketModal 
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />
    </div>
  );
}
