require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const readline = require('readline');

// Database path
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function changePassword() {
    try {
        console.log('\n=== KDIH Admin Password Change ===\n');

        // Get username
        const username = await question('Enter admin username: ');

        // Get new password
        const newPassword = await question('Enter new password (min 6 characters): ');

        if (newPassword.length < 6) {
            console.log('❌ Error: Password must be at least 6 characters long');
            rl.close();
            return;
        }

        // Confirm password
        const confirmPassword = await question('Confirm new password: ');

        if (newPassword !== confirmPassword) {
            console.log('❌ Error: Passwords do not match');
            rl.close();
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the database
        db.run(
            'UPDATE admins SET password = ? WHERE username = ?',
            [hashedPassword, username],
            function (err) {
                if (err) {
                    console.error('❌ Error updating password:', err.message);
                    rl.close();
                    return;
                }

                if (this.changes === 0) {
                    console.log(`❌ Error: Admin user "${username}" not found`);
                } else {
                    console.log(`\n✅ Password successfully changed for user: ${username}\n`);
                }

                rl.close();
                db.close();
            }
        );

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        db.close();
    }
}

// Run the script
changePassword();
