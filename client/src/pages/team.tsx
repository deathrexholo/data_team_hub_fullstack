import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TeamCard from "@/components/team/team-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface TeamProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Team: React.FC<TeamProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Filter team members based on search term
  const filteredMembers = teamMembers.filter((member: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.title?.toLowerCase().includes(searchLower) ||
      member.department?.toLowerCase().includes(searchLower) ||
      (member.skills && member.skills.some((skill: string) => skill.toLowerCase().includes(searchLower)))
    );
  });
  
  const handleAddMember = () => {
    toast({
      title: "Feature not implemented",
      description: "Adding team members is not available in this demo",
    });
  };
  
  // Sample projects data
  const projects = [
    {
      id: 1,
      name: "Data Pipeline Redesign",
      description: "Modernizing ETL processes",
      lead: {
        id: 4,
        name: "Mike J.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32"
      },
      team: [
        { id: 4, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32" },
        { id: 2, image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32" },
        { id: 5, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=32&h=32" }
      ],
      additionalMembers: 2,
      status: "On Track",
      timeline: "May - July 2023",
      progress: 45
    },
    {
      id: 2,
      name: "Client Reporting Dashboard",
      description: "Automated client KPI reporting",
      lead: {
        id: 5,
        name: "Emily T.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=32&h=32"
      },
      team: [
        { id: 5, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=32&h=32" },
        { id: 3, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32" },
        { id: 6, image: "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?auto=format&fit=crop&w=32&h=32" }
      ],
      additionalMembers: 0,
      status: "At Risk",
      timeline: "Apr - June 2023",
      progress: 30
    },
    {
      id: 3,
      name: "Predictive Analytics Model",
      description: "Sales prediction using ML",
      lead: {
        id: 2,
        name: "David L.",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32"
      },
      team: [
        { id: 2, image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32" },
        { id: 3, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32" }
      ],
      additionalMembers: 0,
      status: "In Progress",
      timeline: "Mar - Aug 2023",
      progress: 60
    },
    {
      id: 4,
      name: "Data Quality Framework",
      description: "Standardizing data quality processes",
      lead: {
        id: 1,
        name: "Sophia C.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=32&h=32"
      },
      team: [
        { id: 1, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=32&h=32" },
        { id: 4, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32" },
        { id: 3, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32" },
        { id: 2, image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32" }
      ],
      additionalMembers: 0,
      status: "Just Started",
      timeline: "May - Oct 2023",
      progress: 15
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track": return "bg-green-100 text-green-800";
      case "At Risk": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Just Started": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getProgressColor = (status: string) => {
    switch (status) {
      case "On Track": return "bg-green-500";
      case "At Risk": return "bg-yellow-500";
      case "In Progress": return "bg-blue-500";
      case "Just Started": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <div>
      {/* Team Directory */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Team Directory</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search team members..."
                className="w-full md:w-64 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={handleAddMember}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMembers.map((member: any) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No team members found matching "{searchTerm}"</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
      
      {/* Team projects */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Projects</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 text-sm">
                <th className="py-3 px-4 font-medium">Project Name</th>
                <th className="py-3 px-4 font-medium">Lead</th>
                <th className="py-3 px-4 font-medium">Team</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Timeline</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={project.lead.image} alt={project.lead.name} />
                        <AvatarFallback>{project.lead.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm text-gray-700">{project.lead.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex -space-x-2">
                      {project.team.map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={member.image} alt="Team member" />
                          <AvatarFallback>TM</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.additionalMembers > 0 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-500">
                          +{project.additionalMembers}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-700">{project.timeline}</div>
                    <div className="w-40 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`${getProgressColor(project.status)} h-2 rounded-full`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;
