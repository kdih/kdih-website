// Add reset_token columns to members table for password reset functionality
require('dotenv').config();
const db = require('./database');

console.log('Adding password reset columns to members table...\n');

const migrations = [
    {
        name: 'reset_token',
        sql: 'ALTER TABLE members ADD COLUMN reset_token TEXT'
    },
    {
        name: 'reset_token_expiry',
        sql: 'ALTER TABLE members ADD COLUMN reset_token_expiry TEXT'
    }
];

let completed = 0;

migrations.forEach(migration => {
    db.run(migration.sql, (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log(`✓ Column ${migration.name} already exists`);
            } else {
                console.error(`❌ Error adding ${migration.name}:`, err.message);
            }
        } else {
            console.log(`✅ Column ${migration.name} added successfully!`);
        }

        completed++;
        if (completed === migrations.length) {
            console.log('\n✅ Database migration complete!');
            console.log('Password reset feature is now ready to use.');
            process.exit(0);
        }
    });
});
