const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const db = new sqlite3.Database('./kdih.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    try {
        console.log('\n=== Create Admin User ===\n');

        const username = await question('Enter admin username (default: admin): ') || 'admin';
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 characters): ');

        if (password.length < 6) {
            console.error('Password must be at least 6 characters long.');
            process.exit(1);
        }

        if (!email) {
            console.error('Email is required.');
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user
        const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')`;

        db.run(sql, [username, email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    console.error('\nError: Username or email already exists.');
                } else {
                    console.error('\nError creating admin:', err.message);
                }
                process.exit(1);
            }

            console.log('\n✅ Admin user created successfully!');
            console.log(`\nLogin Credentials:`);
            console.log(`Username: ${username}`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log(`\nYou can now login at: http://localhost:3000/admin/login.html\n`);

            db.close();
            rl.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error:', error.message);
        db.close();
        rl.close();
        process.exit(1);
    }
}

createAdmin();
