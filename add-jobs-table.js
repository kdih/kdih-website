// Migration: Add jobs table for dynamic job management
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'kdih.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting jobs table migration...');

db.serialize(() => {
    // Create jobs table
    db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            department TEXT,
            employment_type TEXT NOT NULL,
            location TEXT DEFAULT 'Katsina, Nigeria',
            salary_info TEXT,
            application_deadline DATE,
            description TEXT,
            responsibilities TEXT,
            requirements TEXT,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES admins(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating jobs table:', err);
        } else {
            console.log('✓ Jobs table created successfully');
        }
    });

    // Optional: Insert the existing 7 jobs as initial data
    const existingJobs = [
        {
            title: 'Hub Manager / Operations Lead',
            department: 'Operations',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Lead and coordinate all hub operations, ensuring seamless delivery of services across training, coworking, and startup incubation programs.',
            responsibilities: JSON.stringify([
                'Lead and coordinate all hub operations',
                'Supervise teams and ensure smooth service delivery',
                'Oversee training, coworking, and startup programs',
                'Manage partnerships and stakeholder engagement',
                'Implement processes, policies, and growth strategies'
            ]),
            requirements: JSON.stringify([
                '3+ years in operations/tech/education/programs',
                'Leadership ability and strong communication',
                'Problem-solving mindset and team motivation skills'
            ]),
            status: 'closed'
        },
        {
            title: 'Admin & Finance Officer',
            department: 'Administration',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Manage financial records, administrative tasks, and ensure accurate documentation across all hub activities.',
            responsibilities: JSON.stringify([
                'Maintain financial records & receipts',
                'Manage registrations and enrollment data',
                'Prepare weekly admin and finance reports',
                'Support procurement and documentation',
                'Maintain digital and physical filing systems'
            ]),
            requirements: JSON.stringify([
                'HND/BSc in Accounting, Business Admin, Economics',
                'Strong Excel and documentation skills',
                'Accuracy and honesty are a must'
            ]),
            status: 'closed'
        },
        {
            title: 'ICT / Technical Support Officer',
            department: 'IT',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Ensure all technical infrastructure, equipment, and systems are operational and well-maintained to support training and coworking activities.',
            responsibilities: JSON.stringify([
                'Manage computers, Wi-Fi, printers, and network',
                'Support technical needs during training sessions',
                'Handle device setup for events',
                'Maintain system backups and basic cybersecurity',
                'Provide on-site troubleshooting'
            ]),
            requirements: JSON.stringify([
                'OND/HND/BSc in ICT, Computer Science, Engineering',
                'Experience in IT support or lab setup'
            ]),
            status: 'closed'
        },
        {
            title: 'Programs & Training Coordinator',
            department: 'Programs',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Plan, organize, and oversee all training programs, workshops, and incubation activities at KDIH.',
            responsibilities: JSON.stringify([
                'Plan and coordinate all training & workshops',
                'Communicate with trainers, mentors & participants',
                'Manage attendance, schedules, and logistics',
                'Oversee incubation-related activities',
                'Support certificates, reporting & curriculum planning'
            ]),
            requirements: JSON.stringify([
                'Experience coordinating programs or trainings',
                'Excellent communication & organization skills'
            ]),
            status: 'closed'
        },
        {
            title: 'Front Desk / Customer & Member Services Officer',
            department: 'Operations',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Be the first point of contact for visitors, members, and partners, ensuring excellent customer service and smooth front office operations.',
            responsibilities: JSON.stringify([
                'Visitor reception & inquiries',
                'Coworking bookings and class registrations',
                'Phone calls, emails, and customer support',
                'Front desk organization and admin tasks'
            ]),
            requirements: JSON.stringify([
                'Good communication skills',
                'Customer-friendly attitude',
                'Basic computer skills'
            ]),
            status: 'closed'
        },
        {
            title: 'Part-Time Trainers & Consultants',
            department: 'Training',
            employment_type: 'part-time',
            salary_info: 'Per Session',
            application_deadline: null,
            description: 'Deliver specialized training sessions and provide expert consultation to hub members and startups in various tech and business domains.',
            responsibilities: JSON.stringify([
                'Deliver high-quality, hands-on training sessions',
                'Develop or adapt training materials and curriculum',
                'Assess participant learning and provide feedback',
                'Provide mentorship and consultation to startups',
                'Maintain professional standards and expertise'
            ]),
            requirements: JSON.stringify([
                'Proven skills and training experience',
                'Ability to deliver hands-on practical sessions',
                'Expertise in: Data Analytics, Cybersecurity, Web Development, UI/UX Design, Digital Marketing, Python, ICT Consulting, or Business/Entrepreneurship'
            ]),
            status: 'closed'
        },
        {
            title: 'Facility & Operations Assistant',
            department: 'Operations',
            employment_type: 'full-time',
            salary_info: 'Competitive',
            application_deadline: '2026-01-31',
            description: 'Support the maintenance of the hub\'s physical environment and assist with event setup and logistics.',
            responsibilities: JSON.stringify([
                'Maintain cleanliness and order',
                'Support event setup and logistics',
                'Assist with power (generator/inverter)',
                'Manage utilities and supplies'
            ]),
            requirements: JSON.stringify([
                'Good work ethic',
                'Basic technical understanding is a plus'
            ]),
            status: 'closed'
        }
    ];

    // Insert existing jobs
    const stmt = db.prepare(`
        INSERT INTO jobs (
            title, department, employment_type, location, salary_info,
            application_deadline, description, responsibilities, requirements, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    existingJobs.forEach(job => {
        stmt.run(
            job.title,
            job.department,
            job.employment_type,
            'Katsina, Nigeria',
            job.salary_info,
            job.application_deadline,
            job.description,
            job.responsibilities,
            job.requirements,
            job.status,
            (err) => {
                if (err) {
                    console.error(`Error inserting job "${job.title}":`, err);
                } else {
                    console.log(`✓ Migrated job: ${job.title}`);
                }
            }
        );
    });

    stmt.finalize();

    console.log('\nMigration completed!');
    console.log('Run this script with: node add-jobs-table.js');
});

db.close();
