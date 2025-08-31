import cron from 'node-cron';
import { sendScheduleSMS } from './smsService.js';
import getPool from '../config/database.js';

export function startScheduleNotifications() {
    // Send schedule every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('⏰ 8:00 AM - Sending daily schedule notifications...');

        try {
            const pool = getPool();

            // Get all users with connected calendars
            const result = await pool.query(`
                SELECT DISTINCT uct.user_id, u.phone_number
                FROM user_calendar_tokens uct
                JOIN users u ON uct.user_id = u.id
                WHERE u.phone_number IS NOT NULL
            `);

            for (const row of result.rows) {
                try {
                    await sendScheduleSMS(row.user_id, row.phone_number);
                    console.log(`✅ Schedule sent to user ${row.user_id}`);
                } catch (error) {
                    console.error(`❌ Failed to send schedule to user ${row.user_id}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Schedule notification error:', error);
        }
    });

    console.log('⏰ Daily schedule notifications scheduled for 8:00 AM');
}