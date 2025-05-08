import { Mail, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface TeamMemberProps {
  member: {
    id: number;
    name: string;
    title: string;
    department: string;
    profileImage: string;
    skills: string[];
  };
}

const TeamCard: React.FC<TeamMemberProps> = ({ member }) => {
  const { toast } = useToast();
  
  const handleContactClick = (type: string) => {
    toast({
      title: `Contact ${member.name}`,
      description: `${type} feature is not implemented in this demo`,
    });
  };
  
  const handleViewProfile = () => {
    toast({
      title: "View Profile",
      description: `${member.name}'s profile page is not implemented in this demo`,
    });
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <Avatar className="w-16 h-16 rounded-full object-cover border-2 border-white shadow">
          <AvatarImage src={member.profileImage} alt={member.name} />
          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h3 className="font-medium text-gray-800">{member.name}</h3>
          <p className="text-sm text-gray-600">{member.title}</p>
          <div className="flex items-center mt-2 flex-wrap gap-1">
            {member.skills.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-primary transition-colors p-1"
            onClick={() => handleContactClick("Email")}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-primary transition-colors p-1"
            onClick={() => handleContactClick("Phone")}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-primary transition-colors p-1"
            onClick={() => handleContactClick("Video call")}
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="link" 
          className="text-primary hover:text-blue-600 text-sm font-medium"
          onClick={handleViewProfile}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default TeamCard;
