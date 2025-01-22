import {
  Mail,
  MessageSquare,
  MoreVertical,
  Plus,
} from "lucide-react";
import { AgentDetailsPanel } from "./AgentDetailPanel";
import { useAgents, useAgent } from "../../hooks/queries/useAgents";
import { useState } from "react";

export function AgentsPage() {
  const { data: agents = [] } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { data: selectedAgent } = useAgent(selectedAgentId || "");

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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedAgentId(agent.id)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Agent Info */}
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {agent?.first_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                        ${agent.status === "Online" ? "bg-green-500" : agent.status === "Busy" ? "bg-yellow-500" : "bg-gray-500"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {agent?.first_name} {agent?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent?.title}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {agent?.email}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {agent.title}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Metrics */}
                {/* <div className="flex flex-wrap gap-4 lg:gap-6">
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
                </div> */}
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
      
      <AgentDetailsPanel
        agent={selectedAgent}
        isOpen={!!selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
      />
    </div>
  );
}
