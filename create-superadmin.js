require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Database path
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

async function createSuperAdmin() {
    try {
        console.log('\n=== Creating New Super Admin ===\n');

        const email = 'katsinadigitalhub@gmail.com';
        const password = 'ChangeMe123!'; // Temporary password
        const username = 'katsinadigitalhub';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin
        db.run(
            `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
            [username, hashedPassword, email, 'super_admin'],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        // If user exists, update password and role
                        console.log('User already exists. Updating password and role...');
                        db.run(
                            `UPDATE users SET password = ?, role = 'super_admin' WHERE email = ?`,
                            [hashedPassword, email],
                            function (err) {
                                if (err) {
                                    console.error('❌ Error updating user:', err.message);
                                } else {
                                    console.log(`\n✅ Access restored for: ${email}`);
                                    console.log(`Username: ${username}`); // In case it wasn't username update
                                    console.log(`New Password: ${password}`);
                                }
                                db.close();
                            }
                        );
                        return;
                    }
                    console.error('❌ Error creating user:', err.message);
                    db.close();
                    return;
                }

                console.log(`\n✅ Super Admin created successfully!`);
                console.log(`Email: ${email}`);
                console.log(`Username: ${username}`);
                console.log(`Password: ${password}`);
                console.log(`\nPLEASE CHANGE THIS PASSWORD IMMEDIATELY AFTER LOGGING IN!`);

                db.close();
            }
        );

    } catch (error) {
        console.error('❌ Error:', error.message);
        db.close();
    }
}

createSuperAdmin();
