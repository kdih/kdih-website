const http = require('http');

// 1. Login as Admin
const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = http.request(loginOptions, (res) => {
    console.log(`Login StatusCode: ${res.statusCode}`);

    const cookies = res.headers['set-cookie'];

    if (res.statusCode === 200 && cookies) {
        console.log('Login successful. Proceeding to create member...');
        createMember(cookies);
    } else {
        console.error('Login failed.');
    }
});

req.write(loginData);
req.end();

function createMember(cookies) {
    const memberData = JSON.stringify({
        full_name: 'Quick Add Test',
        email: `quicktest${Date.now()}@example.com`,
        phone: '08012345678',
        member_type: 'student'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/members/quick-add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': memberData.length,
            'Cookie': cookies
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Quick Add StatusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.write(memberData);
    req.end();
}
