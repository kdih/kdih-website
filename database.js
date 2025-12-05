const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use environment variable for database path (Railway compatibility)
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'kdih.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Services Table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            icon TEXT,
            title TEXT,
            description TEXT
        )`);

        // Stats Table
        db.run(`CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value INTEGER,
            label TEXT,
            suffix TEXT
        )`);

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Members Table (Legacy - Removed to avoid conflict with unified portal)
        // See unified 'members' table definition below


        // Enrollments Table (Legacy - Removed)
        // See 'member_enrollments' table definition below


        // Course Registrations Table (New)
        db.run(`CREATE TABLE IF NOT EXISTS course_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_title TEXT,
            schedule TEXT,
            title TEXT,
            surname TEXT,
            firstname TEXT,
            othernames TEXT,
            gender TEXT,
            nationality TEXT,
            phone TEXT,
            email_personal TEXT,
            email_official TEXT,
            organization TEXT,
            job_title TEXT,
            department TEXT,
            country TEXT,
            state TEXT,
            city TEXT,
            address TEXT,
            duties TEXT,
            expectations TEXT,
            requirements TEXT,
            referral TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table (Admin & Super Admin)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            is_active INTEGER DEFAULT 1
        )`, async (err) => {
            if (!err) {
                // Seed Super Admin User
                db.get("SELECT * FROM users WHERE username = 'superadmin'", [], async (err, row) => {
                    if (!row) {
                        const bcrypt = require('bcrypt');
                        const hashedPassword = await bcrypt.hash('superadmin123', 10);
                        db.run("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
                            ['superadmin', hashedPassword, 'superadmin@kdih.org', 'super_admin']);
                        console.log('Seeded super admin user.');
                    }
                });

                // Seed Regular Admin User
                db.get("SELECT * FROM users WHERE username = 'admin'", [], async (err, row) => {
                    if (!row) {
                        const bcrypt = require('bcrypt');
                        const hashedPassword = await bcrypt.hash('admin123', 10);
                        db.run("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
                            ['admin', hashedPassword, 'admin@kdih.org', 'admin']);
                        console.log('Seeded admin user with hashed password.');
                    }
                });
            }
        });

        // Password Resets Table
        db.run(`CREATE TABLE IF NOT EXISTS password_resets (
            email TEXT,
            token TEXT,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);


        // Members Table (Unified portal for all user types)
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            member_type TEXT DEFAULT 'student',
            profile_photo TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active INTEGER DEFAULT 1
        )`);

        // Co-working Members Table (Unified)
        db.run(`CREATE TABLE IF NOT EXISTS coworking_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            member_code TEXT UNIQUE,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            membership_type TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                db.all("PRAGMA table_info(coworking_members)", [], (err, columns) => {
                    if (!err && columns) {
                        if (!columns.some(c => c.name === 'member_code')) {
                            console.log('Migrating coworking_members: Adding member_code...');
                            db.run("ALTER TABLE coworking_members ADD COLUMN member_code TEXT UNIQUE");
                        }
                    }
                });
            }
        });

        // Desk Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS desk_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            desk_number TEXT,
            desk_type TEXT NOT NULL,
            booking_type TEXT,
            booking_date DATE NOT NULL,
            start_time TIME,
            end_time TIME,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(id)
        )`, (err) => {
            if (!err) {
                // Auto-migration: Check for missing columns (desk_number, booking_type)
                db.all("PRAGMA table_info(desk_bookings)", [], (err, columns) => {
                    if (!err && columns) {
                        // Check desk_number
                        if (!columns.some(c => c.name === 'desk_number')) {
                            console.log('Migrating desk_bookings: Adding desk_number column...');
                            db.run("ALTER TABLE desk_bookings ADD COLUMN desk_number TEXT");
                        }
                        // Check booking_type
                        if (!columns.some(c => c.name === 'booking_type')) {
                            console.log('Migrating desk_bookings: Adding booking_type column...');
                            db.run("ALTER TABLE desk_bookings ADD COLUMN booking_type TEXT");
                        }
                    }
                });
            }
        });

        // ===== LMS TABLES =====

        // Courses Table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            track TEXT,
            duration_weeks INTEGER,
            instructor_id INTEGER,
            price DECIMAL(10,2),
            status TEXT DEFAULT 'active',
            thumbnail_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Course Modules Table
        db.run(`CREATE TABLE IF NOT EXISTS course_modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            module_order INTEGER,
            content_type TEXT,
            content_url TEXT,
            duration_minutes INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // Member Enrollments Table (renamed from student_enrollments)
        db.run(`CREATE TABLE IF NOT EXISTS member_enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            course_id INTEGER,
            enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            completion_date DATETIME,
            progress_percentage INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            payment_status TEXT DEFAULT 'pending',
            FOREIGN KEY (member_id) REFERENCES members(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // Assignments Table
        db.run(`CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            due_date DATETIME,
            max_score INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (module_id) REFERENCES course_modules(id)
        )`);

        // Assignment Submissions Table
        db.run(`CREATE TABLE IF NOT EXISTS assignment_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER,
            student_id INTEGER,
            submission_url TEXT,
            submission_text TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            score INTEGER,
            feedback TEXT,
            graded_at DATETIME,
            graded_by INTEGER,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        )`);

        // ===== CERTIFICATES =====

        db.run(`CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            certificate_number TEXT UNIQUE,
            student_id INTEGER,
            course_id INTEGER,
            student_name TEXT,
            course_title TEXT,
            issue_date DATE,
            certificate_type TEXT,
            certificate_url TEXT,
            verification_code TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // ===== EVENTS & WORKSHOPS =====

        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_type TEXT,
            event_date DATETIME,
            end_date DATETIME,
            location TEXT,
            max_attendees INTEGER,
            price DECIMAL(10,2) DEFAULT 0,
            status TEXT DEFAULT 'upcoming',
            thumbnail_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS event_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            attendee_name TEXT,
            attendee_email TEXT,
            attendee_phone TEXT,
            payment_status TEXT DEFAULT 'pending',
            attendance_status TEXT DEFAULT 'registered',
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )`);

        // ===== PAYMENTS =====

        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT UNIQUE,
            user_id INTEGER,
            amount DECIMAL(10,2),
            payment_type TEXT,
            payment_method TEXT,
            status TEXT DEFAULT 'pending',
            metadata TEXT,
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT UNIQUE,
            user_id INTEGER,
            amount DECIMAL(10,2),
            description TEXT,
            status TEXT DEFAULT 'unpaid',
            due_date DATE,
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // ===== CO-WORKING SPACE =====

        db.run(`CREATE TABLE IF NOT EXISTS coworking_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            membership_type TEXT,
            start_date DATE,
            end_date DATE,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS desk_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            desk_number TEXT,
            booking_date DATE,
            booking_type TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES coworking_members(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS meeting_room_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            room_name TEXT,
            booking_date DATE,
            start_time TIME,
            end_time TIME,
            purpose TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES coworking_members(id)
        )`);

        // ===== STARTUP INCUBATION =====

        db.run(`CREATE TABLE IF NOT EXISTS startup_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_name TEXT,
            founder_name TEXT,
            founder_email TEXT,
            founder_phone TEXT,
            business_description TEXT,
            pitch_deck_url TEXT,
            team_size INTEGER,
            industry TEXT,
            stage TEXT,
            funding_sought DECIMAL(10,2),
            application_status TEXT DEFAULT 'pending',
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS incubation_cohorts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cohort_name TEXT,
            start_date DATE,
            end_date DATE,
            program_duration INTEGER,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS startup_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            startup_id INTEGER,
            milestone_name TEXT,
            milestone_type TEXT,
            target_date DATE,
            completion_date DATE,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // ===== ANALYTICS & LOGS =====

        db.run(`CREATE TABLE IF NOT EXISTS email_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient_email TEXT,
            subject TEXT,
            email_type TEXT,
            status TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT,
            entity_type TEXT,
            entity_id INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed Data (only if empty)
        db.get("SELECT count(*) as count FROM services", (err, row) => {
            if (row.count === 0) {
                const services = [
                    { icon: '<i class="ph-fill ph-laptop"></i>', title: 'Digital Skills Training', description: 'Master in-demand skills including coding, UI/UX design, AI, data analytics, and cybersecurity. Professional certification programs.' },
                    { icon: '<i class="ph-fill ph-rocket-launch"></i>', title: 'Startup Incubation', description: 'Intensive 3-6 month mentorship programs with investor linkages. We help turn your innovative ideas into thriving businesses.' },
                    { icon: '<i class="ph-fill ph-buildings"></i>', title: 'Co-working Space', description: 'Modern, flexible workspaces with high-speed internet, power backup, and a collaborative community of tech enthusiasts.' },
                    { icon: '<i class="ph-fill ph-chart-bar"></i>', title: 'ICT Consulting', description: 'Professional digital advisory services for SMEs and organizations. Transform your business operations with cutting-edge tech.' }
                ];
                const insertService = db.prepare("INSERT INTO services (icon, title, description) VALUES (?, ?, ?)");
                services.forEach(s => insertService.run(s.icon, s.title, s.description));
                insertService.finalize();
                console.log('Seeded services data.');
            }
        });

        db.get("SELECT count(*) as count FROM stats", (err, row) => {
            if (row.count === 0) {
                const stats = [
                    { value: 500, label: 'Youth Trained', suffix: '+' },
                    { value: 10, label: 'Startups Incubated', suffix: '+' },
                    { value: 100, label: 'Jobs Created', suffix: '+' },
                    { value: 40, label: '% Women Participation', suffix: '%' }
                ];
                const insertStat = db.prepare("INSERT INTO stats (value, label, suffix) VALUES (?, ?, ?)");
                stats.forEach(s => insertStat.run(s.value, s.label, s.suffix));
                insertStat.finalize();
                console.log('Seeded stats data.');
            }
        });
    });
}

module.exports = db;
