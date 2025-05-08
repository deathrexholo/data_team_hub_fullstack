import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Search, Bell, Plus, Calendar, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "../../App";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  user: User;
}

interface Notification {
  id: number;
  type: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, onSidebarToggle, user }) => {
  const [location, setLocation] = useLocation();
  const [isOnDashboard] = useRoute("/");
  const [isOnMeetings] = useRoute("/meetings");
  const [isOnTeam] = useRoute("/team");
  const [isOnFeed] = useRoute("/feed");
  const [isOnSettings] = useRoute("/settings");
  
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/users/1/notifications'],
    select: (data) => data || []
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    if (isOnDashboard) return "Dashboard";
    if (isOnMeetings) return "Meetings";
    if (isOnTeam) return "Team Members";
    if (isOnFeed) return "Social Feed";
    if (isOnSettings) return "Settings";
    return "TeamSync";
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-64 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <a 
                        key={notification.id}
                        href="#" 
                        className="block p-4 border-b border-gray-100 hover:bg-gray-50"
                      >
                        <div className="flex">
                          <div className={`flex-shrink-0 rounded-full p-2 ${
                            notification.type === 'meeting' 
                              ? 'bg-primary bg-opacity-10' 
                              : notification.type === 'comment'
                              ? 'bg-accent bg-opacity-10'
                              : 'bg-secondary bg-opacity-10'
                          }`}>
                            {notification.type === 'meeting' && <Calendar className="h-4 w-4 text-primary" />}
                            {notification.type === 'comment' && <Link className="h-4 w-4 text-accent" />}
                            {notification.type === 'team' && <Plus className="h-4 w-4 text-secondary" />}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{notification.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <a href="#" className="text-sm text-primary hover:text-primary-dark font-medium">
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => {
              if (location === "/feed") {
                setLocation("/meetings");
              } else {
                setLocation("/feed");
              }
            }}
            className="bg-primary hover:bg-primary-dark text-white shadow-sm"
          >
            {location === "/feed" ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Switch to Calendar</span>
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
