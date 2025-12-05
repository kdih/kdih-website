const http = require('http');

const data = JSON.stringify({
    full_name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    interest: 'Training'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/inquiry',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
