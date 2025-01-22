import {
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NewTicketModal } from "../tickets/NewTicketModal";
import { NewCustomerModal } from "../signup/NewCustomerModal";
import { toast } from "sonner";
import { Agent } from "../../types/user";
import { supabase } from "../../lib/supabaseClient";

export function AdminHomePage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data: agentsData, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, company_id')
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Agent Status</h3>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.email)}&background=random`}
                        alt={agent.email}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-700
                        ${agent.status === 'Online' ? 'bg-green-400' : 
                          agent.status === 'Busy' ? 'bg-red-400' : 'bg-yellow-400'}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{agent.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.activeTickets} active tickets • {agent.resolvedToday} resolved today
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.responseTime}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Response</p>
                  </div>
                </div>
              ))}
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
