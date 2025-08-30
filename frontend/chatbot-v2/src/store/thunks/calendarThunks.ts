import { createAsyncThunk } from "@reduxjs/toolkit";
import { calendarService } from "../api/calendarService";

export const createCalendarEvent = createAsyncThunk<
    { eventId: string; eventDetails: any },
    { eventDetails: any },
    { rejectValue: string }
>(
    'calendar/createEvent',
    async ({ eventDetails }, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem("authToken");
            if (!userToken) throw new Error("No authentication token found");

            const result = await calendarService.createEvent(userToken, eventDetails);
            return { eventId: result.eventId, eventDetails };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create calendar event'
            );
        }
    }
);

export const fetchCalendarEvents = createAsyncThunk<
    { events: any[] },
    { startDate?: string; endDate?: string },
    { rejectValue: string }
>(
    'calendar/fetchEvents',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem("authToken");
            if (!userToken) throw new Error("No authentication token found");

            const result = await calendarService.getEvents(userToken, startDate, endDate);
            return { events: result.events };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch calendar events'
            );
        }
    }
);