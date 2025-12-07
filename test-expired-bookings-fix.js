// Quick test to verify the expired bookings API fix
const db = require('./database');

console.log('Testing expired bookings query...\n');

const deskQuery = `
    SELECT db.*, cm.full_name, cm.email, cm.phone
    FROM desk_bookings db
    JOIN coworking_members cm ON db.member_id = cm.id
    WHERE db.expires_at < datetime('now') AND db.status = 'pending_payment'
    ORDER BY db.expires_at DESC
    LIMIT 5
`;

const roomQuery = `
    SELECT *
    FROM meeting_room_bookings
    WHERE expires_at < datetime('now') AND status = 'pending_payment'
    ORDER BY expires_at DESC
    LIMIT 5
`;

console.log('Testing Desk Bookings Query:');
db.all(deskQuery, [], (err, desks) => {
    if (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    } else {
        console.log(`✅ SUCCESS: Query returned ${desks.length} expired desk bookings`);
        if (desks.length > 0) {
            console.log('Sample:', desks[0]);
        }
    }

    console.log('\nTesting Room Bookings Query:');
    db.all(roomQuery, [], (err, rooms) => {
        if (err) {
            console.error('❌ ERROR:', err.message);
            process.exit(1);
        } else {
            console.log(`✅ SUCCESS: Query returned ${rooms.length} expired room bookings`);
            if (rooms.length > 0) {
                console.log('Sample:', rooms[0]);
            }
        }

        console.log('\n✅ All queries executed successfully!');
        console.log('The API endpoint should now work correctly.');
        process.exit(0);
    });
});
