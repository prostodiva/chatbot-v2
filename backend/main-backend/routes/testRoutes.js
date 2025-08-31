import express from 'express';
import { sendScheduleSMS } from '../services/smsService.js';
import { authenticateInternal } from '../middleware/internalAuth.js';

const router = express.Router();

// Test endpoint to send SMS manually
router.post('/test-sms', authenticateInternal, async (req, res) => {
    try {
        const userId = req.user.id;
        const phoneNumber = req.body.phoneNumber || process.env.USER_PHONE_NUMBER;

        console.log('🧪 Testing SMS service...');
        console.log('  User ID:', userId);
        console.log('  Phone Number:', phoneNumber);

        const result = await sendScheduleSMS(userId, phoneNumber);

        res.json({
            success: true,
            message: 'Test SMS sent successfully!',
            twilioSid: result.sid
        });

    } catch (error) {
        console.error('❌ SMS test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;