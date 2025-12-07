// Quick test to verify courses API endpoint
const db = require('./database');

console.log('Testing courses endpoint query...\n');

const sql = "SELECT * FROM courses WHERE status = 'active' ORDER BY created_at DESC";

db.all(sql, [], (err, rows) => {
    if (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    } else {
        console.log(`✅ SUCCESS: Query returned ${rows.length} courses`);
        console.log('\nCourses:');
        rows.forEach((course, index) => {
            console.log(`${index + 1}. ${course.title} - ${course.track} - ₦${course.price}`);
        });
        process.exit(0);
    }
});
