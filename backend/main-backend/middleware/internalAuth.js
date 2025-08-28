const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateInternal = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        console.log('=== Internal Auth Debug ===');
        console.log('Auth header:', authHeader);
        console.log('Token:', token);

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ error: 'Internal token required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.INTERNAL_JWT_SECRET);
            console.log('Decoded token:', decoded);
            console.log('INTERNAL_JWT_SECRET length:', process.env.INTERNAL_JWT_SECRET.length);

            // Verify it's an internal token
            if (!decoded.internal) {
                console.log('Token missing internal flag:', decoded);
                return res.status(401).json({ error: 'Invalid internal token' });
            }

            console.log('Token verification successful');
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return res.status(403).json({ error: 'Invalid internal token' });
        }
    } catch (error) {
        console.error('Internal auth error:', error);
        return res.status(403).json({ error: 'Invalid internal token' });
    }
};

module.exports = { authenticateInternal };