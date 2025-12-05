const http = require('http');

// Configuration
const API_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test-payment@kdih.com';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTest() {
    console.log('🚀 Starting Payment Flow Test...\n');

    try {
        // Step 1: Initialize Payment
        console.log('1️⃣  Initializing Payment...');
        const initResponse = await makeRequest('POST', '/payments/initialize', {
            email: TEST_EMAIL,
            amount: 5000,
            payment_type: 'course_enrollment',
            metadata: {
                course_id: 1,
                user_id: 1
            }
        });

        if (initResponse.status !== 200) {
            throw new Error(`Initialization failed: ${JSON.stringify(initResponse.data)}`);
        }

        console.log('✅ Payment Initialized!');
        console.log(`   Reference: ${initResponse.data.reference}`);
        console.log(`   Auth URL: ${initResponse.data.authorization_url}\n`);

        const reference = initResponse.data.reference;

        // Step 2: Verify Payment
        console.log('2️⃣  Verifying Payment...');
        // Simulate user completing payment and returning to verify URL
        const verifyResponse = await makeRequest('GET', `/payments/verify/${reference}`);

        if (verifyResponse.status !== 200) {
            throw new Error(`Verification failed: ${JSON.stringify(verifyResponse.data)}`);
        }

        console.log('✅ Payment Verified!');
        console.log(`   Status: ${verifyResponse.data.data.status}`);
        console.log(`   Amount: ${verifyResponse.data.data.amount}`);
        console.log(`   Paid At: ${verifyResponse.data.data.paid_at}\n`);

        console.log('🎉 Payment Flow Test PASSED Successfully!');

    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        process.exit(1);
    }
}

runTest();
