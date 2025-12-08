const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

const testPassword = 'JLNF9qfgSvUKe@BC';

db.get('SELECT id, username, password FROM users WHERE username = ?', ['admin'], async (err, row) => {
    if (err) {
        console.log('Error:', err.message);
        db.close();
        return;
    }
    if (!row) {
        console.log('No admin user found');
        db.close();
        return;
    }
    console.log('User ID:', row.id);
    console.log('Username:', row.username);
    console.log('Hash (first 30 chars):', row.password.substring(0, 30) + '...');

    try {
        const isValid = await bcrypt.compare(testPassword, row.password);
        console.log('Password "' + testPassword + '" valid:', isValid);
    } catch (e) {
        console.log('bcrypt error:', e.message);
    }

    db.close();
});
