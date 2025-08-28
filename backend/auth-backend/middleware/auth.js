const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate incoming requests using JWT.
 * Adds the authenticated user to `req.user` if the token is valid.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Calls `next()` if authenticated; otherwise responds with 401/403
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token userId:', decoded.userId);

        const user = await User.findById(decoded.userId);
        console.log('Found user:', user);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

/**
 * Generates a JWT token for a user.
 *
 * @param {number} userId - The ID of the user
 * @returns {string} JWT token valid for 24 hours
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Generates an internal JWT token for server-to-server or internal operations.
 *
 * @param {number} userId - The ID of the user
 * @returns {string} JWT token valid for 1 hour, includes `internal: true` flag
 */
const generateInternalToken = (userId) => {
    return jwt.sign(
        {
            userId,
            internal: true,
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        },
        process.env.INTERNAL_JWT_SECRET
    );
};

module.exports = { authenticateToken, generateToken, generateInternalToken };
