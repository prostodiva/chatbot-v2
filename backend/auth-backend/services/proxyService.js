const axios = require('axios');
const { generateInternalToken } = require('../middleware/auth');

/**
 * @class ProxyService
 * @description Service to forward HTTP requests from the auth-backend
 * to the main-backend. Automatically attaches an internal JWT token,
 * user info headers, and handles errors from the main-backend.
 */
class ProxyService {
    /**
     * Proxy a request to the main-backend.
     * Requires `req.user` to be populated by authentication middleware.
     *
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @returns {Promise<void>} Forwards response from main-backend or sends 500 on error
     */
    static async proxyToMainBackend(req, res, next) {
        try {
            // Generate internal token
            const internalToken = generateInternalToken(req.user.id);

            // Prepare headers
            const headers = {
                'Authorization': `Bearer ${internalToken}`,
                'Content-Type': 'application/json',
                'X-User-ID': req.user.id,
                'X-Proxy-From': 'auth-backend',
                'X-Request-ID': Date.now().toString()
            };

            // Forward request to Main Backend
            const response = await axios({
                method: req.method,
                url: `${process.env.MAIN_BACKEND_URL}${req.path}`,
                headers,
                data: req.body,
                params: req.query,
                timeout: 30000
            });

            console.log(`Auth Backend: Proxied ${req.method} ${req.path} -> ${response.status}`);

            res.status(response.status).json(response.data);

        } catch (error) {
            console.error('Auth Backend: Proxy error:', error.message);

            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            } else {
                res.status(500).json({ error: 'Proxy service error' });
            }
        }
    }
}

module.exports = ProxyService;
