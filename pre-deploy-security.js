#!/usr/bin/env node

/**
 * KDIH Pre-Deployment Security Checklist
 * Run this before deploying to production: node pre-deploy-security.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI colors
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

const results = { passed: 0, failed: 0, warnings: 0 };

async function runChecks() {
    console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║        KDIH Pre-Deployment Security Checklist         ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
`);

    // ========== ENVIRONMENT CHECKS ==========
    log.header('Environment Configuration');

    // Check for .env file
    if (fs.existsSync('.env')) {
        log.pass('.env file exists');
        results.passed++;

        const envContent = fs.readFileSync('.env', 'utf8');

        // Check for required environment variables
        const requiredVars = [
            'SESSION_SECRET',
            'NODE_ENV',
            'PAYSTACK_SECRET_KEY',
            'EMAIL_USER',
            'EMAIL_PASS'
        ];

        for (const varName of requiredVars) {
            if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`) && !envContent.includes(`${varName}=your`)) {
                log.pass(`${varName} is configured`);
                results.passed++;
            } else {
                log.fail(`${varName} is missing or empty`);
                results.failed++;
            }
        }

        // Check if NODE_ENV is production
        if (envContent.includes('NODE_ENV=production')) {
            log.pass('NODE_ENV is set to production');
            results.passed++;
        } else {
            log.warn('NODE_ENV is not set to production');
            results.warnings++;
        }

        // Check session secret strength
        const sessionMatch = envContent.match(/SESSION_SECRET=(.+)/);
        if (sessionMatch) {
            const secret = sessionMatch[1].trim();
            if (secret.length >= 32) {
                log.pass('SESSION_SECRET is strong (32+ characters)');
                results.passed++;
            } else {
                log.fail(`SESSION_SECRET is weak (${secret.length} chars, need 32+)`);
                results.failed++;
            }
        }

    } else {
        log.fail('.env file does not exist');
        results.failed++;
    }

    // ========== DEFAULT CREDENTIALS ==========
    log.header('Default Credentials Check');

    try {
        const db = require('./database');

        await new Promise((resolve, reject) => {
            db.get("SELECT password FROM users WHERE username = 'admin'", async (err, row) => {
                if (err) {
                    log.warn('Could not check admin password: ' + err.message);
                    results.warnings++;
                    resolve();
                    return;
                }

                if (row) {
                    const bcrypt = require('bcrypt');
                    const isDefault = await bcrypt.compare('admin123', row.password);

                    if (isDefault) {
                        log.fail('CRITICAL: Default admin password is still in use!');
                        log.info('Run: node change-admin-password.js');
                        results.failed++;
                    } else {
                        log.pass('Admin password has been changed');
                        results.passed++;
                    }
                }
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.get("SELECT password FROM users WHERE username = 'superadmin'", async (err, row) => {
                if (err) {
                    resolve();
                    return;
                }

                if (row) {
                    const bcrypt = require('bcrypt');
                    const isDefault = await bcrypt.compare('superadmin123', row.password);

                    if (isDefault) {
                        log.fail('CRITICAL: Default superadmin password is still in use!');
                        results.failed++;
                    } else {
                        log.pass('Superadmin password has been changed');
                        results.passed++;
                    }
                }
                resolve();
            });
        });

    } catch (error) {
        log.warn('Could not check database credentials: ' + error.message);
        results.warnings++;
    }

    // ========== FILE SECURITY ==========
    log.header('File Security');

    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        const shouldIgnore = ['.env', 'node_modules', '*.db', 'logs'];

        for (const pattern of shouldIgnore) {
            if (gitignore.includes(pattern)) {
                log.pass(`.gitignore includes ${pattern}`);
                results.passed++;
            } else {
                log.warn(`.gitignore missing ${pattern}`);
                results.warnings++;
            }
        }
    } else {
        log.fail('.gitignore file missing');
        results.failed++;
    }

    // Check if sensitive files are protected
    const sensitiveFiles = ['.env', 'kdih.db', 'database.js'];
    for (const file of sensitiveFiles) {
        const publicPath = path.join('public', file);
        if (fs.existsSync(publicPath)) {
            log.fail(`Sensitive file ${file} exists in public directory!`);
            results.failed++;
        } else {
            log.pass(`${file} not exposed in public directory`);
            results.passed++;
        }
    }

    // ========== DEPENDENCY SECURITY ==========
    log.header('Dependency Security');

    // Check package.json for security-related packages
    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        const securityPackages = ['helmet', 'bcrypt', 'express-rate-limit', 'xss', 'validator'];
        for (const secPkg of securityPackages) {
            if (deps[secPkg]) {
                log.pass(`${secPkg} is installed`);
                results.passed++;
            } else {
                log.warn(`${secPkg} is not installed`);
                results.warnings++;
            }
        }
    }

    // ========== HTTPS/SSL CHECK ==========
    log.header('HTTPS/SSL Configuration');

    if (process.env.NODE_ENV === 'production') {
        log.info('In production, ensure HTTPS is configured at the proxy/load balancer level');
    }

    // Check if cookies are set to secure in production
    const serverJs = fs.readFileSync('server.js', 'utf8');
    if (serverJs.includes("secure: process.env.NODE_ENV === 'production'")) {
        log.pass('Session cookies are secure in production');
        results.passed++;
    } else {
        log.warn('Session cookie security may not be properly configured');
        results.warnings++;
    }

    // ========== CORS CONFIGURATION ==========
    log.header('CORS Configuration');

    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        if (envContent.includes('ALLOWED_ORIGINS=')) {
            const originsMatch = envContent.match(/ALLOWED_ORIGINS=(.+)/);
            if (originsMatch && originsMatch[1].trim() !== '*') {
                log.pass('CORS origins are configured (not wildcard)');
                results.passed++;
            } else {
                log.warn('CORS allows all origins (*) - restrict in production');
                results.warnings++;
            }
        } else {
            log.warn('ALLOWED_ORIGINS not set - defaults to wildcard');
            results.warnings++;
        }
    }

    // ========== UPLOADS DIRECTORY ==========
    log.header('Upload Security');

    if (fs.existsSync('uploads')) {
        log.pass('Uploads directory exists');
        results.passed++;

        // Check for index.html (prevent directory listing)
        if (fs.existsSync('uploads/index.html')) {
            log.pass('Uploads directory has index.html');
            results.passed++;
        } else {
            // Create a simple index.html to prevent directory listing
            fs.writeFileSync('uploads/index.html', '<!DOCTYPE html><html><head><title>Access Denied</title></head><body><h1>403 Forbidden</h1></body></html>');
            log.pass('Created index.html in uploads directory');
            results.passed++;
        }
    }

    // ========== DATABASE BACKUP ==========
    log.header('Database Backup');

    if (fs.existsSync('backups')) {
        const backups = fs.readdirSync('backups').filter(f => f.endsWith('.db'));
        if (backups.length > 0) {
            log.pass(`${backups.length} database backup(s) found`);
            results.passed++;
        } else {
            log.warn('No database backups found - run backup before deployment');
            results.warnings++;
        }
    } else {
        log.warn('Backups directory does not exist');
        results.warnings++;
    }

    // ========== SUMMARY ==========
    console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║                   SECURITY SUMMARY                    ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
${colors.green}✓ Passed:   ${results.passed}${colors.reset}
${colors.red}✗ Failed:   ${results.failed}${colors.reset}
${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}

${results.failed === 0 ?
            colors.green + colors.bold + '✅ Ready for deployment!' + colors.reset :
            colors.red + colors.bold + '❌ Fix critical issues before deployment!' + colors.reset}

${results.warnings > 0 ? colors.yellow + '⚠️  Review warnings for best security practices.' + colors.reset : ''}
`);

    // Generate secure session secret if needed
    if (results.failed > 0) {
        console.log(`
${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
${colors.bold}Quick Fixes:${colors.reset}

1. Generate a secure session secret:
   ${colors.yellow}SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}${colors.reset}

2. Change admin password:
   ${colors.yellow}node change-admin-password.js${colors.reset}

3. Set NODE_ENV for production:
   ${colors.yellow}NODE_ENV=production${colors.reset}
${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);
    }

    process.exit(results.failed > 0 ? 1 : 0);
}

runChecks().catch(err => {
    console.error('Error running security checks:', err);
    process.exit(1);
});
