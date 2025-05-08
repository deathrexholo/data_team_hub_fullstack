import { useState } from "react";
import { Edit, Trash2, Users, MapPin, Clock } from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MeetingForm from "@/components/ui/meeting-form";

interface MeetingCardProps {
  meeting: {
    id: number;
    title: string;
    description: string;
    date: string;
    duration: number;
    location: string;
    createdBy: number;
  };
  participants?: Array<{
    id: number;
    userId: number;
    meetingId: number;
    status: string;
    user?: {
      id: number;
      name: string;
      profileImage: string;
    };
  }>;
  userId: number;
  variant?: "compact" | "full";
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  participants = [], 
  userId,
  variant = "full" 
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const meetingDate = new Date(meeting.date);
  
  // Format for icon color based on meeting type or status
  const getIconColor = () => {
    const title = meeting.title.toLowerCase();
    if (title.includes("data review")) return "blue";
    if (title.includes("kickoff")) return "purple";
    if (title.includes("sync") || title.includes("team")) return "green";
    if (title.includes("client")) return "yellow";
    return "blue";
  };
  
  const iconColor = getIconColor();
  
  const deleteMeetingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/meetings/${meeting.id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/meetings`] });
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMeetingMutation.mutate();
    }
  };
  
  const handleEdit = () => {
    setShowEditForm(true);
  };
  
  if (variant === "compact") {
    return (
      <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
        <div className={`w-10 h-10 bg-${iconColor}-100 rounded-lg flex items-center justify-center text-${iconColor}-600`}>
          <Users className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium text-gray-800">{meeting.title}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Clock className="mr-1 h-3 w-3" />
            <span>{formatDate(meetingDate)}, {formatTime(meetingDate)} ({meeting.duration} min)</span>
          </div>
        </div>
        {userId === meeting.createdBy && (
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-gray-400 hover:text-gray-600">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-gray-400 hover:text-gray-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {showEditForm && (
          <MeetingForm
            onClose={() => setShowEditForm(false)}
            editMeeting={{
              id: meeting.id,
              title: meeting.title,
              description: meeting.description,
              date: new Date(meeting.date),
              duration: meeting.duration,
              location: meeting.location,
            }}
            userId={userId}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className={`w-12 h-12 bg-${iconColor}-100 rounded-lg flex items-center justify-center text-${iconColor}-600`}>
        <Users className="h-6 w-6" />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium text-gray-800">{meeting.title}</h3>
          {userId === meeting.createdBy && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-gray-400 hover:text-gray-600">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {meeting.description && (
          <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <Clock className="mr-2 h-4 w-4" />
          <span>{formatDate(meetingDate)}, {formatTime(meetingDate)} ({meeting.duration} min)</span>
        </div>
        
        {meeting.location && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{meeting.location}</span>
          </div>
        )}
        
        {participants.length > 0 && (
          <div className="flex items-center mt-3">
            <TooltipProvider>
              <div className="flex -space-x-2 mr-4">
                {participants.slice(0, 3).map((participant) => (
                  <Tooltip key={participant.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={participant.user?.profileImage} alt={participant.user?.name} />
                        <AvatarFallback>{participant.user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{participant.user?.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                
                {participants.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-500">
                        +{participants.length - 3}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{participants.length - 3} more participants</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {showEditForm && (
        <MeetingForm
          onClose={() => setShowEditForm(false)}
          editMeeting={{
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            date: new Date(meeting.date),
            duration: meeting.duration,
            location: meeting.location,
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default MeetingCard;
