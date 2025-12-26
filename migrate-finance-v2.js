/**
 * Finance System V2 Migration Script
 * 
 * This script enhances the finance system to:
 * 1. Link course registrations to courses table
 * 2. Auto-populate course fees from courses
 * 3. Track individual payments per registration
 * 4. Auto-calculate outstanding amounts
 * 5. Determine certificate eligibility based on full payment
 * 
 * Run with: node migrate-finance-v2.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting Finance System V2 Migration...\n');

// Helper function to run SQL with promise
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function migrate() {
    try {
        // ===== STEP 1: Add new columns to course_registrations =====
        console.log('Step 1: Adding new columns to course_registrations...');

        const columns = await getAll("PRAGMA table_info(course_registrations)");
        const columnNames = columns.map(c => c.name);

        // Add course_id column (foreign key to courses)
        if (!columnNames.includes('course_id')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN course_id INTEGER");
            console.log('  ✓ Added course_id column');
        } else {
            console.log('  - course_id column already exists');
        }

        // Add course_fee column (copied from courses.price)
        if (!columnNames.includes('course_fee')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN course_fee DECIMAL(10,2) DEFAULT 0");
            console.log('  ✓ Added course_fee column');
        } else {
            console.log('  - course_fee column already exists');
        }

        // Add amount_paid column (sum of all payments)
        if (!columnNames.includes('amount_paid')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0");
            console.log('  ✓ Added amount_paid column');
        } else {
            console.log('  - amount_paid column already exists');
        }

        // Add payment_status column (pending, partial, paid)
        if (!columnNames.includes('payment_status')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN payment_status TEXT DEFAULT 'pending'");
            console.log('  ✓ Added payment_status column');
        } else {
            console.log('  - payment_status column already exists');
        }

        // Add eligible_for_certificate column
        if (!columnNames.includes('eligible_for_certificate')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN eligible_for_certificate INTEGER DEFAULT 0");
            console.log('  ✓ Added eligible_for_certificate column');
        } else {
            console.log('  - eligible_for_certificate column already exists');
        }

        // Add full_name column if it doesn't exist (combine firstname and surname)
        if (!columnNames.includes('full_name')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN full_name TEXT");
            console.log('  ✓ Added full_name column');

            // Populate full_name from existing firstname/surname
            await runSQL(`
                UPDATE course_registrations 
                SET full_name = TRIM(COALESCE(firstname, '') || ' ' || COALESCE(surname, ''))
                WHERE full_name IS NULL OR full_name = ''
            `);
            console.log('  ✓ Populated full_name from firstname/surname');
        } else {
            console.log('  - full_name column already exists');
        }

        // Add email column (alias for email_personal)
        if (!columnNames.includes('email')) {
            await runSQL("ALTER TABLE course_registrations ADD COLUMN email TEXT");
            console.log('  ✓ Added email column');

            // Populate email from email_personal
            await runSQL(`
                UPDATE course_registrations 
                SET email = COALESCE(email_personal, email_official)
                WHERE email IS NULL OR email = ''
            `);
            console.log('  ✓ Populated email from email_personal/email_official');
        } else {
            console.log('  - email column already exists');
        }

        // ===== STEP 2: Create student_payments table =====
        console.log('\nStep 2: Creating student_payments table...');

        await runSQL(`
            CREATE TABLE IF NOT EXISTS student_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                registration_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_method TEXT,
                payment_reference TEXT,
                payment_date DATE DEFAULT (date('now')),
                notes TEXT,
                recorded_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (registration_id) REFERENCES course_registrations(id),
                FOREIGN KEY (recorded_by) REFERENCES users(id)
            )
        `);
        console.log('  ✓ Created student_payments table');

        // Create index for faster lookups
        await runSQL(`CREATE INDEX IF NOT EXISTS idx_student_payments_registration 
                      ON student_payments(registration_id)`);
        console.log('  ✓ Created index on registration_id');

        // ===== STEP 3: Link existing registrations to courses =====
        console.log('\nStep 3: Linking registrations to courses and setting course fees...');

        // Get all courses
        const courses = await getAll("SELECT id, title, price FROM courses");
        console.log(`  Found ${courses.length} courses`);

        // Get all registrations without course_id
        const registrations = await getAll(`
            SELECT id, course_title 
            FROM course_registrations 
            WHERE course_id IS NULL OR course_fee = 0 OR course_fee IS NULL
        `);
        console.log(`  Found ${registrations.length} registrations to update`);

        let linked = 0;
        for (const reg of registrations) {
            // Find matching course by title (fuzzy match)
            const course = courses.find(c =>
                c.title && reg.course_title &&
                (c.title.toLowerCase().includes(reg.course_title.toLowerCase()) ||
                    reg.course_title.toLowerCase().includes(c.title.toLowerCase()) ||
                    c.title.toLowerCase() === reg.course_title.toLowerCase())
            );

            if (course) {
                await runSQL(`
                    UPDATE course_registrations 
                    SET course_id = ?, 
                        course_fee = COALESCE(course_fee, ?) 
                    WHERE id = ?
                `, [course.id, course.price || 0, reg.id]);
                linked++;
            }
        }
        console.log(`  ✓ Linked ${linked} registrations to courses`);

        // ===== STEP 4: Migrate existing payment_records to student_payments =====
        console.log('\nStep 4: Migrating existing payment records...');

        // Check if payment_records table exists
        const paymentRecordsExists = await getOne(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='payment_records'"
        );

        if (paymentRecordsExists) {
            const existingPayments = await getAll("SELECT * FROM payment_records");
            console.log(`  Found ${existingPayments.length} existing payment records`);

            let migrated = 0;
            for (const payment of existingPayments) {
                // Try to find matching registration
                const registration = await getOne(`
                    SELECT id FROM course_registrations 
                    WHERE (full_name = ? OR (firstname || ' ' || surname) = ?)
                    AND course_title = ?
                    LIMIT 1
                `, [payment.student_name, payment.student_name, payment.course_title]);

                if (registration) {
                    // Check if already migrated
                    const existing = await getOne(`
                        SELECT id FROM student_payments 
                        WHERE registration_id = ? AND amount = ? AND payment_date = ?
                    `, [registration.id, payment.amount, payment.payment_date]);

                    if (!existing) {
                        await runSQL(`
                            INSERT INTO student_payments 
                            (registration_id, amount, payment_method, payment_reference, payment_date, notes, recorded_by, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            registration.id,
                            payment.amount,
                            payment.payment_method,
                            payment.payment_reference,
                            payment.payment_date,
                            payment.notes,
                            payment.recorded_by,
                            payment.created_at
                        ]);
                        migrated++;
                    }
                }
            }
            console.log(`  ✓ Migrated ${migrated} payments to new table`);
        } else {
            console.log('  - No payment_records table found, skipping migration');
        }

        // ===== STEP 5: Update amount_paid and payment_status for all registrations =====
        console.log('\nStep 5: Updating payment totals and statuses...');

        await runSQL(`
            UPDATE course_registrations 
            SET amount_paid = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM student_payments 
                WHERE student_payments.registration_id = course_registrations.id
            )
        `);
        console.log('  ✓ Updated amount_paid for all registrations');

        // Update payment status based on amount_paid vs course_fee
        await runSQL(`
            UPDATE course_registrations 
            SET payment_status = CASE
                WHEN amount_paid >= course_fee AND course_fee > 0 THEN 'paid'
                WHEN amount_paid > 0 AND amount_paid < course_fee THEN 'partial'
                ELSE 'pending'
            END
        `);
        console.log('  ✓ Updated payment_status for all registrations');

        // Update certificate eligibility
        await runSQL(`
            UPDATE course_registrations 
            SET eligible_for_certificate = CASE
                WHEN amount_paid >= course_fee AND course_fee > 0 THEN 1
                ELSE 0
            END
        `);
        console.log('  ✓ Updated eligible_for_certificate for all registrations');

        // ===== STEP 6: Create view for easy querying =====
        console.log('\nStep 6: Creating helper view...');

        await runSQL("DROP VIEW IF EXISTS v_student_payment_summary");
        await runSQL(`
            CREATE VIEW v_student_payment_summary AS
            SELECT 
                cr.id as registration_id,
                cr.full_name as student_name,
                cr.email,
                cr.phone,
                cr.course_title,
                cr.course_id,
                c.title as course_name,
                COALESCE(cr.course_fee, c.price, 0) as course_fee,
                COALESCE(cr.amount_paid, 0) as amount_paid,
                COALESCE(cr.course_fee, c.price, 0) - COALESCE(cr.amount_paid, 0) as outstanding_amount,
                cr.payment_status,
                cr.eligible_for_certificate,
                cr.created_at as registration_date,
                (SELECT COUNT(*) FROM student_payments WHERE registration_id = cr.id) as payment_count,
                (SELECT MAX(payment_date) FROM student_payments WHERE registration_id = cr.id) as last_payment_date
            FROM course_registrations cr
            LEFT JOIN courses c ON cr.course_id = c.id
        `);
        console.log('  ✓ Created v_student_payment_summary view');

        // ===== Print Summary =====
        console.log('\n========================================');
        console.log('Migration Complete! Summary:');
        console.log('========================================');

        const totalRegistrations = await getOne("SELECT COUNT(*) as count FROM course_registrations");
        const linkedRegistrations = await getOne("SELECT COUNT(*) as count FROM course_registrations WHERE course_id IS NOT NULL");
        const totalPayments = await getOne("SELECT COUNT(*) as count FROM student_payments");
        const paidStudents = await getOne("SELECT COUNT(*) as count FROM course_registrations WHERE payment_status = 'paid'");
        const partialStudents = await getOne("SELECT COUNT(*) as count FROM course_registrations WHERE payment_status = 'partial'");
        const pendingStudents = await getOne("SELECT COUNT(*) as count FROM course_registrations WHERE payment_status = 'pending'");
        const eligible = await getOne("SELECT COUNT(*) as count FROM course_registrations WHERE eligible_for_certificate = 1");

        console.log(`Total Registrations: ${totalRegistrations.count}`);
        console.log(`Linked to Courses: ${linkedRegistrations.count}`);
        console.log(`Total Payments: ${totalPayments.count}`);
        console.log(`Paid Students: ${paidStudents.count}`);
        console.log(`Partial Payment: ${partialStudents.count}`);
        console.log(`Pending Payment: ${pendingStudents.count}`);
        console.log(`Eligible for Certificate: ${eligible.count}`);
        console.log('\n✅ Finance System V2 is ready!');

    } catch (error) {
        console.error('\n❌ Migration Error:', error.message);
        console.error(error.stack);
    } finally {
        db.close();
    }
}

migrate();
