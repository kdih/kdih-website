// PostgreSQL Database Configuration for Production
// This file replaces database.js when deploying to Railway/production

const { Pool } = require('pg');

// Use DATABASE_URL from environment (Railway provides this automatically)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database successfully');
        release();
    }
});

// Initialize database tables
async function initializeDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ===== ADMIN USERS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== MEMBERS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS members (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                organization VARCHAR(255),
                profession VARCHAR(255),
                membership_type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== COURSES =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                duration VARCHAR(100),
                fee DECIMAL(10, 2),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== COURSE REGISTRATIONS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS course_registrations (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                organization VARCHAR(255),
                course_title VARCHAR(255) NOT NULL,
                course_fee DECIMAL(10, 2),
                payment_status VARCHAR(50) DEFAULT 'pending',
                payment_reference VARCHAR(255),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== MEMBER ENROLLMENTS (LMS) =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS member_enrollments (
                id SERIAL PRIMARY KEY,
                member_id INTEGER REFERENCES members(id),
                course_id INTEGER REFERENCES courses(id),
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'active',
                progress INTEGER DEFAULT 0
            )
        `);

        // ===== CONTACT MESSAGES =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== CO-WORKING MEMBERS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS coworking_members (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                organization VARCHAR(255),
                membership_type VARCHAR(50) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== DESK BOOKINGS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS desk_bookings (
                id SERIAL PRIMARY KEY,
                member_id INTEGER REFERENCES coworking_members(id),
                desk_number VARCHAR(20) NOT NULL,
                booking_date DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== MEETING ROOM BOOKINGS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS meeting_room_bookings (
                id SERIAL PRIMARY KEY,
                member_id INTEGER,
                guest_name VARCHAR(255),
                guest_email VARCHAR(255),
                guest_phone VARCHAR(20),
                guest_organization VARCHAR(255),
                room_name VARCHAR(255) NOT NULL,
                booking_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                purpose TEXT,
                status VARCHAR(50) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== STARTUP INCUBATION =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS startup_applications (
                id SERIAL PRIMARY KEY,
                startup_name VARCHAR(255) NOT NULL,
                founder_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                industry VARCHAR(255),
                stage VARCHAR(100),
                description TEXT,
                team_size INTEGER,
                funding_needed DECIMAL(15, 2),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== EVENTS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date TIMESTAMP NOT NULL,
                location VARCHAR(255),
                capacity INTEGER,
                fee DECIMAL(10, 2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ===== EVENT REGISTRATIONS =====
        await client.query(`
            CREATE TABLE IF NOT EXISTS event_registrations (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id),
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                organization VARCHAR(255),
                status VARCHAR(50) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query('COMMIT');
        console.log('✅ All database tables created successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Export pool for use in routes
module.exports = {
    pool,
    initializeDatabase,
    // Helper function for queries
    query: (text, params) => pool.query(text, params)
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Database initialization failed:', err);
            process.exit(1);
        });
}
