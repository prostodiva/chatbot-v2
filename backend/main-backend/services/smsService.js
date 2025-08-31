import twilio from 'twilio';
import env from '../config/env.js';
import { getUserCalendarEvents } from './calendarService.js';

console.log(' Twilio Environment Variables:');
console.log('  TWILIO_ACCOUNT_SID:', env.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING');
console.log('  TWILIO_AUTH_TOKEN:', env.TWILIO_AUTH_TOKEN ? 'SET' : 'MISSING');
console.log('  TWILIO_PHONE_NUMBER:', env.TWILIO_PHONE_NUMBER ? 'SET' : 'MISSING');
console.log('  USER_PHONE_NUMBER:', env.USER_PHONE_NUMBER ? 'SET' : 'MISSING');

const client = twilio(
    env.TWILIO_ACCOUNT_SID,
    env.TWILIO_AUTH_TOKEN
);

export async function sendScheduleSMS(userId, phoneNumber) {
    try {
        // Get today's schedule
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const events = await getUserCalendarEvents(
            userId,
            today.toISOString(),
            tomorrow.toISOString()
        );

        // Format the message
        const message = formatScheduleMessage(events, today);

        // Send SMS
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`�� Schedule SMS sent: ${result.sid}`);
        return result;

    } catch (error) {
        console.error('SMS sending error:', error);
        throw error;
    }
}

function formatScheduleMessage(events, date) {
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    if (events.length === 0) {
        return `${dateStr}\n\nNo events scheduled for today. Enjoy your free time!`;
    }

    let message = `�� ${dateStr}\n\nYour schedule for today:\n\n`;

    events.forEach((event, index) => {
        const startTime = new Date(event.start.dateTime || event.start.date)
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

        message += `${index + 1}. ${event.summary}\n`;
        message += `   🕐 ${startTime}\n`;

        if (event.description) {
            message += ` ${event.description}\n`;
        }

        message += '\n';
    });

    message += `You have ${events.length} event(s) today. Good luck! `;

    return message;
}