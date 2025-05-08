import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "../../App";

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onToggle }) => {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Meetings", icon: Calendar, path: "/meetings" },
    { label: "Team", icon: Users, path: "/team" },
    { label: "Social Feed", icon: MessageSquare, path: "/feed" },
    { label: "Analytics", icon: BarChart, path: "/analytics" },
    { label: "Settings", icon: Settings, path: "/settings" }
  ];

  return (
    <div 
      className={cn(
        "bg-white shadow-lg h-screen transition-all duration-300 z-20 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=48&h=48"
            alt="TeamSync Logo" 
            className="h-10 w-10 rounded-md shadow-sm"
          />
          {isOpen && (
            <h1 className="ml-3 text-xl font-semibold text-gray-800 transition-opacity duration-300">
              TeamSync
            </h1>
          )}
        </div>
        <button 
          onClick={onToggle} 
          className="text-gray-500 hover:text-primary transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors duration-200",
                  location === item.path 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                {isOpen && (
                  <span className="ml-3 transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t">
        <Link href="/profile">
          <a className="w-full flex items-center text-left rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
            <img 
              src={user.profileImage}
              alt="User Profile" 
              className="h-8 w-8 rounded-full border-2 border-gray-200"
            />
            {isOpen && (
              <div className="ml-3 transition-opacity duration-300">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.title}</p>
              </div>
            )}
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
