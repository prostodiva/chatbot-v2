import express from "express";
import { authenticateInternal } from "../middleware/internalAuth.js";
import { google } from 'googleapis';
import { storeUserCalendarTokens } from "../services/calendarService.js";

const router = express.Router();

// Create OAuth client function that runs when needed
function createOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

    console.log('Creating OAuth client with:', {
        clientId: clientId ? 'SET' : 'NOT SET',
        clientSecret: clientSecret ? 'SET' : 'NOT SET',
        baseUrl: baseUrl || 'NOT SET'
    });

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        `${baseUrl}/api/calendar/callback`
    );
}

// Connect user's Google Calendar
router.get("/auth", authenticateInternal, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const oauth2Client = createOAuthClient();

        // Generate OAuth URL with user-specific state
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            state: userId.toString(),
            prompt: 'consent'
        });

        res.json({ authUrl });
    } catch (error) {
        console.error('Calendar auth error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate auth URL' });
    }
});

// OAuth callback
router.get("/callback", async (req, res) => {
    try {
        const { code, state: userId } = req.query;
        
        if (!code || !userId) {
            return res.status(400).json({ error: "Missing authorization code or user ID" });
        }

        const oauth2Client = createOAuthClient();

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        if (!tokens.access_token) {
            return res.status(400).json({ error: "Failed to get access token" });
        }

        // Store tokens in database using service
        await storeUserCalendarTokens(userId, tokens);

        // Redirect back to dashboard with success message
        res.redirect('http://localhost:5173?calendar=connected&message=Your+Google+Calendar+has+been+connected!+You+can+now+ask+me+to+show+your+schedule+or+create+events.');
        
    } catch (error) {
        console.error('Calendar callback error:', error);
        // Redirect back to dashboard with error message
        res.redirect('http://localhost:5173?calendar=error&message=Failed+to+connect+calendar.+Please+try+again.');
    }
});

// Create calendar event
router.post("/events", authenticateInternal, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { eventDetails } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!eventDetails || !eventDetails.title || !eventDetails.startTime || !eventDetails.endTime) {
            return res.status(400).json({ error: "Missing required event details" });
        }

        // Import and use the calendar service
        const { createCalendarEvent } = await import("../services/calendarService.js");
        const result = await createCalendarEvent(userId, eventDetails);

        res.json(result);

    } catch (error) {
        console.error('Create calendar event error:', error);
        res.status(500).json({ error: error.message || 'Failed to create calendar event' });
    }
});

// Get user's calendar events
router.get("/events", authenticateInternal, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Import and use the calendar service
        const { getUserCalendarEvents } = await import("../services/calendarService.js");
        const events = await getUserCalendarEvents(userId, startDate, endDate);

        res.json({ events });

    } catch (error) {
        console.error('Get calendar events error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch calendar events' });
    }
});

// Check calendar connection status
router.get("/status", authenticateInternal, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Import and use the calendar service
        const { hasConnectedCalendar } = await import("../services/calendarService.js");
        const connected = await hasConnectedCalendar(userId);

        res.json({
            connected,
            lastUpdated: connected ? new Date().toISOString() : null
        });

    } catch (error) {
        console.error('Check calendar status error:', error);
        res.status(500).json({ error: 'Failed to check calendar status' });
    }
});

export default router;