import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL value:', process.env.DATABASE_URL);


console.log('=== Environment Variables Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('BASE_URL:', process.env.BASE_URL || 'NOT SET');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'SET' : 'NOT SET');
console.log('USER_PHONE_NUMBER:', process.env.USER_PHONE_NUMBER ? 'SET' : 'NOT SET');

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import aiRoutes from './routes/aiRoutes.js';
import calendarRoutes from "./routes/calendarRoutes.js";
import testRoutes from './routes/testRoutes.js';
import { startScheduleNotifications } from './services/schedulerService.js';

console.log('=== Environment Variables Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('BASE_URL:', process.env.BASE_URL || 'NOT SET');

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