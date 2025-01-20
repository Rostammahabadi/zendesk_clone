import { LucideIcon } from "lucide-react";
interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
}
export function StatsCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
        </div>
        <div
          className={`p-3 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}
        >
          <Icon
            className={`w-6 h-6 ${isPositive ? "text-green-600" : "text-red-600"}`}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span
          className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last month</span>
      </div>
    </div>
  );
}
