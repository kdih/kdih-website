const https = require('https');
const logger = require('./logger');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize payment
async function initializePayment(email, amount, metadata = {}) {
    return new Promise((resolve, reject) => {
        const params = JSON.stringify({
            email,
            amount: amount * 100, // Convert to kobo
            metadata,
            callback_url: `${process.env.APP_URL}/payment/verify`
        });

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(params)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status) {
                        logger.info(`Payment initialized: ${response.data.reference}`);
                        resolve(response.data);
                    } else {
                        logger.error(`Payment initialization failed: ${response.message}`);
                        reject(new Error(response.message));
                    }
                } catch (error) {
                    logger.error(`Payment response parse error: ${error.message}`);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            logger.error(`Payment request error: ${error.message}`);
            reject(error);
        });

        req.write(params);
        req.end();
    });
}

// Verify payment
async function verifyPayment(reference) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status && response.data.status === 'success') {
                        logger.info(`Payment verified: ${reference}`);
                        resolve(response.data);
                    } else {
                        logger.warn(`Payment verification failed: ${reference}`);
                        reject(new Error('Payment verification failed'));
                    }
                } catch (error) {
                    logger.error(`Payment verification parse error: ${error.message}`);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            logger.error(`Payment verification request error: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

// Verify webhook signature
function verifyWebhookSignature(rawBody, signature) {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest('hex');
    return hash === signature;
}

module.exports = {
    initializePayment,
    verifyPayment,
    verifyWebhookSignature
};
