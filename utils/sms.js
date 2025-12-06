const fetch = require('node-fetch');
const logger = require('./logger');

// Termii SMS Configuration
const TERMII_API_KEY = process.env.TERMII_API_KEY || '';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'KDIH';
const TERMII_API_URL = 'https://api.ng.termii.com/api/sms/send';

/**
 * Send SMS using Termii API
 * @param {string} phoneNumber - Phone number (with country code, e.g., +2348012345678)
 * @param {string} message - SMS message content
 * @returns {Promise<boolean>} - Success status
 */
async function sendSMS(phoneNumber, message) {
    // Skip if no API key configured
    if (!TERMII_API_KEY) {
        logger.warn('Termii API key not configured. SMS not sent.');
        return false;
    }

    // Clean phone number (remove spaces, ensure + prefix)
    const cleanedPhone = phoneNumber.replace(/\s/g, '');
    const formattedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone}`;

    try {
        const response = await fetch(TERMII_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: formattedPhone,
                from: TERMII_SENDER_ID,
                sms: message,
                type: 'plain',
                channel: 'generic',
                api_key: TERMII_API_KEY
            })
        });

        const data = await response.json();

        if (response.ok && data.message_id) {
            logger.info(`SMS sent successfully to ${formattedPhone}`);
            return true;
        } else {
            logger.error('Failed to send SMS:', data);
            return false;
        }
    } catch (error) {
        logger.error('Error sending SMS:', error);
        return false;
    }
}

/**
 * Send payment confirmation SMS
 */
async function sendPaymentConfirmationSMS(phoneNumber, name, service, amount) {
    const message = `Hi ${name}, your payment of ₦${amount} for ${service} at KDIH has been confirmed. Thank you!`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send booking cancellation SMS
 */
async function sendCancellationSMS(phoneNumber, name, service, reason = 'unpaid') {
    const message = `Hi ${name}, your ${service} booking at KDIH has been cancelled due to non-payment within 3 hours. Please rebook if needed.`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send payment reminder SMS
 */
async function sendPaymentReminderSMS(phoneNumber, name, service, amount, minutesLeft) {
    const message = `Hi ${name}, reminder: You have ${minutesLeft} minutes to complete your ₦${amount} payment for ${service} at KDIH. Book at kdih.org`;
    return await sendSMS(phoneNumber, message);
}

module.exports = {
    sendSMS,
    sendPaymentConfirmationSMS,
    sendCancellationSMS,
    sendPaymentReminderSMS
};
