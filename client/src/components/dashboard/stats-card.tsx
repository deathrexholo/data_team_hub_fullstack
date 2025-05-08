import { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  timePeriod?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  timePeriod = "vs. last month",
  icon,
  iconBgColor,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <span className={cn(`text-${iconColor} bg-${iconBgColor} rounded-full w-8 h-8 flex items-center justify-center`)}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {change && (
          <p className={cn(
            "ml-2 text-sm font-medium",
            change.trend === "up" ? "text-green-600" : "text-red-600"
          )}>
            {change.trend === "up" ? (
              <ArrowUpIcon className="inline text-xs mr-1" size={12} />
            ) : (
              <ArrowDownIcon className="inline text-xs mr-1" size={12} />
            )}
            <span>{change.value}%</span>
          </p>
        )}
      </div>
      {timePeriod && <p className="text-xs text-gray-500 mt-1">{timePeriod}</p>}
    </div>
  );
};

export default StatsCard;
