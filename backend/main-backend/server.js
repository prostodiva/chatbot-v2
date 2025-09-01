/**
 * Main Backend Server for AI Personal Assistant
 *
 * This is the core backend server that handles:
 * - AI chat functionality and responses
 * - Google Calendar integration
 * - Vector search and embeddings
 * - SMS notifications
 * - Scheduled tasks and notifications
 *
 * ## Architecture Overview
 * - **Express.js Server**: RESTful API with middleware
 * - **Service Layer**: Business logic separated into service modules
 * - **Route Layer**: API endpoints organized by functionality
 * - **Database Integration**: PostgreSQL with vector search capabilities
 * - **External APIs**: Google Calendar, OpenAI, Twilio SMS
 *

## Environment Variables Required
* - `DATABASE_URL`: PostgreSQL connection string
* - `GOOGLE_CLIENT_ID`: Google OAuth client ID
* - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
* - `BASE_URL`: Application base URL
* - `TWILIO_ACCOUNT_SID`: Twilio SMS account SID
* - `TWILIO_AUTH_TOKEN`: Twilio SMS auth token
* - `TWILIO_PHONE_NUMBER`: Twilio phone number for SMS
                                                   * - `USER_PHONE_NUMBER`: User's phone number for notifications
* - `PORT`: Server port (defaults to 3001)
*
* ## API Endpoints
* - `/api` - AI chat and conversation endpoints
* - `/api/calendar` - Google Calendar integration
* - `/api/test` - Testing and health check endpoints
*
* @author Margarita Kattsyna
* @see {@link ./routes/aiRoutes.js} - AI chat functionality
* @see {@link ./routes/calendarRoutes.js} - Calendar integration
* @see {@link ./services/aiService.js} - AI response generation
* @see {@link ./services/calendarService.js} - Calendar operations
*/

import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import aiRoutes from './routes/aiRoutes.js';
import calendarRoutes from "./routes/calendarRoutes.js";
import testRoutes from './routes/testRoutes.js';
import { startScheduleNotifications } from './services/schedulerService.js';

const app = express();


// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());


// Routes
app.use('/api', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/test', testRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'AI Backend API' });
});

startScheduleNotifications();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});