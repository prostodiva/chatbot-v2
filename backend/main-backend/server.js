import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variables Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('BASE_URL:', process.env.BASE_URL || 'NOT SET');

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import aiRoutes from './routes/aiRoutes.js';
import calendarRoutes from "./routes/calendarRoutes.js";

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


app.get('/', (req, res) => {
    res.json({ message: 'AI Backend API' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});