import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "../App";
import PostForm from "@/components/feed/post-form";
import PostCard from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeedProps {
  user: User;
}

const Feed: React.FC<FeedProps> = ({ user }) => {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  // Fetch posts data
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    select: (data) => {
      let filteredData = [...data];
      
      // Apply category filtering if not "all"
      if (category !== "all") {
        // This is a mock filter based on post content since there's no category field
        // In a real app, you would filter based on the actual category field
        filteredData = filteredData.filter(post => {
          const content = post.content.toLowerCase();
          if (category === "announcements") return content.includes("announced") || content.includes("update");
          if (category === "project-updates") return content.includes("project") || content.includes("pipeline");
          if (category === "general") return !content.includes("project") && !content.includes("announced");
          return true;
        });
      }
      
      // Apply sorting
      if (sortBy === "recent") {
        filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === "popular") {
        filteredData.sort((a, b) => b.likesCount - a.likesCount);
      } else if (sortBy === "discussed") {
        filteredData.sort((a, b) => b.commentsCount - a.commentsCount);
      }
      
      return filteredData;
    }
  });
  
  // Fetch user data for the Active Team Members sidebar
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['/api/users'],
    select: (data) => data.filter((user: User) => user.id !== user.id).slice(0, 4)
  });
  
  // Mock trending topics for the sidebar
  const trendingTopics = [
    { tag: "DataPipeline", count: 12 },
    { tag: "MachineLearning", count: 8 },
    { tag: "Q1Results", count: 7 },
    { tag: "TeamBuilding", count: 5 },
    { tag: "ClientReporting", count: 4 }
  ];
  
  // Mock upcoming events for the sidebar
  const upcomingEvents = [
    {
      id: 1,
      title: "Team Weekly Sync",
      time: "Today, 4:00 PM - 5:00 PM",
      location: "Zoom Meeting",
      icon: "users",
      color: "blue"
    },
    {
      id: 2,
      title: "Client Strategy Meeting",
      time: "Tomorrow, 12:00 PM - 1:00 PM",
      location: "Conference Room A",
      icon: "user-tie",
      color: "yellow"
    },
    {
      id: 3,
      title: "Data Science Workshop",
      time: "Friday, 2:00 PM - 5:00 PM",
      location: "Training Room",
      icon: "graduation-cap",
      color: "green"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Main feed content */}
      <div className="md:col-span-8">
        {/* Create post */}
        <PostForm user={user} />
        
        {/* Feed filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Team Feed</h2>
            <div className="flex flex-col md:flex-row gap-2">
              <Select defaultValue={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="project-updates">Project Updates</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by: Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Sort by: Recent</SelectItem>
                  <SelectItem value="popular">Sort by: Popular</SelectItem>
                  <SelectItem value="discussed">Sort by: Most Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Feed posts */}
        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="ml-3 flex-1">
                    <div className="w-40 h-4 bg-gray-200 animate-pulse mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 animate-pulse"></div>
                    <div className="mt-3">
                      <div className="w-full h-4 bg-gray-200 animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-gray-200 animate-pulse mt-2"></div>
                    </div>
                    <div className="mt-3 w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} currentUser={user} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">No posts found. Be the first to share something!</p>
            </div>
          )}
          
          {posts.length > 0 && (
            <div className="text-center py-6">
              <Button variant="outline" className="px-6 py-3">
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Feed sidebar */}
      <div className="md:col-span-4">
        {/* Trending topics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trending Topics</h2>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <a key={index} href="#" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <span className="text-sm font-medium text-gray-800 block">#{topic.tag}</span>
                <span className="text-xs text-gray-500">{topic.count} posts this week</span>
              </a>
            ))}
          </div>
        </div>
        
        {/* Active users */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Team Members</h2>
          <div className="space-y-3">
            {teamMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profileImage} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.title}</p>
                  </div>
                </div>
                <Button variant="link" className="text-primary hover:text-blue-600 text-sm">
                  Message
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className={`w-10 h-10 bg-${event.color}-100 rounded-lg flex items-center justify-center text-${event.color}-600`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="ml-3 font-medium text-gray-800">{event.title}</h3>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar mr-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
