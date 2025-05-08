import { useState } from "react";
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

type CalendarView = "day" | "week" | "month";

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>("week");

  const nextDate = () => {
    if (currentView === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (currentView === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const prevDate = () => {
    if (currentView === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (currentView === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    
    const days = eachDayOfInterval({
      start: startDate,
      end: addDays(monthEnd, 7) // Make sure we have 6 rows
    });

    const getEventsForDay = (day: Date) => {
      return events.filter(event => 
        event.date.getFullYear() === day.getFullYear() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getDate() === day.getDate()
      );
    };

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center p-2 font-medium text-sm text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div 
              key={idx} 
              className={cn(
                "min-h-[100px] p-1 border rounded-md",
                isCurrentMonth ? "bg-white" : "bg-gray-50",
                isToday(day) && "border-primary bg-blue-50",
                !isCurrentMonth && "text-gray-400"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="font-medium text-right p-1">
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-xs p-1 truncate rounded",
                      `bg-${event.color}-100 text-${event.color}-800 border-l-2 border-${event.color}-500`
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.startTime} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-gray-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    // Hours for the day from 8 AM to 6 PM
    const hours = Array.from({ length: 11 }, (_, i) => i + 8);
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-center text-sm font-medium text-gray-500 border-r"></div>
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "p-2 text-center text-sm font-medium border-r",
                isToday(day) ? "bg-blue-50 text-primary" : "text-gray-500"
              )}
            >
              {format(day, "EEE")}
              <div className={cn(
                "font-normal",
                isToday(day) ? "text-primary" : "text-gray-500"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative" style={{ height: "600px" }}>
          <div className="grid grid-cols-8 h-full border-b">
            <div className="border-r">
              {hours.map(hour => (
                <div key={hour} className="h-14 border-b px-2 text-xs text-gray-500 text-right pt-3">
                  {hour > 12 ? `${hour-12}:00 PM` : `${hour}:00 AM`}
                </div>
              ))}
            </div>
            
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r relative">
                {hours.map(hour => (
                  <div key={hour} className="h-14 border-b"></div>
                ))}
                
                {events
                  .filter(event => 
                    event.date.getFullYear() === day.getFullYear() &&
                    event.date.getMonth() === day.getMonth() &&
                    event.date.getDate() === day.getDate()
                  )
                  .map(event => {
                    const [startHour, startMinute] = event.startTime.split(":").map(Number);
                    const [endHour, endMinute] = event.endTime.split(":").map(Number);
                    
                    const startPosition = (startHour - 8) * 56 + (startMinute / 60) * 56;
                    const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) * 56;
                    
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          "absolute left-1 right-1 rounded p-1 text-xs overflow-hidden",
                          `bg-${event.color}-100 border-l-4 border-${event.color}`
                        )}
                        style={{
                          top: `${startPosition}px`,
                          height: `${duration}px`
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className={`font-medium text-${event.color}-800`}>{event.title}</div>
                        <div className="text-gray-600">{event.startTime} - {event.endTime}</div>
                      </div>
                    );
                  })
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    // Hours for the day from 8 AM to 6 PM
    const hours = Array.from({ length: 11 }, (_, i) => i + 8);
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 text-center border-b">
          <h3 className="font-medium text-gray-800">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
        
        <div className="relative" style={{ height: "600px" }}>
          {hours.map(hour => (
            <div key={hour} className="flex border-b h-14">
              <div className="w-20 px-2 text-xs text-gray-500 text-right pt-3 border-r">
                {hour > 12 ? `${hour-12}:00 PM` : `${hour}:00 AM`}
              </div>
              <div className="flex-1"></div>
            </div>
          ))}

          {events
            .filter(event => 
              event.date.getFullYear() === currentDate.getFullYear() &&
              event.date.getMonth() === currentDate.getMonth() &&
              event.date.getDate() === currentDate.getDate()
            )
            .map(event => {
              const [startHour, startMinute] = event.startTime.split(":").map(Number);
              const [endHour, endMinute] = event.endTime.split(":").map(Number);
              
              const startPosition = (startHour - 8) * 56 + (startMinute / 60) * 56;
              const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) * 56;
              
              return (
                <div 
                  key={event.id}
                  className={cn(
                    "absolute left-24 right-4 rounded p-2 text-sm overflow-hidden",
                    `bg-${event.color}-100 border-l-4 border-${event.color}`
                  )}
                  style={{
                    top: `${startPosition + 40}px`, // Account for header
                    height: `${duration}px`
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className={`font-medium text-${event.color}-800`}>{event.title}</div>
                  <div className="text-gray-600">{event.startTime} - {event.endTime}</div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">Meeting Calendar</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setCurrentView("day")} 
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                currentView === "day" ? "bg-white shadow-sm text-gray-800" : "text-gray-700"
              )}
            >
              Day
            </button>
            <button 
              onClick={() => setCurrentView("week")} 
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                currentView === "week" ? "bg-white shadow-sm text-gray-800" : "text-gray-700"
              )}
            >
              Week
            </button>
            <button 
              onClick={() => setCurrentView("month")} 
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                currentView === "month" ? "bg-white shadow-sm text-gray-800" : "text-gray-700"
              )}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevDate}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="text-gray-600 h-4 w-4" />
          </button>
          <h3 className="text-base font-medium text-gray-800">
            {currentView === "month" && format(currentDate, "MMMM yyyy")}
            {currentView === "week" && `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
            {currentView === "day" && format(currentDate, "MMMM d, yyyy")}
          </h3>
          <button 
            onClick={nextDate}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="text-gray-600 h-4 w-4" />
          </button>
          <button 
            onClick={goToToday}
            className="ml-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Today
          </button>
        </div>
      </div>
      
      {currentView === "month" && renderMonthView()}
      {currentView === "week" && renderWeekView()}
      {currentView === "day" && renderDayView()}
    </div>
  );
};

export default CalendarView;
