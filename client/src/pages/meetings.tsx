import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/ui/calendar-view";
import MeetingCard from "@/components/meetings/meeting-card";
import MeetingForm from "@/components/ui/meeting-form";
import { formatDate, formatTime } from "@/lib/date-utils";

interface MeetingsProps {
  user: {
    id: number;
    name: string;
    email: string;
    profileImage: string;
  };
}

const Meetings: React.FC<MeetingsProps> = ({ user }) => {
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Fetch meetings data
  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: [`/api/users/${user.id}/meetings`],
  });

  // Transform meetings data for CalendarView component
  const calendarEvents = meetings.map((meeting: any) => {
    const meetingDate = new Date(meeting.date);
    const hours = meetingDate.getHours();
    const minutes = meetingDate.getMinutes();
    
    // Determine color based on meeting type
    let color = "blue";
    if (meeting.title.toLowerCase().includes("review")) color = "blue";
    else if (meeting.title.toLowerCase().includes("kickoff")) color = "purple";
    else if (meeting.title.toLowerCase().includes("sync")) color = "green";
    else if (meeting.title.toLowerCase().includes("client")) color = "yellow";
    
    return {
      id: meeting.id,
      title: meeting.title,
      date: meetingDate,
      startTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      endTime: `${(hours + Math.floor(meeting.duration / 60)).toString().padStart(2, '0')}:${(minutes + meeting.duration % 60).toString().padStart(2, '0')}`,
      color
    };
  });

  // Fetch meeting participants data
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: [`/api/meetings/participants`],
    select: (data) => {
      // Group participants by meeting ID
      const result: Record<number, any[]> = {};
      (data || []).forEach((participant: any) => {
        if (!result[participant.meetingId]) {
          result[participant.meetingId] = [];
        }
        result[participant.meetingId].push(participant);
      });
      return result;
    }
  });

  // Sample meeting notes for the Recent Meeting Notes section
  const recentMeetingNotes = [
    {
      id: 1,
      title: "Client QBR - Q1 2023",
      content: "Discussed Q1 performance metrics. Client was satisfied with the dashboard improvements. Action items include adding 3 new metrics for Q2.",
      date: "April 15, 2023"
    },
    {
      id: 2,
      title: "Data Strategy Planning",
      content: "Outlined the new data lake architecture. Team agreed on using AWS for storage and Snowflake for processing. Migration to begin next month.",
      date: "April 10, 2023"
    },
    {
      id: 3,
      title: "Team Weekly Sync",
      content: "Updates from all team members on current projects. Sarah completed the ETL pipeline. Mike working on dashboard redesign. New hire joining next week.",
      date: "April 5, 2023"
    },
    {
      id: 4,
      title: "Product Analytics Review",
      content: "Analyzed user behavior data from the new feature launch. Engagement up 32%, conversion improved by 12%. Recommendations for optimizations shared.",
      date: "April 1, 2023"
    }
  ];

  // Filter upcoming meetings
  const upcomingMeetings = [...meetings]
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((meeting: any) => new Date(meeting.date) > new Date())
    .slice(0, 4);

  // Meeting resources for the bottom section
  const meetingResources = [
    {
      id: 1,
      title: "Q1 Report.pdf",
      description: "Quarterly performance metrics and KPIs for client presentation",
      icon: "file-pdf",
      color: "blue",
      updatedAt: "2 days ago"
    },
    {
      id: 2,
      title: "Analytics Dashboard.xlsx",
      description: "Raw data export with visualizations for the monthly review",
      icon: "file-excel",
      color: "green",
      updatedAt: "1 week ago"
    },
    {
      id: 3,
      title: "Pipeline Architecture.pptx",
      description: "Technical overview of the new data pipeline architecture",
      icon: "file-powerpoint",
      color: "purple",
      updatedAt: "2 weeks ago"
    }
  ];

  return (
    <div>
      {/* Calendar component */}
      <CalendarView
        events={calendarEvents}
        onDateClick={(date) => {
          setSelectedDate(date);
          setShowCreateMeeting(true);
        }}
        onEventClick={(event) => {
          // Find the meeting with this ID and open edit form
          const meeting = meetings.find((m: any) => m.id === event.id);
          if (meeting) {
            // Navigate to meeting details or open a modal
            console.log("Event clicked:", meeting);
          }
        }}
      />

      {/* Upcoming meetings and meeting notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Meetings</h2>
          {isLoadingMeetings ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting: any) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  participants={participants[meeting.id] || []}
                  userId={user.id}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Meeting Notes</h2>
          <div className="space-y-4">
            {recentMeetingNotes.map((note) => (
              <div key={note.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-800">{note.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{note.date}</span>
                  <Button variant="link" className="text-xs text-primary hover:text-blue-600 font-medium">
                    View Notes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting resources */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meetingResources.map((resource) => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 bg-${resource.color}-100 rounded-lg flex items-center justify-center text-${resource.color}-500`}>
                  <i className={`fas fa-${resource.icon}`}></i>
                </div>
                <h3 className="ml-3 font-medium text-gray-800">{resource.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Updated {resource.updatedAt}</span>
                <Button variant="link" className="text-primary hover:text-blue-600 font-medium p-0">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create meeting modal */}
      {showCreateMeeting && (
        <MeetingForm 
          onClose={() => setShowCreateMeeting(false)} 
          selectedDate={selectedDate}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Meetings;
