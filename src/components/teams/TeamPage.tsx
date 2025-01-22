import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { teamService } from "../../services/teamService";
import {
  Users,
  Plus,
  UserPlus,
  BarChart2,
  MoreVertical,
  MessageSquare,
  Clock,
} from "lucide-react";
import { TeamUserGroup } from "../../types/team";
import { NewTeamModal } from "./NewTeamModal";

const teams = [
  {
    id: 1,
    name: "Technical Support",
    lead: {
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    metrics: {
      activeTickets: 24,
      avgResponseTime: "8m",
      resolutionRate: "94%",
    },
    members: [
      {
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        role: "Team Lead",
      },
      {
        name: "Sarah Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        role: "Senior Agent",
      },
      {
        name: "Mike Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        role: "Support Agent",
      },
    ],
  },
  {
    id: 2,
    name: "Billing Support",
    lead: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    metrics: {
      activeTickets: 15,
      avgResponseTime: "12m",
      resolutionRate: "91%",
    },
    members: [
      {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
        role: "Team Lead",
      },
      {
        name: "Alex Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        role: "Support Agent",
      },
    ],
  },
  {
    id: 3,
    name: "Customer Success",
    lead: {
      name: "Emily Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
    metrics: {
      activeTickets: 18,
      avgResponseTime: "10m",
      resolutionRate: "96%",
    },
    members: [
      {
        name: "Emily Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        role: "Team Lead",
      },
      {
        name: "David Kim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        role: "Senior Agent",
      },
      {
        name: "Lisa Wang",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        role: "Support Agent",
      },
    ],
  },
];

export function TeamPage() {
  const { user, userData, isLoading } = useAuth();
  const [teamUserGroups, setTeamUserGroups] = useState<TeamUserGroup[]>([]);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      const fetchTeamUserGroups = async () => {
        const teamUserGroups = await teamService.fetchTeamUserGroups(userData.company_id);
        setTeamUserGroups(teamUserGroups);
      };

      fetchTeamUserGroups();
    }
  }, [userData]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your support teams and members
            </p>
          </div>
          <button 
            onClick={() => setIsNewTeamModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Team
          </button>
        </div>
        <div className="grid gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <div className="p-6">
                {/* Team Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </h3>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                {/* Team Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Active Tickets</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.metrics.activeTickets}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Avg Response</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.metrics.avgResponseTime}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <BarChart2 className="w-4 h-4" />
                      <span>Resolution Rate</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {team.metrics.resolutionRate}
                    </div>
                  </div>
                </div>
                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Team Members
                    </h4>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add Member
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.members.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Team Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    View Schedule
                  </button>
                  <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Team Settings
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <NewTeamModal 
          isOpen={isNewTeamModalOpen}
          onClose={() => setIsNewTeamModalOpen(false)}
        />
      </div>
    </div>
  );
}
