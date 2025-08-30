import { useEffect, useState } from 'react';
import { calendarService } from '../store/api/calendarService';
import Button from "./ux/Button.tsx";

const Calendar = () => {
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        checkConnectionStatus();
        // Check for calendar connection status in URL params
        checkUrlParams();
    }, []);

    const checkUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const calendarStatus = urlParams.get('calendar');
        const message = urlParams.get('message');

        if (calendarStatus && message) {
            if (calendarStatus === 'connected') {
                console.log('✅ Calendar connected:', message);
                
                // Clean up URL params
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Optionally show a toast or notification
                // You can add a toast library or simple alert here
                
                // Refresh connection status
                checkConnectionStatus();
            } else if (calendarStatus === 'error') {
                console.log('❌ Calendar connection failed:', message);
                window.history.replaceState({}, document.title, window.location.pathname);
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
    } catch (error) {
        console.error('Failed to check calendar status');
        }
    };

    const handleConnectCalendar = async () => {
        try {
            const userToken = localStorage.getItem("authToken");
            if (userToken) {
                await calendarService.connectCalendar(userToken);
            }
        } catch (error) {
            console.error('Failed to connect calendar:', error);
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
                        Connect your Google Calendar to schedule events and manage appointments.
                    </p>
                    <Button
                        onClick={handleConnectCalendar}
                        ternary
                        rounded
                    >
                        Connect Google Calendar
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Calendar;