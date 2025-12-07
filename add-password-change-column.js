// Add must_change_password column to members table
require('dotenv').config();
const db = require('./database');

console.log('Adding must_change_password column to members table...\n');

// Check if column already exists
db.get("PRAGMA table_info(members)", (err, rows) => {
    if (err) {
        console.error('Error checking table:', err);
        process.exit(1);
    }

    // Add the column
    const sql = `ALTER TABLE members ADD COLUMN must_change_password INTEGER DEFAULT 1`;

    db.run(sql, (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log('✓ Column must_change_password already exists');
            } else {
                console.error('❌ Error adding column:', err.message);
                process.exit(1);
            }
        } else {
            console.log('✅ Column must_change_password added successfully!');
            console.log('\nAll new members will be required to change password on first login.');
        }

        // Update existing members to not require password change (optional)
        db.run('UPDATE members SET must_change_password = 0 WHERE must_change_password IS NULL', (err) => {
            if (!err) {
                console.log('✓ Existing members exempt from forced password change');
            }
            console.log('\nDatabase migration complete!');
            process.exit(0);
        });
    });
});
