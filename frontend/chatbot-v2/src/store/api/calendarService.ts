import chatService from './chatService';
import {API_CONFIG} from "./api.ts";

class CalendarService {
    private async getInternalToken(userToken: string): Promise<string> {
        return await chatService.getInternalToken(userToken);
    }

    async checkConnectionStatus(userToken: string) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/status`, {
            headers: {
                'Authorization': `Bearer ${internalToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to check calendar connection status');
        }

        return response.json();
    }

    async createEvent(userToken: string, eventDetails: any) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${internalToken}`
            },
            body: JSON.stringify({ eventDetails })
        });

        if (!response.ok) {
            throw new Error('Failed to create calendar event');
        }

        return response.json();
    }

    async getEvents(userToken: string, startDate?: string, endDate?: string) {
        const internalToken = await this.getInternalToken(userToken);

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/events?${params}`, {
            headers: {
                'Authorization': `Bearer ${internalToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch calendar events');
        }

        return response.json();
    }

    async connectCalendar(userToken: string) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_CONFIG.MAIN_API_URL}/calendar/auth`, {
            headers: {
                'Authorization': `Bearer ${internalToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to initiate calendar connection');
        }

        const { authUrl } = await response.json();
        window.location.href = authUrl;
    }
}

export const calendarService = new CalendarService();