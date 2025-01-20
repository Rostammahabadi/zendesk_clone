import {
  BarChart2,
  Users,
  Clock,
  ThumbsUp,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { StatsCard } from "./StatsCard";
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
export function AnalyticsDashboard() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Analytics Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tickets"
            value="436"
            change="+12.5%"
            isPositive={true}
            icon={BarChart2}
          />
          <StatsCard
            title="Active Customers"
            value="1,257"
            change="+3.2%"
            isPositive={true}
            icon={Users}
          />
          <StatsCard
            title="Avg. Response Time"
            value="2.4h"
            change="-15.3%"
            isPositive={true}
            icon={Clock}
          />
          <StatsCard
            title="Customer Satisfaction"
            value="94%"
            change="+2.1%"
            isPositive={true}
            icon={ThumbsUp}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Ticket Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTickets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
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
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Ticket Categories</h3>
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
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
