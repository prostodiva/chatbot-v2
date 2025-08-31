import express from 'express';
import { authenticateInternal } from '../middleware/internalAuth.js';
import getPool from '../config/database.js';

const router = express.Router();

// Update user's phone number
router.put('/phone', authenticateInternal, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const userId = req.user.id;

        const pool = getPool();
        await pool.query(
            'UPDATE users SET phone_number = $1 WHERE id = $2',
            [phoneNumber, userId]
        );

        res.json({ success: true, message: 'Phone number updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;