import {
    getUserCalendarEvents,
    createCalendarEvent,
    hasConnectedCalendar,
    getUserCalendarTokens
} from './calendarService.js';

/**
 * Calendar Functions that the AI can call
 * These functions define what calendar operations the AI can perform
 */

export const calendarFunctions = [
    {
        name: "get_user_schedule",
        description: "Get the user's calendar schedule for a specific time period",
        parameters: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description: "Start date in ISO format (e.g., '2025-01-30') or 'today', 'tomorrow', 'this week'"
                },
                endDate: {
                    type: "string",
                    description: "End date in ISO format (e.g., '2025-01-30') or 'next week', 'this month'"
                }
            },
            required: []
        }
    },
    {
        name: "create_calendar_event",
        description: "Create a new calendar event with the specified details",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Title or summary of the event"
                },
                startTime: {
                    type: "string",
                    description: "Start time in ISO format (e.g., '2025-01-30T10:00:00') or natural language (e.g., 'tomorrow at 2 PM')"
                },
                endTime: {
                    type: "string",
                    description: "End time in ISO format or natural language (e.g., 'tomorrow at 3 PM')"
                },
                description: {
                    type: "string",
                    description: "Description or details of the event"
                },
                attendees: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "List of attendee email addresses"
                }
            },
            required: ["title", "startTime"]
        }
    },
    {
        name: "check_calendar_availability",
        description: "Check if the user is available during a specific time period",
        parameters: {
            type: "object",
            properties: {
                startTime: {
                    type: "string",
                    description: "Start time to check availability for"
                },
                endTime: {
                    type: "string",
                    description: "End time to check availability for"
                },
                date: {
                    type: "string",
                    description: "Date to check availability for (e.g., 'today', 'tomorrow', '2025-01-30')"
                }
            },
            required: []
        }
    },
    {
        name: "list_upcoming_meetings",
        description: "List all upcoming meetings and events",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Maximum number of events to return (default: 10)"
                },
                days: {
                    type: "number",
                    description: "Number of days ahead to look (default: 7)"
                }
            },
            required: []
        }
    },
    {
        name: "delete_calendar_event",
        description: "Delete a calendar event by its ID or title",
        parameters: {
            type: "object",
            properties: {
                eventId: {
                    type: "string",
                    description: "Google Calendar event ID"
                },
                eventTitle: {
                    type: "string",
                    description: "Title of the event to delete (will find and delete the first match)"
                },
                date: {
                    type: "string",
                    description: "Date when the event occurs (to help identify the correct event)"
                }
            },
            required: []
        }
    }
];

/**
 * Execute calendar functions based on AI requests
 */
export async function executeCalendarFunction(functionName, parameters, userId) {
    try {
        // Check if user has connected calendar
        const hasCalendar = await hasConnectedCalendar(userId);
        if (!hasCalendar) {
            return {
                success: false,
                error: "You don't have a Google Calendar connected. Please connect your calendar first."
            };
        }

        switch (functionName) {
            case "get_user_schedule":
                return await executeGetUserSchedule(parameters, userId);

            case "create_calendar_event":
                return await executeCreateCalendarEvent(parameters, userId);

            case "check_calendar_availability":
                return await executeCheckAvailability(parameters, userId);

            case "list_upcoming_meetings":
                return await executeListUpcomingMeetings(parameters, userId);

            case "delete_calendar_event":
                return await executeDeleteCalendarEvent(parameters, userId);

            default:
                return {
                    success: false,
                    error: `Unknown function: ${functionName}`
                };
        }
    } catch (error) {
        console.error(`Calendar function execution error: ${error.message}`);
        return {
            success: false,
            error: `Failed to execute calendar function: ${error.message}`
        };
    }
}

// Helper functions for each calendar operation
async function executeGetUserSchedule(parameters, userId) {
    const { startDate, endDate } = parameters;

    console.log('📅 Schedule request debug:');
    console.log('  Original startDate:', startDate);
    console.log('  Original endDate:', endDate);

    // Parse natural language dates
    const parsedStartDate = parseNaturalDate(startDate);
    let parsedEndDate = parseNaturalDate(endDate);

    if (startDate === endDate) {
        // If same date, create a full day range
        parsedEndDate = new Date(parsedStartDate);
        parsedEndDate.setDate(parsedEndDate.getDate() + 1); // Next day
        parsedEndDate.setHours(0, 0, 0, 0); // Start of next day
    }

    console.log('  Parsed startDate:', parsedStartDate.toISOString());
    console.log('  Parsed endDate:', parsedEndDate.toISOString());
    console.log('  Date range duration:', (parsedEndDate - parsedStartDate) / (1000 * 60 * 60), 'hours');

    const events = await getUserCalendarEvents(userId, parsedStartDate, parsedEndDate);
    console.log('  Events returned from API:', events.length);

    if (events.length === 0) {
        return {
            success: true,
            message: "No events found for the specified time period.",
            events: []
        };
    }

    return {
        success: true,
        message: `Found ${events.length} event(s) for the specified time period.`,
        events: events.map(event => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            description: event.description,
            attendees: event.attendees?.map(a => a.email) || []
        }))
    };
}

async function executeCreateCalendarEvent(parameters, userId) {
    const { title, startTime, endTime, description, attendees } = parameters;

    // Parse natural language times
    const parsedStartTime = parseNaturalDateTime(startTime);

    let parsedEndTime;
    if (endTime) {
        parsedEndTime = parseNaturalDateTime(endTime);
        // If end time is before or equal to start time, add 1 hour
        if (parsedEndTime <= parsedStartTime) {
            parsedEndTime = new Date(parsedStartTime.getTime() + 60 * 60 * 1000);
        }
    } else {
        // Default: 1 hour duration
        parsedEndTime = new Date(parsedStartTime.getTime() + 60 * 60 * 1000);
    }

    console.log(' Event time debug:');
    console.log('  Start time:', parsedStartTime.toISOString());
    console.log('  End time:', parsedEndTime.toISOString());
    console.log('  Duration:', (parsedEndTime - parsedStartTime) / (1000 * 60), 'minutes');

    const eventDetails = {
        title,
        startTime: parsedStartTime,
        endTime: parsedEndTime || new Date(new Date(parsedStartTime).getTime() + 60 * 60 * 1000), // Default 1 hour
        description: description || '',
        attendees: attendees || []
    };

    const result = await createCalendarEvent(userId, eventDetails);

    return {
        success: true,
        message: `Event "${title}" created successfully!`,
        eventId: result.eventId,
        event: result.event
    };
}

async function executeCheckAvailability(parameters, userId) {
    const { startTime, endTime, date } = parameters;

    // Parse natural language dates/times
    const parsedStartTime = parseNaturalDateTime(startTime);
    const parsedEndTime = parseNaturalDateTime(endTime);

    // Get events for the time period
    const events = await getUserCalendarEvents(userId, parsedStartTime, parsedEndTime);

    if (events.length === 0) {
        return {
            success: true,
            available: true,
            message: "You are available during the specified time period.",
            conflictingEvents: []
        };
    }

    return {
        success: true,
        available: false,
        message: `You have ${events.length} conflicting event(s) during this time.`,
        conflictingEvents: events.map(event => ({
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date
        }))
    };
}

async function executeListUpcomingMeetings(parameters, userId) {
    const { limit = 10, days = 7 } = parameters;

    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const events = await getUserCalendarEvents(userId, startDate.toISOString(), endDate.toISOString());

    const upcomingEvents = events
        .filter(event => event.start.dateTime && new Date(event.start.dateTime) > new Date())
        .slice(0, limit);

    if (upcomingEvents.length === 0) {
        return {
            success: true,
            message: "No upcoming events found.",
            events: []
        };
    }

    return {
        success: true,
        message: `Found ${upcomingEvents.length} upcoming event(s).`,
        events: upcomingEvents.map(event => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime,
            end: event.end.dateTime,
            description: event.description
        }))
    };
}

async function executeDeleteCalendarEvent(parameters, userId) {
    // This will be implemented in the next step
    // For now, return a placeholder
    return {
        success: false,
        error: "Delete calendar event function not yet implemented. Will be added in the next step."
    };
}

/**
 * Parse natural language dates and times
 */
function parseNaturalDate(dateString) {
    if (!dateString) return new Date();

    const today = new Date();

    switch (dateString.toLowerCase()) {
        case 'today':
            // Return start of today
            return new Date(today.getFullYear(), today.getMonth(), today.getDate());
        case 'tomorrow':
            // Return start of tomorrow
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        case 'this week':
            return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'next week':
            return new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        case 'this month':
            return new Date(today.getFullYear(), today.getMonth() + 1, 0);
        default:
            return new Date(dateString);
    }
}

function parseNaturalDateTime(dateTimeString) {
    if (!dateTimeString) return new Date();

    // Handle natural language times like "tomorrow at 2 PM"
    if (dateTimeString.includes(' at ')) {
        const [datePart, timePart] = dateTimeString.split(' at ');
        const date = parseNaturalDate(datePart);
        const time = parseTimeString(timePart);

        if (time) {
            // Fix: Set the time properly
            const newDate = new Date(date);
            newDate.setHours(time.hours, time.minutes, 0, 0);

            // Fix: If the time has passed today, move to tomorrow
            if (datePart.toLowerCase() === 'today' && newDate < new Date()) {
                newDate.setDate(newDate.getDate() + 1);
            }

            return newDate;
        }
    }
    return new Date(dateTimeString);
}

function parseTimeString(timeString) {
    const timeRegex = /(\d{1,2}):?(\d{2})?\s*(am|pm)/i;
    const match = timeString.match(timeRegex);

    if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3].toLowerCase();

        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        return { hours, minutes };
    }

    return null;
}