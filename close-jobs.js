/**
 * Close All Jobs Script
 * Run this to close all active job postings
 * Usage: node close-jobs.js
 * To reopen: node close-jobs.js reopen
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

const action = process.argv[2]; // 'reopen' or undefined (close)

if (action === 'reopen') {
    console.log('Re-opening all jobs...');
    db.run(`UPDATE jobs SET status = 'active' WHERE status = 'closed'`, function (err) {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log(`✅ ${this.changes} jobs re-opened (set to active)`);
        }
        db.close();
    });
} else {
    console.log('Closing all active jobs...');
    db.run(`UPDATE jobs SET status = 'closed' WHERE status = 'active'`, function (err) {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log(`✅ ${this.changes} jobs closed`);
        }
        db.close();
    });
}
