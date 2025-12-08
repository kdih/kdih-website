// Update all existing jobs from 'closed' to 'draft' status
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

console.log('📝 Updating Job Statuses from CLOSED → DRAFT');
console.log('=============================================\n');

db.serialize(() => {
    // First, show current jobs
    db.all('SELECT id, title, status FROM jobs ORDER BY id', (err, jobs) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            return;
        }

        console.log('Current Jobs:');
        jobs.forEach(job => {
            console.log(`  ${job.id}. ${job.title} - Status: ${job.status}`);
        });
        console.log('');

        // Update all to draft
        db.run(`UPDATE jobs SET status = 'draft' WHERE status = 'closed'`, function (err) {
            if (err) {
                console.error('Error updating jobs:', err);
                return;
            }

            console.log(`✅ Updated ${this.changes} jobs to DRAFT status\n`);

            // Show updated jobs
            db.all('SELECT id, title, status FROM jobs ORDER BY id', (err, updatedJobs) => {
                if (err) {
                    console.error('Error fetching updated jobs:', err);
                    return;
                }

                console.log('Updated Jobs:');
                updatedJobs.forEach(job => {
                    console.log(`  ${job.id}. ${job.title} - Status: ${job.status}`);
                });

                console.log('\n=============================================');
                console.log('✅ All jobs are now DRAFT!');
                console.log('\nYou can now:');
                console.log('  1. See them in Admin Dashboard → Careers tab');
                console.log('  2. Edit them to add/change details');
                console.log('  3. Change status to ACTIVE to publish to careers page');

                db.close();
            });
        });
    });
});
