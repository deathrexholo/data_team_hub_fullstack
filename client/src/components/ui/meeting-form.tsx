import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MeetingFormProps {
  onClose: () => void;
  selectedDate?: Date;
  editMeeting?: {
    id: number;
    title: string;
    description: string;
    date: Date;
    duration: number;
    location: string;
  };
  userId: number;
}

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  duration: z.string(),
  location: z.string().optional(),
  participants: z.array(z.number()).optional()
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

const MeetingForm: React.FC<MeetingFormProps> = ({ 
  onClose, 
  selectedDate = new Date(), 
  editMeeting,
  userId 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: editMeeting?.title || "",
      description: editMeeting?.description || "",
      date: editMeeting ? format(new Date(editMeeting.date), "yyyy-MM-dd") : format(selectedDate, "yyyy-MM-dd"),
      time: editMeeting ? format(new Date(editMeeting.date), "HH:mm") : "09:00",
      duration: editMeeting ? String(editMeeting.duration) : "60",
      location: editMeeting?.location || "Conference Room A",
      participants: []
    }
  });

  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  useEffect(() => {
    if (editMeeting) {
      // Load participants if editing a meeting
      const fetchParticipants = async () => {
        try {
          const response = await fetch(`/api/meetings/${editMeeting.id}/participants`);
          if (response.ok) {
            const data = await response.json();
            const userIds = data.map((p: any) => p.userId);
            setSelectedParticipants(userIds);
            setValue("participants", userIds);
          }
        } catch (error) {
          console.error("Failed to fetch participants:", error);
        }
      };
      
      fetchParticipants();
    }
  }, [editMeeting, setValue]);

  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/meetings", data);
      return response.json();
    },
    onSuccess: async (data) => {
      // Add participants to the meeting
      if (selectedParticipants.length > 0) {
        await Promise.all(
          selectedParticipants.map(participantId => 
            apiRequest("POST", `/api/meetings/${data.id}/participants`, {
              userId: participantId,
              status: "pending"
            })
          )
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/meetings`] });
      
      toast({
        title: "Success",
        description: "Meeting created successfully",
      });
      
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive"
      });
    }
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/meetings/${editMeeting?.id}`, data);
      return response.json();
    },
    onSuccess: async () => {
      // Update participants if needed
      if (editMeeting) {
        // First, fetch current participants
        const response = await fetch(`/api/meetings/${editMeeting.id}/participants`);
        if (response.ok) {
          const currentParticipants = await response.json();
          const currentUserIds = currentParticipants.map((p: any) => p.userId);
          
          // Determine which to add and which to remove
          const toAdd = selectedParticipants.filter(id => !currentUserIds.includes(id));
          const toRemove = currentUserIds.filter(id => !selectedParticipants.includes(id) && id !== userId);
          
          // Add new participants
          await Promise.all(
            toAdd.map(participantId => 
              apiRequest("POST", `/api/meetings/${editMeeting.id}/participants`, {
                userId: participantId,
                status: "pending"
              })
            )
          );
          
          // Remove participants that were deselected
          await Promise.all(
            toRemove.map(participantId => 
              apiRequest("DELETE", `/api/meetings/${editMeeting.id}/participants/${participantId}`, null)
            )
          );
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/meetings`] });
      
      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
      
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update meeting",
        variant: "destructive"
      });
    }
  });

  const handleParticipantSelection = (userId: number) => {
    setSelectedParticipants(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const onSubmit = (formData: MeetingFormValues) => {
    const [hours, minutes] = formData.time.split(':').map(Number);
    const meetingDate = new Date(formData.date);
    meetingDate.setHours(hours, minutes);
    
    const meetingData = {
      title: formData.title,
      description: formData.description || "",
      date: meetingDate.toISOString(),
      duration: parseInt(formData.duration),
      location: formData.location || "Conference Room A",
      createdBy: userId
    };
    
    if (editMeeting) {
      updateMeetingMutation.mutate(meetingData);
    } else {
      createMeetingMutation.mutate(meetingData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {editMeeting ? "Edit Meeting" : "Create New Meeting"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title
            </label>
            <Input
              id="title"
              placeholder="Enter meeting title"
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <Input
                id="time"
                type="time"
                {...register("time")}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <Select defaultValue={editMeeting ? String(editMeeting.duration) : "60"} onValueChange={(value) => setValue("duration", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              placeholder="Meeting location"
              {...register("location")}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participants
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {users.length > 0 ? (
                users
                  .filter((user: any) => user.id !== userId) // Don't show current user
                  .map((user: any) => (
                    <div key={user.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedParticipants.includes(user.id)}
                        onChange={() => handleParticipantSelection(user.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`user-${user.id}`} className="flex items-center">
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm">{user.name}</span>
                      </label>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Loading participants...</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter meeting description"
              rows={3}
              {...register("description")}
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}>
              {createMeetingMutation.isPending || updateMeetingMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : editMeeting ? "Update Meeting" : "Create Meeting"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
