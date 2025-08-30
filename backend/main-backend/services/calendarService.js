import { google } from 'googleapis';
import getPool from "../config/database.js";

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL || 'http://localhost:3001'}/api/calendar/callback`
);

// Get user's calendar tokens from database
export async function getUserCalendarTokens(userId) {
    const pool = getPool();

    const result = await pool.query(`
        SELECT access_token, refresh_token, expiry_date
        FROM user_calendar_tokens 
        WHERE user_id = $1
    `, [userId]);

    return result.rows[0];
}

// Store user's calendar tokens in database
export async function storeUserCalendarTokens(userId, tokens) {
    const pool = getPool();

    const { access_token, refresh_token, expiry_date } = tokens;

    await pool.query(`
        INSERT INTO user_calendar_tokens (user_id, access_token, refresh_token, expiry_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            expiry_date = EXCLUDED.expiry_date,
            updated_at = CURRENT_TIMESTAMP
    `, [userId, access_token, refresh_token, new Date(expiry_date || Date.now() + 3600000)]);
}

// Refresh user's access token
export async function refreshUserTokens(userId) {
    const pool = getPool();
    const tokens = await getUserCalendarTokens(userId);

    if (!tokens?.refresh_token) {
        throw new Error('No refresh token available');
    }

    oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update stored tokens
    await storeUserCalendarTokens(userId, credentials);

    return credentials.access_token;
}

// Check if user's token is expired
export async function isTokenExpired(userId) {
    const tokens = await getUserCalendarTokens(userId);

    if (!tokens) {
        return true; // No tokens means expired
    }

    return new Date() > new Date(tokens.expiry_date);
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken(userId) {
    if (await isTokenExpired(userId)) {
        return await refreshUserTokens(userId);
    }

    const tokens = await getUserCalendarTokens(userId);
    return tokens.access_token;
}

// Create calendar event
export async function createCalendarEvent(userId, eventDetails) {
    try {
        // Get valid access token
        const accessToken = await getValidAccessToken(userId);

        if (!accessToken) {
            throw new Error('Failed to get valid access token');
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: accessToken
        });

        // Create calendar instance
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Prepare event object
        const event = {
            summary: eventDetails.title,
            description: eventDetails.description || '',
            start: {
                dateTime: new Date(eventDetails.startTime).toISOString(),
                timeZone: 'UTC'
            },
            end: {
                dateTime: new Date(eventDetails.endTime).toISOString(),
                timeZone: 'UTC'
            },
            attendees: eventDetails.attendees?.map(email => ({ email: email.trim() })) || [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 },
                    { method: 'popup', minutes: 10 }
                ]
            }
        };

        // Insert event into Google Calendar
        const calendarEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });

        return {
            success: true,
            eventId: calendarEvent.data.id,
            event: calendarEvent.data
        };

    } catch (error) {
        console.error('Create calendar event error:', error);
        throw new Error(`Failed to create calendar event: ${error.message}`);
    }
}

// Get user's calendar events
export async function getUserCalendarEvents(userId, startDate, endDate) {
    try {
        // Get valid access token
        const accessToken = await getValidAccessToken(userId);

        if (!accessToken) {
            throw new Error('Failed to get valid access token');
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: accessToken
        });

        // Create calendar instance
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Set time range
        const timeMin = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
        const timeMax = endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Get events from Google Calendar
        const eventsResult = await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50
        });

        return eventsResult.data.items || [];

    } catch (error) {
        console.error('Get calendar events error:', error);
        throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
}

// Check if user has connected calendar
export async function hasConnectedCalendar(userId) {
    try {
        const tokens = await getUserCalendarTokens(userId);
        return !!tokens && !!tokens.access_token;
    } catch (error) {
        console.error('Check calendar connection error:', error);
        return false;
    }
}

// Disconnect user's calendar
export async function disconnectUserCalendar(userId) {
    try {
        const pool = getPool();

        await pool.query(`
            DELETE FROM user_calendar_tokens 
            WHERE user_id = $1
        `, [userId]);

        return { success: true };
    } catch (error) {
        console.error('Disconnect calendar error:', error);
        throw new Error(`Failed to disconnect calendar: ${error.message}`);
    }
}