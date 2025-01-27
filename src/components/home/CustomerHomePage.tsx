import {
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTicketStats } from "../../hooks/queries/useTicketStats";
import { useState } from "react";
import ChatBot from "../homepage/ChatBot";

type TimeFrame = '1m' | '3m' | '6m';

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}

const timeFrameOptions: TimeFrameOption[] = [
  { value: '1m', label: 'Last Month' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
];

const recentActivity = [
  {
    id: 1,
    type: "update",
    title: "Ticket #1234 Updated",
    description: "Agent John responded to your ticket",
    time: "10 minutes ago",
    icon: MessageSquare,
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: 2,
    type: "resolved",
    title: "Ticket #1230 Resolved",
    description: "Your issue has been resolved",
    time: "1 hour ago",
    icon: CheckCircle,
    iconColor: "text-green-500 dark:text-green-400",
  },
  {
    id: 3,
    type: "pending",
    title: "Awaiting Your Response",
    description: "Ticket #1235 needs your input",
    time: "2 hours ago",
    icon: Clock,
    iconColor: "text-yellow-500 dark:text-yellow-400",
  },
];

export function CustomerHomePage() {
  const { userData } = useAuth();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1m');
  const { data: stats, isLoading } = useTicketStats();
  const supportResources = [
    {
      title: "Knowledge Base",
      description: "Find answers to common questions",
      icon: HelpCircle,
      link: `/${userData?.role}/dashboard/knowledgebase`,
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: AlertCircle,
      link: "/contact",
    },
  ];
  const ticketStats = [
    {
      label: "Open Tickets",
      count: stats?.open ?? 0,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Resolved Today",
      count: stats?.resolvedToday ?? 0,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Pending Responses",
      count: stats?.pending ?? 0,
      color: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];
  
  if (!userData) return null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {userData.first_name || userData.email}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's an overview of your support tickets and recent activity
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedTimeFrame}
                onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeFrameOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ticketStats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-6 ${isLoading ? 'animate-pulse' : ''}`}
            >
              <div className={`text-3xl font-bold ${stat.color}`}>
                {isLoading ? '-' : stat.count}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-start">
                      <div className={`${activity.iconColor} mt-1`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.title}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Support Resources */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Support Resources
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {supportResources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <resource.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {resource.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.description}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400 dark:text-gray-500" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}
