import { useEffect, useState } from "react";
import { calendarService } from "../store/api/calendarService";
import Button from "./ux/Button.tsx";


/**
 * Calendar integration component for Google Calendar connectivity
 *
 *   This component provides:
 * - Google Calendar connection status checking
 * - OAuth authentication flow initiation
 * - Connection status display
 * - URL parameter handling for OAuth callbacks
 * @author Margarita Kattsyna
 */
const Calendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    checkConnectionStatus();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarStatus = urlParams.get("calendar");
    const message = urlParams.get("message");

    if (calendarStatus && message) {
      if (calendarStatus === "connected") {
        console.log("✅ Calendar connected:", message);

        // Clean up URL params
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // Show success message (you can add a toast notification here)
        alert(message); // Replace with proper toast notification

        // Refresh connection status
        checkConnectionStatus();
      } else if (calendarStatus === "error") {
        console.log("Calendar connection failed:", message);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        alert(message); // Replace with proper error notification
      }
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (userToken) {
        // Use the calendarService instead of direct fetch
        const result = await calendarService.checkConnectionStatus(userToken);
        setIsConnected(result.connected);
      }
    } catch {
      console.error("Failed to check calendar status");
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (userToken) {
        await calendarService.connectCalendar(userToken);
      }
    } catch (error) {
      console.error("Failed to connect calendar:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Calendar Integration</h2>

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center text-green-600">
            <span className="text-2xl mr-2">✅</span>
            <span>Google Calendar Connected</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">🔗</span>
            <span>Connect Google Calendar</span>
          </div>
          <p className="text-sm text-gray-600">
            Connect your Google Calendar to schedule events and manage
            appointments.
          </p>
          <Button onClick={handleConnectCalendar} ternary rounded>
            Connect Google Calendar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
