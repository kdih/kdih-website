// Create a test user for LMS and member dashboard testing
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./database');

async function createTestUser() {
    try {
        console.log('Creating test user...\n');

        // Test user details
        const testUser = {
            username: 'testuser',
            email: 'testuser@kdih.com',
            password: 'Test123!',
            full_name: 'Test User',
            role: 'member',
            gender: 'Male'
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ? OR username = ?',
            [testUser.email, testUser.username],
            (err, existing) => {
                if (err) {
                    console.error('Error checking user:', err);
                    process.exit(1);
                }

                if (existing) {
                    console.log('❌ Test user already exists!');
                    console.log('\nExisting user details:');
                    console.log('- Username:', existing.username);
                    console.log('- Email:', existing.email);
                    console.log('- Role:', existing.role);
                    console.log('\nUse these credentials to login:');
                    console.log('- Username: testuser');
                    console.log('- Password: Test123!');
                    process.exit(0);
                }

                // Create new user
                const sql = `INSERT INTO users (username, email, password, role, created_at) 
                             VALUES (?, ?, ?, ?, datetime('now'))`;

                db.run(sql,
                    [testUser.username, testUser.email, hashedPassword, testUser.role],
                    function (err) {
                        if (err) {
                            console.error('❌ Error creating user:', err.message);
                            process.exit(1);
                        }

                        console.log('✅ Test user created successfully!\n');
                        console.log('═══════════════════════════════════');
                        console.log('TEST USER CREDENTIALS');
                        console.log('═══════════════════════════════════');
                        console.log('Username:  testuser');
                        console.log('Email:     testuser@kdih.com');
                        console.log('Password:  Test123!');
                        console.log('Role:      member');
                        console.log('User ID:   ' + this.lastID);
                        console.log('═══════════════════════════════════\n');
                        console.log('Login at: http://localhost:3000/member/login.html');
                        console.log('\nWhat you can test:');
                        console.log('✓ Member portal login');
                        console.log('✓ LMS course access');
                        console.log('✓ Course enrollment');
                        console.log('✓ Payment processing');
                        console.log('✓ Profile management');

                        process.exit(0);
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();
