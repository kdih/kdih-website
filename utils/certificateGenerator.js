/**
 * Certificate Number Generator Utility
 * 
 * Generates systematic and SECURE certificate numbers based on:
 * - Year of issue
 * - Course code (derived from course title)
 * - Sequential number per course per year
 * - Security checksum (prevents forgery/guessing)
 * 
 * Format: KDIH/YEAR/COURSE_CODE/SEQUENCE-CHECKSUM
 * Example: KDIH/2024/FSWD/001-A7X2
 * 
 * Security Features:
 * - 4-character cryptographic checksum appended to certificate number
 * - 16-character secure verification code (crypto-random)
 * - Checksum validates certificate authenticity
 */

const db = require('../database');
const crypto = require('crypto');

// Secret key for checksum generation (should be in environment variables in production)
const SECRET_KEY = process.env.CERT_SECRET_KEY || 'KDIH_CERT_2024_SECRET_KEY_v1';

// Course code mappings - derived from course titles
const COURSE_CODES = {
    // Technical Skills
    'Full Stack Web Development': 'FSWD',
    'Data Science & Analytics': 'DSA',
    'Cybersecurity Fundamentals': 'CYBER',
    'Mobile App Development (Flutter)': 'FLUTTER',
    'Cloud Computing (AWS)': 'AWS',
    'Python Programming': 'PYTHON',
    'JavaScript & Node.js': 'NODEJS',
    'Database Management': 'DBM',

    // Design
    'UI/UX Design Masterclass': 'UIUX',
    'Graphic Design & Branding': 'GDB',
    'Motion Graphics': 'MOTION',

    // Business Skills
    'Digital Marketing & Social Media': 'DM',
    'Business Analytics & Intelligence': 'BAI',
    'Entrepreneurship & Startup Management': 'ENTREP',
    'Project Management': 'PM',
    'Financial Literacy': 'FIN',

    // Social Innovation
    'Social Innovation & Ethics': 'SIE',
    'Leadership & Team Building': 'LTB'
};

/**
 * Generate a secure checksum for a certificate number
 * This prevents forging certificate numbers by guessing the sequence
 * @param {string} baseCertNumber - The certificate number without checksum
 * @returns {string} - 4-character uppercase alphanumeric checksum
 */
function generateChecksum(baseCertNumber) {
    const hash = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(baseCertNumber)
        .digest('hex');

    // Convert to alphanumeric (A-Z, 0-9) and take first 4 characters
    return hash
        .substring(0, 8)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, 'X')
        .substring(0, 4);
}

/**
 * Validate a certificate number's checksum
 * @param {string} fullCertNumber - The full certificate number with checksum
 * @returns {boolean} - True if checksum is valid
 */
function validateChecksum(fullCertNumber) {
    const parts = fullCertNumber.split('-');
    if (parts.length !== 2) return false;

    const baseCertNumber = parts[0];
    const providedChecksum = parts[1];
    const expectedChecksum = generateChecksum(baseCertNumber);

    return providedChecksum === expectedChecksum;
}

/**
 * Get course code from course title
 * @param {string} courseTitle - The full course title
 * @returns {string} - The course code (4-6 characters)
 */
function getCourseCode(courseTitle) {
    // Check if we have a mapping
    if (COURSE_CODES[courseTitle]) {
        return COURSE_CODES[courseTitle];
    }

    // Generate code from title (first letters of each word, max 6 chars)
    const words = courseTitle.replace(/[&()]/g, '').split(/\s+/).filter(w => w.length > 2);
    let code = words.map(w => w[0].toUpperCase()).join('');

    // Ensure code is between 2-6 characters
    if (code.length < 2) {
        code = courseTitle.substring(0, 4).toUpperCase().replace(/\s/g, '');
    }
    if (code.length > 6) {
        code = code.substring(0, 6);
    }

    return code;
}

/**
 * Generate the next sequential number for a course in a given year
 * @param {string} courseCode - The course code
 * @param {number} year - The year
 * @returns {Promise<number>} - The next sequence number
 */
function getNextSequenceNumber(courseCode, year) {
    return new Promise((resolve, reject) => {
        // Match pattern: KDIH/YEAR/COURSE_CODE/XXX-XXXX
        const pattern = `KDIH/${year}/${courseCode}/%`;

        db.get(
            `SELECT certificate_number FROM certificates 
             WHERE certificate_number LIKE ? 
             ORDER BY id DESC LIMIT 1`,
            [pattern],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(1);
                    return;
                }

                // Extract the sequence number (format: KDIH/YEAR/CODE/SEQ-CHECK)
                const parts = row.certificate_number.split('/');
                if (parts.length >= 4) {
                    const seqPart = parts[3].split('-')[0]; // Get SEQ before checksum
                    const lastSeq = parseInt(seqPart, 10) || 0;
                    resolve(lastSeq + 1);
                } else {
                    resolve(1);
                }
            }
        );
    });
}

/**
 * Generate a secure 16-character verification code
 * Uses cryptographically secure random bytes
 * @returns {string} - 16-character alphanumeric verification code
 */
function generateSecureVerificationCode() {
    // Generate 12 random bytes (gives us 24 hex chars, we'll use 16)
    const randomBytes = crypto.randomBytes(12);

    // Convert to base36 and format for readability (groups of 4)
    const code = randomBytes.toString('hex').toUpperCase().substring(0, 16);

    // Format: XXXX-XXXX-XXXX-XXXX for better readability
    return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}-${code.substring(12, 16)}`;
}

/**
 * Generate a systematic and secure certificate number
 * @param {string} courseTitle - The full course title
 * @param {number} studentId - The student/registration ID (optional, for logging)
 * @returns {Promise<object>} - Object containing certificate_number, verification_code, and metadata
 */
async function generateCertificateNumber(courseTitle, studentId = null) {
    const year = new Date().getFullYear();
    const courseCode = getCourseCode(courseTitle);
    const sequence = await getNextSequenceNumber(courseCode, year);

    // Format sequence with leading zeros (3 digits)
    const sequenceStr = sequence.toString().padStart(3, '0');

    // Create base certificate number
    const baseCertNumber = `KDIH/${year}/${courseCode}/${sequenceStr}`;

    // Generate security checksum
    const checksum = generateChecksum(baseCertNumber);

    // Final certificate number with security checksum
    const certificateNumber = `${baseCertNumber}-${checksum}`;

    // Generate secure verification code
    const verificationCode = generateSecureVerificationCode();

    return {
        certificate_number: certificateNumber,
        verification_code: verificationCode,
        course_code: courseCode,
        year,
        sequence,
        checksum,
        issue_date: new Date().toISOString().split('T')[0]
    };
}

/**
 * Parse a certificate number to extract components
 * @param {string} certificateNumber - The certificate number
 * @returns {object|null} - Parsed components or null if invalid
 */
function parseCertificateNumber(certificateNumber) {
    // Format: KDIH/YEAR/CODE/SEQ-CHECK
    const mainParts = certificateNumber.split('-');
    if (mainParts.length !== 2) return null;

    const parts = mainParts[0].split('/');
    if (parts.length !== 4 || parts[0] !== 'KDIH') {
        return null;
    }

    return {
        prefix: parts[0],
        year: parseInt(parts[1], 10),
        courseCode: parts[2],
        sequence: parseInt(parts[3], 10),
        checksum: mainParts[1],
        isValid: validateChecksum(certificateNumber)
    };
}

/**
 * Validate certificate number format AND checksum
 * @param {string} certificateNumber - The certificate number to validate
 * @returns {boolean} - True if valid format AND valid checksum
 */
function isValidCertificateNumber(certificateNumber) {
    // Pattern: KDIH/YEAR/CODE/SEQ-CHECK (e.g., KDIH/2024/FSWD/001-A7X2)
    const pattern = /^KDIH\/\d{4}\/[A-Z]{2,6}\/\d{3,5}-[A-Z0-9]{4}$/;

    if (!pattern.test(certificateNumber)) {
        return false;
    }

    // Also validate checksum
    return validateChecksum(certificateNumber);
}

/**
 * Validate verification code format
 * @param {string} code - The verification code
 * @returns {boolean} - True if valid format
 */
function isValidVerificationCode(code) {
    // Pattern: XXXX-XXXX-XXXX-XXXX (16 hex chars with dashes)
    const pattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return pattern.test(code);
}

module.exports = {
    generateCertificateNumber,
    getCourseCode,
    getNextSequenceNumber,
    parseCertificateNumber,
    isValidCertificateNumber,
    isValidVerificationCode,
    validateChecksum,
    generateChecksum,
    COURSE_CODES
};
