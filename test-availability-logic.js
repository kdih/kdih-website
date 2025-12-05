const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

const testDate = '2025-11-29';

console.log(`Checking availability for ${testDate}...`);

const sql = "SELECT desk_number FROM desk_bookings WHERE booking_date = ? AND status = 'confirmed'";

db.all(sql, [testDate], (err, booked) => {
    if (err) {
        console.error(err);
        return;
    }

    const bookedDesks = booked.map(b => b.desk_number);
    console.log('Raw DB Bookings:', bookedDesks);

    const allDesks = [];
    for (let i = 1; i <= 20; i++) {
        const deskNum = `DESK-${i}`;
        const status = bookedDesks.includes(deskNum) ? 'booked' : 'available';
        allDesks.push({ desk_number: deskNum, status });
    }

    // Print a summary
    const bookedCount = allDesks.filter(d => d.status === 'booked').length;
    const availableCount = allDesks.filter(d => d.status === 'available').length;

    console.log(`\nSummary:`);
    console.log(`Total Desks: ${allDesks.length}`);
    console.log(`Booked: ${bookedCount}`);
    console.log(`Available: ${availableCount}`);

    console.log('\nDetailed Status (First 5 + Booked ones):');
    allDesks.forEach(d => {
        if (d.status === 'booked' || parseInt(d.desk_number.split('-')[1]) <= 5) {
            console.log(`${d.desk_number}: ${d.status}`);
        }
    });

    db.close();
});
