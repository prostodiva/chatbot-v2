import chatService from "./chatService";
import { API_CONFIG } from "./api.ts";
import type { CalendarEventDetails} from "../types.ts";

/**
 * Service class for managing Google Calendar integration
 *
 * This service handles all calendar-related operations:
 * - Calendar connection status checking
 * - Event creation and management
 * - Event retrieval and filtering
 * - OAuth authentication flow
 *
 * @author Margarita Kattsyna
 */
class CalendarService {
  /**
   * Retrieves internal authentication token for calendar API calls
   *
   * Uses the chat service to get internal tokens for secure
   * communication with the main backend
   *
   * @param userToken - The user's authentication token
   * @returns Promise resolving to the internal token string
   * @throws {Error} When token retrieval fails
   */
  private async getInternalToken(userToken: string): Promise<string> {
    return await chatService.getInternalToken(userToken);
  }

  /**
   * Checks if the user's Google Calendar is connected
   *
   * Verifies the connection status and returns current state
   *
   * @param userToken - The user's authentication token
   * @returns Promise resolving to connection status object
   * @throws {Error} When status check fails
   */
  async checkConnectionStatus(userToken: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/status`, {
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to check calendar connection status");
    }

    return response.json();
  }

  /**
   * Creates a new calendar event
   *
   * Schedules an event in the user's Google Calendar
   *
   * @param userToken - The user's authentication token
   * @param eventDetails - Object containing event information
   * @returns Promise resolving to the created event data
   * @throws {Error} When event creation fails
   */
  async createEvent(userToken: string, eventDetails: CalendarEventDetails) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalToken}`,
      },
      body: JSON.stringify({ eventDetails }),
    });

    if (!response.ok) {
      throw new Error("Failed to create calendar event");
    }

    return response.json();
  }

  /**
   * Retrieves calendar events within a date range
   *
   * Fetches events from the user's Google Calendar
   *
   * @param userToken - The user's authentication token
   * @param startDate - Start date for event range (optional)
   * @param endDate - End date for event range (optional)
   * @returns Promise resolving to array of calendar events
   * @throws {Error} When event retrieval fails
   */
  async getEvents(userToken: string, startDate?: string, endDate?: string) {
    const internalToken = await this.getInternalToken(userToken);

    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await fetch(
      `${API_CONFIG.MAIN_API_URL}/calendar/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${internalToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch calendar events");
    }

    return response.json();
  }

  /**
   * Initiates Google Calendar OAuth connection
   *
   * Redirects user to Google OAuth for calendar access
   *
   * @param userToken - The user's authentication token
   * @throws {Error} When OAuth initiation fails
   */
  async connectCalendar(userToken: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/auth`, {
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to initiate calendar connection");
    }

    const { authUrl } = await response.json();
    window.location.href = authUrl;
  }
}

export const calendarService = new CalendarService();
