import axios from "axios";

/**
 * Format date as YYYY-MM-DDThh:mm:ss (ISO string but without timezone)
 */
function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "");
}

/**
 * Create calendar events for a study plan
 * @param studyPlan The study plan object with schedule details
 * @param startDate When the plan starts
 * @param endDate When the plan ends
 */
export async function createCalendarEvents(
  studyPlan: any,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  try {
    const response = await axios.post('/api/google/create-events', {
      studyPlan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    
    return response.data.eventIds;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw new Error("Failed to add study plan to Google Calendar");
  }
}

/**
 * Delete calendar events by ID
 * @param eventIds Array of event IDs to delete
 */
export async function deleteCalendarEvents(eventIds: string[]): Promise<boolean> {
  try {
    await axios.post('/api/google/delete-events', {
      eventIds
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting calendar events:", error);
    throw new Error("Failed to remove study plan from Google Calendar");
  }
}

/**
 * Check if user has connected Google Calendar
 */
export async function checkCalendarConnection(): Promise<boolean> {
  try {
    const response = await axios.get('/api/google/connection-status');
    return response.data.connected;
  } catch (error) {
    console.error("Error checking calendar connection:", error);
    return false;
  }
}

/**
 * Get available calendars for the connected account
 */
export async function getAvailableCalendars(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await axios.get('/api/google/calendars');
    return response.data.calendars;
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return [];
  }
}
