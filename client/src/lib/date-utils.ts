import { format, isToday, isYesterday, isTomorrow, isThisWeek, addDays } from "date-fns";

/**
 * Formats a date into a human-readable string
 * @param date The date to format
 * @returns A string representation of the date
 */
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isTomorrow(date)) {
    return "Tomorrow";
  } else if (isThisWeek(date)) {
    return format(date, "EEEE"); // Day name
  } else {
    return format(date, "MMM d, yyyy");
  }
}

/**
 * Formats a time into a human-readable string
 * @param date The date with time to format
 * @returns A string representation of the time
 */
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * Gets the end time of a meeting given the start time and duration
 * @param startDate The start date and time
 * @param durationMinutes The duration in minutes
 * @returns A formatted string for the end time
 */
export function getMeetingEndTime(startDate: Date, durationMinutes: number): string {
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return formatTime(endDate);
}

/**
 * Returns a date range string for a meeting
 * @param startDate The start date and time
 * @param durationMinutes The duration in minutes
 * @returns A formatted string for the meeting time range
 */
export function getMeetingTimeRange(startDate: Date, durationMinutes: number): string {
  return `${formatTime(startDate)} - ${getMeetingEndTime(startDate, durationMinutes)}`;
}

/**
 * Creates an array of dates for the next N days
 * @param days Number of days to generate
 * @returns Array of Date objects
 */
export function getNextDays(days: number): Date[] {
  const result: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    result.push(addDays(today, i));
  }
  
  return result;
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param date The date to format
 * @returns A relative time string
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (diffSec < 0) {
    // In the past
    if (diffSec > -60) return `${Math.abs(diffSec)} seconds ago`;
    if (diffMin > -60) return `${Math.abs(diffMin)} minutes ago`;
    if (diffHr > -24) return `${Math.abs(diffHr)} hours ago`;
    if (diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    return format(date, "MMM d, yyyy");
  } else {
    // In the future
    if (diffSec < 60) return `in ${diffSec} seconds`;
    if (diffMin < 60) return `in ${diffMin} minutes`;
    if (diffHr < 24) return `in ${diffHr} hours`;
    if (diffDays < 7) return `in ${diffDays} days`;
    return format(date, "MMM d, yyyy");
  }
}
