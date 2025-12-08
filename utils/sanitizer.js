/**
 * KDIH Security Sanitizer Module
 * Protects against XSS, SQL Injection, and other input-based attacks
 */

const xss = require('xss');
const validator = require('validator');

// XSS filter options
const xssOptions = {
    whiteList: {
        // Allow only basic formatting - no scripts, no event handlers
        b: [],
        i: [],
        u: [],
        strong: [],
        em: [],
        br: [],
        p: [],
        ul: [],
        ol: [],
        li: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed']
};

const sanitizer = {
    /**
     * Sanitize a string to prevent XSS attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} - Sanitized string
     */
    sanitizeString(input) {
        if (typeof input !== 'string') return input;
        return xss(input, xssOptions);
    },

    /**
     * Sanitize an email address
     * @param {string} email - Email to validate and sanitize
     * @returns {string|null} - Sanitized email or null if invalid
     */
    sanitizeEmail(email) {
        if (!email || typeof email !== 'string') return null;
        const trimmed = email.trim().toLowerCase();
        return validator.isEmail(trimmed) ? validator.normalizeEmail(trimmed) : null;
    },

    /**
     * Sanitize a phone number
     * @param {string} phone - Phone number to sanitize
     * @returns {string} - Sanitized phone number
     */
    sanitizePhone(phone) {
        if (!phone || typeof phone !== 'string') return '';
        // Keep only digits, plus sign, spaces, and hyphens
        return phone.replace(/[^\d+\s\-()]/g, '').trim();
    },

    /**
     * Sanitize a URL
     * @param {string} url - URL to validate and sanitize
     * @returns {string|null} - Sanitized URL or null if invalid
     */
    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();

        // Prevent javascript: and data: URLs
        if (/^(javascript|data|vbscript):/i.test(trimmed)) {
            return null;
        }

        return validator.isURL(trimmed, {
            protocols: ['http', 'https'],
            require_protocol: false
        }) ? trimmed : null;
    },

    /**
     * Sanitize an integer
     * @param {any} value - Value to convert to safe integer
     * @param {number} defaultValue - Default value if conversion fails
     * @returns {number} - Safe integer
     */
    sanitizeInteger(value, defaultValue = 0) {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    },

    /**
     * Sanitize an object recursively
     * @param {object} obj - Object to sanitize
     * @returns {object} - Sanitized object
     */
    sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        const sanitized = Array.isArray(obj) ? [] : {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    },

    /**
     * Express middleware to sanitize request body
     */
    sanitizeBody(req, res, next) {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizer.sanitizeObject(req.body);
        }
        next();
    },

    /**
     * Express middleware to sanitize query parameters
     */
    sanitizeQuery(req, res, next) {
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizer.sanitizeObject(req.query);
        }
        next();
    },

    /**
     * Validate and sanitize common fields for forms
     * @param {object} data - Form data to validate
     * @param {object} rules - Validation rules { fieldName: 'type' }
     * @returns {object} - { valid: boolean, data: object, errors: array }
     */
    validateFormData(data, rules) {
        const errors = [];
        const sanitized = {};

        for (const [field, type] of Object.entries(rules)) {
            const value = data[field];

            switch (type) {
                case 'email':
                    const email = this.sanitizeEmail(value);
                    if (!email && rules[field + '_required'] !== false) {
                        errors.push(`Invalid email address: ${field}`);
                    }
                    sanitized[field] = email || '';
                    break;

                case 'phone':
                    sanitized[field] = this.sanitizePhone(value);
                    break;

                case 'url':
                    const url = this.sanitizeUrl(value);
                    if (!url && value) {
                        errors.push(`Invalid URL: ${field}`);
                    }
                    sanitized[field] = url || '';
                    break;

                case 'integer':
                    sanitized[field] = this.sanitizeInteger(value);
                    break;

                case 'string':
                default:
                    sanitized[field] = this.sanitizeString(value || '');
                    break;
            }
        }

        return {
            valid: errors.length === 0,
            data: sanitized,
            errors
        };
    },

    /**
     * Check for potential SQL injection patterns
     * @param {string} input - Input to check
     * @returns {boolean} - True if suspicious pattern detected
     */
    hasSQLInjection(input) {
        if (typeof input !== 'string') return false;

        const patterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
            /(--|#|\/\*|\*\/)/,
            /(\bOR\b|\bAND\b).*=.*(--|'|")/i,
            /(\bunion\b.*\bselect\b)/i,
            /('|").*(\bor\b|\band\b).*('|")/i
        ];

        return patterns.some(pattern => pattern.test(input));
    },

    /**
     * Escape HTML entities
     * @param {string} input - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(input) {
        if (typeof input !== 'string') return input;
        return validator.escape(input);
    },

    /**
     * Unescape HTML entities
     * @param {string} input - String to unescape
     * @returns {string} - Unescaped string
     */
    unescapeHtml(input) {
        if (typeof input !== 'string') return input;
        return validator.unescape(input);
    }
};

module.exports = sanitizer;
