import {
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { NewTicketModal } from "../tickets/NewTicketModal";

const quickActions = [
  {
    icon: Plus,
    label: "New Ticket",
    color: "bg-blue-500",
    action: "newTicket"
  },
  {
    icon: Users,
    label: "Add Customer",
    color: "bg-green-500",
    action: "addCustomer"
  },
  {
    icon: MessageSquare,
    label: "Send Message",
    color: "bg-purple-500",
    action: "sendMessage"
  },
];
const recentActivity = [
  {
    id: 1,
    type: "ticket",
    title: "New ticket from John Doe",
    description: "Payment processing issue",
    time: "10 minutes ago",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  {
    id: 2,
    type: "response",
    title: "Response sent to Jane Smith",
    description: "Account verification completed",
    time: "1 hour ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 3,
    type: "notification",
    title: "Team meeting reminder",
    description: "Daily standup at 10:00 AM",
    time: "2 hours ago",
    icon: Bell,
    iconColor: "text-blue-500",
  },
];
const taskSummary = [
  {
    label: "Unresolved",
    count: 12,
    color: "text-red-500",
  },
  {
    label: "Overdue",
    count: 5,
    color: "text-orange-500",
  },
  {
    label: "Due Today",
    count: 8,
    color: "text-blue-500",
  },
  {
    label: "Open",
    count: 20,
    color: "text-green-500",
  },
];
export function HomePage() {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "newTicket":
        setIsNewTicketModalOpen(true);
        break;
      // Add other cases as needed
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#1D364D] text-white rounded-lg p-8 mb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-gray-300 mb-6">
              Here's what's happening with your support team today.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {taskSummary.map((task) => (
                <div key={task.label} className="bg-white/10 rounded-lg p-4">
                  <div className={`text-2xl font-bold ${task.color}`}>
                    {task.count}
                  </div>
                  <div className="text-gray-300 text-sm">{task.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="ml-4 font-medium">{action.label}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className={`${activity.iconColor} mt-1`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">
                            {activity.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Your Tasks</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium">Follow up</div>
                        <div className="text-xs text-gray-500">
                          Due in 30 minutes
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      High
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium">
                          Review tickets
                        </div>
                        <div className="text-xs text-gray-500">Due today</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Normal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewTicketModal 
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
    </div>
  );
}
