/**
 * Database Migration Script for Finance Dashboard Features
 * Run this on production to add new tables and columns
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting finance dashboard migration...');
console.log('Database path:', dbPath);

const migrations = [
    // Add payment columns to certificates table
    "ALTER TABLE certificates ADD COLUMN payment_amount DECIMAL(10,2)",
    "ALTER TABLE certificates ADD COLUMN payment_method TEXT",
    "ALTER TABLE certificates ADD COLUMN payment_reference TEXT",
    "ALTER TABLE certificates ADD COLUMN payment_notes TEXT",
    "ALTER TABLE certificates ADD COLUMN status TEXT DEFAULT 'pending'",
    "ALTER TABLE certificates ADD COLUMN initiated_by INTEGER",
    "ALTER TABLE certificates ADD COLUMN finance_confirmed_by INTEGER",
    "ALTER TABLE certificates ADD COLUMN finance_confirmed_at DATETIME",
    "ALTER TABLE certificates ADD COLUMN approved_by INTEGER",
    "ALTER TABLE certificates ADD COLUMN approved_at DATETIME",
    "ALTER TABLE certificates ADD COLUMN rejection_reason TEXT",

    // Create finance audit log table
    `CREATE TABLE IF NOT EXISTS finance_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        user_id INTEGER,
        user_name TEXT,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Create payment records table
    `CREATE TABLE IF NOT EXISTS payment_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        student_email TEXT,
        course_title TEXT,
        registration_id INTEGER,
        certificate_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT,
        payment_reference TEXT,
        payment_date DATE,
        status TEXT DEFAULT 'confirmed',
        recorded_by INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
];

let completed = 0;
let errors = 0;

migrations.forEach((sql, index) => {
    db.run(sql, [], function (err) {
        if (err) {
            // Ignore "duplicate column" errors
            if (err.message.includes('duplicate column name')) {
                console.log(`[SKIP] Column already exists: ${sql.substring(0, 60)}...`);
            } else if (err.message.includes('table') && err.message.includes('already exists')) {
                console.log(`[SKIP] Table already exists`);
            } else {
                console.error(`[ERROR] Migration ${index + 1}: ${err.message}`);
                errors++;
            }
        } else {
            console.log(`[OK] Migration ${index + 1} completed`);
        }
        completed++;

        if (completed === migrations.length) {
            console.log('\n========================================');
            console.log(`Migration completed!`);
            console.log(`Successful: ${completed - errors}`);
            console.log(`Errors: ${errors}`);
            console.log('========================================\n');

            // Create finance user if not exists
            const bcrypt = require('bcrypt');
            bcrypt.hash('Finance@2024!', 10, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    db.close();
                    return;
                }

                db.run(`INSERT OR IGNORE INTO users (username, email, password, role, is_active) 
                        VALUES (?, ?, ?, ?, 1)`,
                    ['finance', 'finance@kdih.org', hash, 'finance'],
                    function (err) {
                        if (err) {
                            console.log('Finance user may already exist:', err.message);
                        } else if (this.changes > 0) {
                            console.log('✅ Finance user created!');
                            console.log('   Username: finance');
                            console.log('   Password: Finance@2024!');
                            console.log('   Role: finance');
                        } else {
                            console.log('Finance user already exists');
                        }

                        db.close();
                        console.log('\nDatabase connection closed.');
                    }
                );
            });
        }
    });
});
