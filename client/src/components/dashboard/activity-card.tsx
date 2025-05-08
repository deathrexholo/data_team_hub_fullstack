import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: number;
  user: {
    id: number;
    name: string;
    profileImage: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

interface ActivityCardProps {
  activities: ActivityItem[];
  title?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activities, title = "Recent Activity" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.profileImage} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{activity.user.name}</span> {activity.action} {activity.target}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
        )}
      </div>
      <a href="#" className="block text-primary hover:text-blue-600 text-sm font-medium mt-4 text-center">
        View All Activity
      </a>
    </div>
  );
};

export default ActivityCard;
