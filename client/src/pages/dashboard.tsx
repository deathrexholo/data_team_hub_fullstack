import { useQuery } from "@tanstack/react-query";
import { User, CalendarDays, BarChart2, Users, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityCard from "@/components/dashboard/activity-card";
import MeetingCard from "@/components/meetings/meeting-card";
import PostCard from "@/components/feed/post-card";

interface DashboardProps {
  user: {
    id: number;
    name: string;
    email: string;
    profileImage: string;
    title: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  // Fetch data for the dashboard
  const { data: meetings = [] } = useQuery({
    queryKey: [`/api/users/${user.id}/meetings`],
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Mock activity data - in a real app, this would come from the API
  const recentActivities = [
    {
      id: 1,
      user: {
        id: 2,
        name: "Mike Johnson",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40"
      },
      action: "added a comment to the",
      target: "Data Pipeline project",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString() // 10 minutes ago
    },
    {
      id: 2,
      user: {
        id: 3,
        name: "Sarah Williams",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&h=40"
      },
      action: "shared a new",
      target: "dashboard",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString() // 45 minutes ago
    },
    {
      id: 3,
      user: {
        id: 4,
        name: "David Lee",
        profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=40&h=40"
      },
      action: "created a new meeting:",
      target: "Q2 Data Review",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString() // 1 hour ago
    },
    {
      id: 4,
      user: {
        id: 1,
        name: user.name,
        profileImage: user.profileImage
      },
      action: "uploaded a new",
      target: "report",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString() // 2 hours ago
    }
  ];

  // Performance stats for the Team Performance card
  const performanceStats = [
    { project: "Data Pipeline Project", progress: 75 },
    { project: "Client Reporting", progress: 90 },
    { project: "Dashboard Development", progress: 40 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Welcome section */}
      <div className="md:col-span-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&h=100"
              alt="Team workspace"
              className="w-24 h-24 rounded-lg shadow-sm object-cover"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="text-gray-600 mt-1">
                You have {meetings.length} upcoming meetings and 3 unread notifications today.
              </p>
              <div className="mt-4 flex space-x-3">
                <Link href="/meetings">
                  <Button className="bg-primary hover:bg-blue-600 text-white shadow-sm">
                    View Schedule
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="outline">Check Feed</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Today's Meetings</h2>
            <Link href="/meetings">
              <Button variant="link" className="text-primary hover:text-blue-600 text-sm font-medium">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {meetings.length > 0 ? (
              meetings
                .filter((meeting: any) => {
                  const meetingDate = new Date(meeting.date);
                  const today = new Date();
                  return (
                    meetingDate.getDate() === today.getDate() &&
                    meetingDate.getMonth() === today.getMonth() &&
                    meetingDate.getFullYear() === today.getFullYear()
                  );
                })
                .slice(0, 3)
                .map((meeting: any) => (
                  <MeetingCard 
                    key={meeting.id} 
                    meeting={meeting} 
                    userId={user.id} 
                    variant="compact"
                  />
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">No meetings scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="md:col-span-4">
        <ActivityCard activities={recentActivities} />

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Performance</h2>
          <div className="space-y-4">
            {performanceStats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{stat.project}</span>
                  <span className="text-sm font-medium text-gray-700">{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${
                      index === 0
                        ? "bg-primary"
                        : index === 1
                        ? "bg-green-500"
                        : "bg-purple-500"
                    } h-2 rounded-full`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="md:col-span-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Upcoming Meetings"
            value={meetings.length}
            change={{ value: 2, trend: "up" }}
            timePeriod="vs. last week"
            icon={<CalendarDays className="h-5 w-5" />}
            iconBgColor="blue-100"
            iconColor="primary"
          />
          <StatsCard
            title="Team Members"
            value={16}
            icon={<Users className="h-5 w-5" />}
            iconBgColor="green-100"
            iconColor="green-600"
          />
          <StatsCard
            title="Social Posts"
            value={24}
            change={{ value: 5, trend: "up" }}
            timePeriod="vs. last week"
            icon={<MessageSquare className="h-5 w-5" />}
            iconBgColor="purple-100"
            iconColor="purple-600"
          />
          <StatsCard
            title="Data Reports"
            value={8}
            change={{ value: 10, trend: "down" }}
            timePeriod="vs. last month"
            icon={<BarChart2 className="h-5 w-5" />}
            iconBgColor="amber-100"
            iconColor="amber-600"
          />
        </div>
      </div>

      {/* Recent posts */}
      <div className="md:col-span-12">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Posts</h2>
            <Link href="/feed">
              <Button variant="link" className="text-primary hover:text-blue-600 text-sm font-medium">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post: any) => (
              <div key={post.id} className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium text-gray-800">
                    {post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content}
                  </h3>
                  <div className="flex items-center mt-4">
                    <img
                      src={post.author.profileImage}
                      alt="Post author"
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-700">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
