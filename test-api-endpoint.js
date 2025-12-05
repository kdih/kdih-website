const http = require('http');

const today = new Date().toISOString().split('T')[0];
const tomorrow = '2025-11-29';

console.log(`Testing with dates: today=${today}, tomorrow=${tomorrow}`);

function testEndpoint(date) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/coworking/available-desks/${date}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`\n=== Response for ${date} ===`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    console.log('Parsed Response:', JSON.stringify(parsed, null, 2));

                    if (parsed.desks) {
                        const bookedCount = parsed.desks.filter(d => d.status === 'booked').length;
                        const availableCount = parsed.desks.filter(d => d.status === 'available').length;
                        console.log(`Summary: ${bookedCount} booked, ${availableCount} available`);
                    }
                } catch (e) {
                    console.log('Raw Response:', data);
                    console.log('Parse Error:', e.message);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

(async () => {
    await testEndpoint(today);
    await testEndpoint(tomorrow);
})();
