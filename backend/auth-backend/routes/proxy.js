const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ProxyService = require('../services/proxyService');

// Proxy middleware for forwarding requests to Main Backend
router.use(authenticateToken, (req, res, next) => {
    ProxyService.proxyToMainBackend(req, res, next);
});

module.exports = router;