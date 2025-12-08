/**
 * KDIH Website Security Test Suite
 * Run: node security-test.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// ANSI color codes
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = {
    pass: (msg) => console.log(`${colors.green}✓ PASS${colors.reset}: ${msg}`),
    fail: (msg) => console.log(`${colors.red}✗ FAIL${colors.reset}: ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠ WARN${colors.reset}: ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ INFO${colors.reset}: ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

// Helper function to make HTTP requests
function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const protocol = url.protocol === 'https:' ? https : http;

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = protocol.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// Test Results Storage
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// ===== TEST FUNCTIONS =====

async function testSecurityHeaders() {
    log.header('Security Headers Test');

    try {
        const res = await request('GET', '/');
        const headers = res.headers;

        // Check required security headers
        const requiredHeaders = {
            'x-frame-options': 'DENY',
            'x-content-type-options': 'nosniff',
            'x-xss-protection': '1; mode=block',
            'referrer-policy': 'strict-origin-when-cross-origin'
        };

        for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
            if (headers[header]) {
                if (headers[header].toLowerCase().includes(expectedValue.split(';')[0].toLowerCase())) {
                    log.pass(`${header}: ${headers[header]}`);
                    results.passed++;
                } else {
                    log.warn(`${header}: ${headers[header]} (expected: ${expectedValue})`);
                    results.warnings++;
                }
            } else {
                log.fail(`Missing header: ${header}`);
                results.failed++;
            }
        }

        // Check for leaked headers
        if (headers['x-powered-by']) {
            log.fail(`X-Powered-By header exposed: ${headers['x-powered-by']}`);
            results.failed++;
        } else {
            log.pass('X-Powered-By header not exposed');
            results.passed++;
        }

        // Check CSP
        if (headers['content-security-policy']) {
            log.pass('Content-Security-Policy is set');
            results.passed++;
        } else {
            log.warn('Content-Security-Policy not set');
            results.warnings++;
        }

    } catch (error) {
        log.fail(`Request failed: ${error.message}`);
        results.failed++;
    }
}

async function testRateLimiting() {
    log.header('Rate Limiting Test');

    try {
        // Test login rate limit (should be 5 attempts)
        let blockedAt = 0;

        for (let i = 0; i < 10; i++) {
            const res = await request('POST', '/api/login', {
                username: 'testuser',
                password: 'wrongpassword' + i
            });

            if (res.status === 429) {
                blockedAt = i + 1;
                break;
            }
        }

        if (blockedAt > 0 && blockedAt <= 6) {
            log.pass(`Login rate limiting triggered after ${blockedAt} attempts`);
            results.passed++;
        } else if (blockedAt > 6) {
            log.warn(`Rate limiting triggered at ${blockedAt} attempts (expected ~5)`);
            results.warnings++;
        } else {
            log.fail('Rate limiting not triggered after 10 login attempts');
            results.failed++;
        }

    } catch (error) {
        log.fail(`Rate limit test failed: ${error.message}`);
        results.failed++;
    }
}

async function testSQLInjection() {
    log.header('SQL Injection Test');

    const payloads = [
        "' OR '1'='1",
        "'; DROP TABLE users;--",
        "1 OR 1=1",
        "admin'--"
    ];

    for (const payload of payloads) {
        try {
            const res = await request('POST', '/api/login', {
                username: payload,
                password: payload
            });

            if (res.status === 200 && res.body.includes('authenticated')) {
                log.fail(`SQL Injection successful with: ${payload}`);
                results.failed++;
            } else {
                log.pass(`SQL Injection blocked: ${payload.substring(0, 20)}...`);
                results.passed++;
            }
        } catch (error) {
            log.pass(`SQL Injection caused error (safe): ${payload.substring(0, 20)}...`);
            results.passed++;
        }
    }
}

async function testXSSInjection() {
    log.header('XSS Injection Test');

    const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg onload=alert(1)>'
    ];

    for (const payload of xssPayloads) {
        try {
            const res = await request('POST', '/api/contact', {
                name: payload,
                email: 'test@test.com',
                message: 'Security test'
            });

            // If the payload is stored and returned unescaped, it's vulnerable
            // We can't fully test this without viewing the admin dashboard
            log.info(`XSS payload submitted: ${payload.substring(0, 30)}... - Check admin dashboard for execution`);

        } catch (error) {
            log.pass(`XSS payload rejected: ${error.message}`);
            results.passed++;
        }
    }

    log.warn('Manual verification required: Check admin dashboard for XSS execution');
    results.warnings++;
}

async function testAuthorizationBypass() {
    log.header('Authorization Bypass Test');

    const protectedEndpoints = [
        '/api/admin/members',
        '/api/admin/users',
        '/api/admin/dashboard',
        '/api/jobs',
        '/api/admin/messages'
    ];

    for (const endpoint of protectedEndpoints) {
        try {
            const res = await request('GET', endpoint);

            if (res.status === 401 || res.status === 403) {
                log.pass(`${endpoint} - Protected (${res.status})`);
                results.passed++;
            } else if (res.status === 404) {
                log.info(`${endpoint} - Not found (may not exist)`);
            } else {
                log.fail(`${endpoint} - Accessible without auth (${res.status})`);
                results.failed++;
            }
        } catch (error) {
            log.fail(`${endpoint} - Error: ${error.message}`);
            results.failed++;
        }
    }
}

async function testSensitiveFileAccess() {
    log.header('Sensitive File Access Test');

    const sensitiveFiles = [
        '/.env',
        '/.git/config',
        '/database.js',
        '/kdih.db',
        '/server.js',
        '/package.json',
        '/node_modules/',
        '/.gitignore'
    ];

    for (const file of sensitiveFiles) {
        try {
            const res = await request('GET', file);

            if (res.status === 404 || res.status === 403) {
                log.pass(`${file} - Not accessible (${res.status})`);
                results.passed++;
            } else {
                log.fail(`${file} - Accessible (${res.status})`);
                results.failed++;
            }
        } catch (error) {
            log.pass(`${file} - Error accessing (safe)`);
            results.passed++;
        }
    }
}

async function testDirectoryTraversal() {
    log.header('Directory Traversal Test');

    const payloads = [
        '/../../../etc/passwd',
        '/..%2F..%2F..%2Fetc/passwd',
        '/uploads/../database.js',
        '/public/../../.env'
    ];

    for (const payload of payloads) {
        try {
            const res = await request('GET', payload);

            if (res.status === 200 && (res.body.includes('root:') || res.body.includes('require('))) {
                log.fail(`Directory traversal successful: ${payload}`);
                results.failed++;
            } else {
                log.pass(`Directory traversal blocked: ${payload}`);
                results.passed++;
            }
        } catch (error) {
            log.pass(`Directory traversal caused error (safe): ${payload}`);
            results.passed++;
        }
    }
}

async function testErrorHandling() {
    log.header('Error Handling Test');

    try {
        // Invalid JSON
        const res = await request('POST', '/api/login', null, {
            'Content-Type': 'application/json'
        });

        if (res.body.includes('stack') || res.body.includes('at ')) {
            log.fail('Stack trace exposed in error response');
            results.failed++;
        } else {
            log.pass('Stack traces not exposed');
            results.passed++;
        }

        // Non-existent endpoint
        const res2 = await request('GET', '/api/nonexistent12345');

        if (res2.status === 404 && !res2.body.includes('stack')) {
            log.pass('404 handled without stack trace');
            results.passed++;
        } else {
            log.warn('404 response may leak information');
            results.warnings++;
        }

    } catch (error) {
        log.info(`Error handling test: ${error.message}`);
    }
}

// Main test runner
async function runTests() {
    console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║           KDIH Website Security Test Suite            ║
║                    Penetration Testing                ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
Testing: ${BASE_URL}
Started: ${new Date().toISOString()}
`);

    try {
        await testSecurityHeaders();
        await testAuthorizationBypass();
        await testSensitiveFileAccess();
        await testDirectoryTraversal();
        await testSQLInjection();
        await testXSSInjection();
        await testErrorHandling();
        await testRateLimiting();
    } catch (error) {
        log.fail(`Test suite error: ${error.message}`);
    }

    // Print summary
    console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║                    TEST SUMMARY                       ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
${colors.green}✓ Passed:   ${results.passed}${colors.reset}
${colors.red}✗ Failed:   ${results.failed}${colors.reset}
${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}

${results.failed === 0 ?
            colors.green + '🎉 All critical tests passed!' + colors.reset :
            colors.red + '⚠️  Security issues detected - review failed tests!' + colors.reset}
`);

    process.exit(results.failed > 0 ? 1 : 0);
}

runTests();
