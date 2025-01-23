import {
  Loader2,
  Users,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NewTicketModal } from "../tickets/NewTicketModal";
import { NewCustomerModal } from "../signup/NewCustomerModal";
import { toast } from "sonner";
import { Agent } from "../../types/user";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "../../lib/supabaseClient";

export function AdminHomePage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const monthlyTickets = [
    {
      name: "Jan",
      tickets: 65,
    },
    {
      name: "Feb",
      tickets: 59,
    },
    {
      name: "Mar",
      tickets: 80,
    },
    {
      name: "Apr",
      tickets: 81,
    },
    {
      name: "May",
      tickets: 56,
    },
    {
      name: "Jun",
      tickets: 95,
    },
  ];
  const categoryData = [
    {
      name: "Technical",
      value: 35,
    },
    {
      name: "Billing",
      value: 25,
    },
    {
      name: "Account",
      value: 20,
    },
    {
      name: "Feature",
      value: 15,
    },
    {
      name: "Other",
      value: 5,
    },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const teamMetrics = [
    {
      label: "Total Active Tickets",
      value: "47",
      change: "+12%",
      isPositive: true,
      icon: Activity,
    },
    {
      label: "Avg Response Time",
      value: "11 min",
      change: "-8%",
      isPositive: true,
      icon: Clock,
    },
    {
      label: "Resolution Rate",
      value: "94%",
      change: "+5%",
      isPositive: true,
      icon: CheckCircle,
    },
    {
      label: "Active Agents",
      value: "18",
      change: "+2",
      isPositive: true,
      icon: Users,
    },
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data: agentsData, error } = await supabase
          .from('users')
          .select(`
          *,
          user_skills (
            id,
            proficiency,
            skills (
              id,
              name
            )
          )
        `)
          .eq('role', 'agent');

        if (error) throw error;

        // Transform the data and add UI-specific fields
        const formattedAgents = agentsData.map(agent => ({
          id: agent.id,
          email: agent.email,
          first_name: agent.first_name,
          last_name: agent.last_name,
          role: agent.role,
          company_id: agent.company_id,
          status: ['Online', 'Busy', 'Away'][Math.floor(Math.random() * 3)] as 'Online' | 'Busy' | 'Away',
          activeTickets: Math.floor(Math.random() * 10),
          resolvedToday: Math.floor(Math.random() * 20),
          responseTime: `${Math.floor(Math.random() * 30 + 5)}m`
        }));

        setAgents(formattedAgents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error('Failed to load agents');
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Dashboard ({agents.length} Agents)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Tickets</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">124</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Open Tickets</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">45</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pending Tickets</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">28</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Resolved Today</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">51</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <metric.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span
                  className={`text-sm ${metric.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold dark:text-white">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Ticket Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Ticket Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTickets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    style={{
                      fill: "rgb(107 114 128)",
                    }}
                  />
                  <YAxis
                    style={{
                      fill: "rgb(107 114 128)",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#0088FE"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Ticket Categories
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
