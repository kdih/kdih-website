/**
 * JWT Authentication Middleware for Mobile Apps
 * Provides token-based authentication for the KDIH mobile admin app
 */

const jwt = require('jsonwebtoken');
const logger = require('./logger');

// JWT Secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'kdih-mobile-app-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token valid for 7 days

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, username, role, email
 * @returns {string} JWT token
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        logger.warn(`JWT verification failed: ${error.message}`);
        return null;
    }
}

/**
 * Middleware to require JWT authentication
 * Extracts token from Authorization header (Bearer <token>)
 */
function requireJwtAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = decoded;
    next();
}

/**
 * Middleware that allows both session and JWT authentication
 * Useful for endpoints that need to work with both web and mobile
 */
function requireAuthAny(req, res, next) {
    // First check session (web auth)
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }

    // Then check JWT (mobile auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (decoded) {
            req.user = decoded;
            return next();
        }
    }

    return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = {
    generateToken,
    verifyToken,
    requireJwtAuth,
    requireAuthAny,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
