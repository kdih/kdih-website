const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./kdih.db');

async function createAdmin() {
    const username = 'superadmin';
    const email = 'katsinadigitalhub@gmail.com';
    const password = 'superadmin123';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')`;

        db.run(sql, [username, email, hashedPassword], function (err) {
            if (err) {
                console.error('Error:', err.message);
                process.exit(1);
            }

            console.log('\n✅ Admin user created successfully!');
            console.log('\nLogin Credentials:');
            console.log(`Username: ${username}`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log(`\nLogin at: http://localhost:3000/admin/login.html\n`);

            db.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('Error:', error.message);
        db.close();
        process.exit(1);
    }
}

createAdmin();
