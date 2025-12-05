#!/usr/bin/env node

/**
 * Create Test Member Account
 * 
 * This script creates a test member account for testing the member portal.
 * 
 * Usage: node create-test-member.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./kdih.db');

async function createTestMember() {
    console.log('🧪 Creating test member account...\n');

    try {
        const hashedPassword = await bcrypt.hash('member123', 10);

        db.run(
            `INSERT INTO members (email, password, full_name, phone, member_type) 
             VALUES (?, ?, ?, ?, ?)`,
            ['member@test.com', hashedPassword, 'Test Member', '+234 XXX XXX XXXX', 'both'],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        console.log('⚠️  Test member already exists!');
                        console.log('\n📧 Email: member@test.com');
                        console.log('🔑 Password: member123');
                    } else {
                        console.error('❌ Error:', err.message);
                    }
                } else {
                    console.log('✅ Test member created successfully!');
                    console.log('\n📧 Email: member@test.com');
                    console.log('🔑 Password: member123');
                    console.log('👤 Type: Both (Student & Co-working)');
                    console.log('\n🌐 Login at: http://localhost:3000/member/login.html');
                }
                db.close();
            }
        );
    } catch (error) {
        console.error('❌ Error:', error.message);
        db.close();
    }
}

createTestMember();
