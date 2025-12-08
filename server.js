require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const apiRoutes = require('./routes/api');
const logger = require('./utils/logger');
const backup = require('./utils/backup');
const sanitizer = require('./utils/sanitizer');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.paystack.co", "https://unpkg.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline onclick handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.paystack.co"],
            frameSrc: ["'self'", "https://checkout.paystack.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

app.use('/api/login', authLimiter);

// Body parser middleware
// Body parser middleware
app.use(bodyParser.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// XSS Sanitization middleware - sanitize all incoming data
app.use(sanitizer.sanitizeBody);
app.use(sanitizer.sanitizeQuery);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip} - Body: ${JSON.stringify(req.body)}`);
    next();
});

// Static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0, // Cache for 1 day in production
    etag: true,
    lastModified: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0, // Cache uploads for 7 days
    etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    logger.warn(`404 - API endpoint not found: ${req.path}`);
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve custom 404 page for other routes
app.use((req, res, next) => {
    const notFoundPath = path.join(__dirname, 'public', '404.html');
    const fs = require('fs');

    if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    // Don't leak error details in production
    const errorResponse = process.env.NODE_ENV === 'production'
        ? { error: 'Internal server error' }
        : { error: err.message, stack: err.stack };

    res.status(err.status || 500).json(errorResponse);
});

// Start server only if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`Server is running on port ${PORT}`);

        // Initialize backup scheduler
        backup.scheduleBackups();
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
        logger.info('Shutting down gracefully...');
        server.close(() => {
            logger.info('Server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
