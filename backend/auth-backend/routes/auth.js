const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

/**
 * @module AuthRoutes
 * @description Express routes for user registration, login, and internal token generation.
 */

/**
 * Register a new user.
 * POST /api/auth/register
 *
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Object} 201 Created with { token, user }
 * @returns {Object} 400 Bad Request if validation fails or user exists
 * @returns {Object} 500 Internal Server Error on failure
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * Login a user.
 * POST /api/auth/login
 *
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Object} 200 OK with { token, user }
 * @returns {Object} 400 Bad Request if fields missing
 * @returns {Object} 401 Unauthorized if invalid credentials
 * @returns {Object} 500 Internal Server Error on failure
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await User.comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * Generate an internal JWT token for server-to-server operations.
 * POST /api/auth/internal-token
 * Requires authentication.
 *
 * @param {string} Authorization - Bearer token
 * @returns {Object} 200 OK with { internalToken }
 * @returns {Object} 403 Forbidden if token invalid
 * @returns {Object} 500 Internal Server Error on failure
 */
router.post('/internal-token', authenticateToken, async (req, res) => {
    try {
        const internalToken = jwt.sign(
            { userId: req.user.id, internal: true },
            process.env.INTERNAL_JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ internalToken });
    } catch (error) {
        console.error('Internal token generation error:', error);
        res.status(500).json({ error: 'Failed to generate internal token' });
    }
});

/**
 * Get all users (requires authentication).
 * GET /api/auth/users
 *
 * @returns {Object} 200 OK with { users: Array<Object> }
 * @returns {Object} 500 Internal Server Error on failure
 */
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

/**
 * Get all users (public, no authentication required).
 * GET /api/auth/all
 *
 * @returns {Object} 200 OK with { users: Array<Object> }
 * @returns {Object} 500 Internal Server Error on failure
 */
router.get('/all', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

module.exports = router;
