#!/usr/bin/env node
/**
 * KDIH Admin Password Reset Script
 * Resets passwords for admin and superadmin users
 * Run: node reset-admin-passwords.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');

// Database path
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

// ANSI colors
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Generate a secure random password
function generateSecurePassword(length = 16) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += chars[randomBytes[i] % chars.length];
    }
    return password;
}

async function resetPasswords() {
    console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║          KDIH Admin Password Reset Utility            ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
`);

    const users = [
        { username: 'admin', role: 'admin' },
        { username: 'superadmin', role: 'super_admin' }
    ];

    const credentials = [];

    for (const user of users) {
        try {
            // Generate new secure password
            const newPassword = generateSecurePassword(16);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE users SET password = ? WHERE username = ?',
                    [hashedPassword, user.username],
                    function (err) {
                        if (err) {
                            console.log(`${colors.red}✗ Error updating ${user.username}: ${err.message}${colors.reset}`);
                            reject(err);
                            return;
                        }

                        if (this.changes === 0) {
                            console.log(`${colors.yellow}⚠ User ${user.username} not found in database${colors.reset}`);
                        } else {
                            console.log(`${colors.green}✓ Password reset for: ${user.username}${colors.reset}`);
                            credentials.push({
                                username: user.username,
                                password: newPassword,
                                role: user.role
                            });
                        }
                        resolve();
                    }
                );
            });
        } catch (error) {
            console.error(`Error processing ${user.username}:`, error.message);
        }
    }

    // Display new credentials
    if (credentials.length > 0) {
        console.log(`
${colors.bold}${colors.blue}
╔═══════════════════════════════════════════════════════╗
║              NEW ADMIN CREDENTIALS                    ║
║         ⚠️  SAVE THESE SECURELY - SHOWN ONCE ONLY ⚠️    ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
`);

        for (const cred of credentials) {
            console.log(`${colors.bold}${cred.role.toUpperCase()}${colors.reset}`);
            console.log(`  Username: ${colors.green}${cred.username}${colors.reset}`);
            console.log(`  Password: ${colors.yellow}${cred.password}${colors.reset}`);
            console.log('');
        }

        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}Important:${colors.reset}`);
        console.log(`  1. Copy these credentials to a secure location`);
        console.log(`  2. Test login at: ${colors.blue}http://localhost:3000/admin/login.html${colors.reset}`);
        console.log(`  3. Change password after first login if needed`);
        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

        // Save to a temporary file (will be deleted after viewing)
        const fs = require('fs');
        const credsFile = path.join(__dirname, '.admin-credentials-temp.txt');
        const credsContent = credentials.map(c =>
            `${c.role}\n  Username: ${c.username}\n  Password: ${c.password}`
        ).join('\n\n');

        fs.writeFileSync(credsFile, `KDIH Admin Credentials\nGenerated: ${new Date().toISOString()}\n\n${credsContent}\n\n⚠️ DELETE THIS FILE AFTER SAVING CREDENTIALS SECURELY!`);
        console.log(`${colors.yellow}Credentials also saved to: ${credsFile}${colors.reset}`);
        console.log(`${colors.red}⚠️  DELETE THIS FILE AFTER COPYING CREDENTIALS!${colors.reset}
`);
    }

    db.close();
}

resetPasswords().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
