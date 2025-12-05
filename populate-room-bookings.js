const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

const testDate = '2025-11-29'; // Tomorrow

db.serialize(() => {
    console.log(`Creating test room bookings for ${testDate}...`);

    // Make sure test member exists
    db.run(`INSERT OR IGNORE INTO coworking_members (id, full_name, email, phone, membership_type, start_date, end_date) 
            VALUES (999, 'Test User', 'test@kdih.org', '1234567890', 'monthly', '2025-01-01', '2025-12-31')`);

    // Create test bookings
    const bookings = [
        { room: 'Conference Room A', date: testDate, start: '09:00', end: '11:00' },
        { room: 'Conference Room A', date: testDate, start: '14:00', end: '16:00' },
        { room: 'Conference Room B', date: testDate, start: '10:00', end: '12:00' },
        { room: 'Meeting Pod 1', date: testDate, start: '13:00', end: '15:00' }
    ];

    const stmt = db.prepare(`
        INSERT INTO meeting_room_bookings (member_id, room_name, booking_date, start_time, end_time, purpose, status) 
        VALUES (?, ?, ?, ?, ?, 'Test Meeting', 'confirmed')
    `);

    bookings.forEach(booking => {
        stmt.run(999, booking.room, booking.date, booking.start, booking.end, (err) => {
            if (err) console.error(`Failed to book ${booking.room}:`, err.message);
            else console.log(`✅ Booked ${booking.room} from ${booking.start} to ${booking.end}`);
        });
    });

    stmt.finalize(() => {
        console.log('\nRoom booking test data created.');
        console.log('\nTest these scenarios:');
        console.log('1. Conference Room A at 10:00-11:30 (should conflict with 9:00-11:00)');
        console.log('2. Conference Room A at 12:00-13:00 (should be available)');
        console.log('3. Conference Room B at 11:00-13:00 (should conflict with 10:00-12:00)');
        console.log('4. Meeting Pod 2 at any time (should be available - no bookings)');
        db.close();
    });
});
