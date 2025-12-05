const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

const testDate = '2025-11-29'; // Tomorrow's date for testing

db.serialize(() => {
    console.log(`Populating test bookings for ${testDate}...`);

    // 1. Ensure we have a test member
    db.run(`INSERT OR IGNORE INTO coworking_members (id, full_name, email, phone, membership_type, start_date, end_date) 
            VALUES (999, 'Test User', 'test@kdih.org', '1234567890', 'monthly', '2025-01-01', '2025-12-31')`);

    // 2. Book specific desks
    const desksToBook = ['DESK-1', 'DESK-5', 'DESK-10', 'DESK-20'];

    const stmt = db.prepare(`INSERT INTO desk_bookings (member_id, desk_number, booking_date, booking_type, status) 
                             VALUES (?, ?, ?, 'daily', 'confirmed')`);

    desksToBook.forEach(desk => {
        stmt.run(999, desk, testDate, (err) => {
            if (err) console.error(`Failed to book ${desk}:`, err.message);
            else console.log(`✅ Booked ${desk}`);
        });
    });

    stmt.finalize(() => {
        console.log('Test data population complete.');
        db.close();
    });
});
