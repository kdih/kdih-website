const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendEmail } = require('../utils/email');

// Middleware for authentication
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ===== EXISTING ENDPOINTS =====

// Get all services
router.get('/services', (req, res) => {
    const sql = "SELECT * FROM services";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create service (Admin only)
router.post('/services', requireAuth, (req, res) => {
    const { icon, title, description } = req.body;
    const sql = `INSERT INTO services (icon, title, description) VALUES (?, ?, ?)`;

    db.run(sql, [icon, title, description], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', id: this.lastID });
    });
});

// Update service (Admin only)
router.put('/services/:id', requireAuth, (req, res) => {
    const serviceId = req.params.id;
    const { icon, title, description } = req.body;

    const sql = `UPDATE services SET icon = ?, title = ?, description = ? WHERE id = ?`;

    db.run(sql, [icon, title, description, serviceId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Service not found' });
        res.json({ message: 'success', changes: this.changes });
    });
});

// Delete service (Admin only)
router.delete('/services/:id', requireAuth, (req, res) => {
    const serviceId = req.params.id;
    const sql = `DELETE FROM services WHERE id = ?`;

    db.run(sql, [serviceId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Service not found' });
        res.json({ message: 'success', changes: this.changes });
    });
});

// Get all stats (Dynamic - calculated from database)
router.get('/stats', async (req, res) => {
    try {
        const stats = [];

        // 1. Youth Trained - Count from course_registrations + member_enrollments
        const youthTrainedQuery = `
            SELECT 
                (SELECT COUNT(DISTINCT email_personal) FROM course_registrations) +
                (SELECT COUNT(DISTINCT member_id) FROM member_enrollments)
                as total
        `;

        const youthTrained = await new Promise((resolve, reject) => {
            db.get(youthTrainedQuery, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });

        stats.push({
            id: 1,
            value: youthTrained,
            label: 'Youth Trained',
            suffix: '+'
        });

        // 2. Startups Incubated - Count accepted/incubated startup applications
        const startupsQuery = `
            SELECT COUNT(*) as total 
            FROM startup_applications 
            WHERE application_status IN ('accepted', 'incubated', 'active')
        `;

        const startupsIncubated = await new Promise((resolve, reject) => {
            db.get(startupsQuery, [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });

        stats.push({
            id: 2,
            value: startupsIncubated,
            label: 'Startups Incubated',
            suffix: '+'
        });

        // 3. Jobs Created - Estimated as 3x startups incubated (average team size)
        // You can update this calculation based on actual job data if available
        const jobsCreated = startupsIncubated * 3;

        stats.push({
            id: 3,
            value: jobsCreated,
            label: 'Jobs Created',
            suffix: '+'
        });

        // 4. Women Participation - Calculate percentage from course registrations
        const womenParticipationQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN LOWER(gender) IN ('female', 'f', 'woman') THEN 1 ELSE 0 END) as women_count
            FROM course_registrations
            WHERE gender IS NOT NULL AND gender != ''
        `;

        const participation = await new Promise((resolve, reject) => {
            db.get(womenParticipationQuery, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const womenPercentage = participation.total > 0
            ? Math.round((participation.women_count / participation.total) * 100)
            : 40; // Default to 40% if no data

        stats.push({
            id: 4,
            value: womenPercentage,
            label: '% Women Participation',
            suffix: '%'
        });

        res.json({
            "message": "success",
            "data": stats,
            "calculated_at": new Date().toISOString()
        });

    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ "error": error.message });
    }
});

// Contact Form Submission
router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    db.run(sql, [name, email, message], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'success', id: this.lastID });
    });
});

// Membership Registration
// Quick Inquiry (from Homepage)
router.post('/inquiry', (req, res) => {
    const { full_name, email, phone, interest } = req.body;
    const messageContent = `[Quick Inquiry]\nInterest: ${interest}\nPhone: ${phone}`;

    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    db.run(sql, [full_name, email, messageContent], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Send welcome/acknowledgement email
        sendEmail(email, 'welcome', [full_name, interest]).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.json({ message: 'success', id: this.lastID });
    });
});

// Course Enrollment
router.post('/enroll', (req, res) => {
    let {
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    } = req.body;

    // Calculate Next Available Cohort
    if (schedule === 'Next Available') {
        const now = new Date();
        // Default to 1st of next month
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        schedule = nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const sql = `INSERT INTO course_registrations (
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Send course enrollment confirmation email
        sendEmail(email_personal, 'courseEnrollment', [firstname, course_title, schedule]).catch(err => {
            console.error('Failed to send enrollment email:', err);
        });

        res.json({ message: 'success', id: this.lastID });
    });
});

// ===== AUTHENTICATION =====

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const bcrypt = require('bcrypt');
        const logger = require('../utils/logger');

        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
            if (err) {
                logger.error(`Login error: ${err.message}`);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!row) {
                logger.warn(`Failed login attempt for username: ${username}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password with bcrypt
            const validPassword = await bcrypt.compare(password, row.password);
            if (!validPassword) {
                logger.warn(`Invalid password for username: ${username}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            req.session.user = { id: row.id, username: row.username, role: row.role, email: row.email };
            logger.info(`User logged in: ${username}`);
            res.json({ message: 'success', user: { username: row.username, role: row.role } });
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error(`Login exception: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'success' });
});

router.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Forgot Password - Initiate Reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const crypto = require('crypto');
        const logger = require('../utils/logger');
        const { sendEmail } = require('../utils/email');

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (err) {
                logger.error(`Forgot password database error: ${err.message}`);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                // Determine response based on environment for security
                const isProd = process.env.NODE_ENV === 'production';
                // In production, we don't want to reveal if an email exists
                // In dev, we can be more explicit for debugging
                if (isProd) {
                    logger.warn(`Forgot password request for non-existent email: ${email}`);
                    return res.json({ message: 'If your email is registered, you will receive a reset link.' });
                } else {
                    return res.status(404).json({ error: 'Email not found' });
                }
            }

            // Generate reset token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

            // Save token to database
            db.run(
                "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
                [email, token, expiresAt.toISOString()],
                async function (err) {
                    if (err) {
                        logger.error(`Error saving reset token: ${err.message}`);
                        return res.status(500).json({ error: 'Failed to process request' });
                    }

                    // Send email
                    const emailResult = await sendEmail(email, 'passwordReset', [email, token]);

                    if (emailResult.success) {
                        logger.info(`Password reset email sent to: ${email}`);
                        res.json({ message: 'If your email is registered, you will receive a reset link.' });
                    } else {
                        logger.error(`Failed to send reset email: ${emailResult.error}`);
                        // Even if email fails, respond with success generic message to prevent user enumeration
                        res.json({ message: 'If your email is registered, you will receive a reset link.' });
                    }
                }
            );
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error(`Forgot password exception: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password - Verify Token and Set New Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const bcrypt = require('bcrypt');
        const logger = require('../utils/logger');

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Verify token exists and is not expired
        db.get(
            "SELECT * FROM password_resets WHERE token = ? AND expires_at > datetime('now')",
            [token],
            async (err, resetRequest) => {
                if (err) {
                    logger.error(`Reset password database error: ${err.message}`);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!resetRequest) {
                    return res.status(400).json({ error: 'Invalid or expired reset token' });
                }

                // Token valid, find user
                db.get("SELECT * FROM users WHERE email = ?", [resetRequest.email], async (err, user) => {
                    if (err || !user) {
                        logger.error(`User for reset token not found: ${resetRequest.email}`);
                        return res.status(404).json({ error: 'User account not found' });
                    }

                    // Hash new password
                    const hashedPassword = await bcrypt.hash(newPassword, 10);

                    // Update password
                    db.run(
                        "UPDATE users SET password = ? WHERE id = ?",
                        [hashedPassword, user.id],
                        function (err) {
                            if (err) {
                                logger.error(`Error updating password: ${err.message}`);
                                return res.status(500).json({ error: 'Failed to reset password' });
                            }

                            // Delete the consumed token (and any other tokens for this email for security)
                            db.run("DELETE FROM password_resets WHERE email = ?", [resetRequest.email]);

                            logger.info(`Password successfully reset for user: ${user.username}`);
                            res.json({ message: 'Password has been reset successfully. You can now login.' });
                        }
                    );
                });
            }
        );
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error(`Reset password exception: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password endpoint (requires authentication)
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user.id;
        const bcrypt = require('bcrypt');
        const logger = require('../utils/logger');

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Get current user from database
        db.get("SELECT * FROM users WHERE id = ?", [userId], async (err, user) => {
            if (err) {
                logger.error(`Password change error: ${err.message}`);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                logger.warn(`Invalid current password for user: ${user.username}`);
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in database
            db.run(
                "UPDATE users SET password = ? WHERE id = ?",
                [hashedPassword, userId],
                function (err) {
                    if (err) {
                        logger.error(`Error updating password: ${err.message}`);
                        return res.status(500).json({ error: 'Failed to update password' });
                    }

                    logger.info(`Password changed successfully for user: ${user.username}`);
                    res.json({ message: 'Password changed successfully' });
                }
            );
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error(`Password change exception: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ===== LMS ENDPOINTS =====

// Get all courses
router.get('/courses', (req, res) => {
    const sql = "SELECT * FROM courses WHERE status = 'active' ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// Get single course with modules
router.get('/courses/:id', (req, res) => {
    const courseId = req.params.id;

    db.get("SELECT * FROM courses WHERE id = ?", [courseId], (err, course) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        db.all("SELECT * FROM course_modules WHERE course_id = ? ORDER BY module_order", [courseId], (err, modules) => {
            if (err) return res.status(500).json({ error: err.message });
            course.modules = modules;
            res.json({ message: 'success', data: course });
        });
    });
});

// Create course (Admin only)
router.post('/courses', requireAuth, (req, res) => {
    const { title, description, track, duration_weeks, price, thumbnail_url } = req.body;
    const sql = `INSERT INTO courses (title, description, track, duration_weeks, instructor_id, price, thumbnail_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [title, description, track, duration_weeks, req.session.user.id, price, thumbnail_url], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', id: this.lastID });
    });
});

// Update course (Admin only)
router.put('/courses/:id', requireAuth, (req, res) => {
    console.log('PUT /courses/:id handler called with ID:', req.params.id);
    console.log('Request body:', req.body);
    const courseId = req.params.id;
    const { title, description, track, duration_weeks, price, status, thumbnail_url } = req.body;

    const sql = `UPDATE courses 
                 SET title = ?, description = ?, track = ?, duration_weeks = ?, 
                     price = ?, status = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    db.run(sql, [title, description, track, duration_weeks, price, status || 'active', thumbnail_url, courseId], function (err) {
        if (err) {
            console.log('Error updating course:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            console.log('No course found with ID:', courseId);
            return res.status(404).json({ error: 'Course not found' });
        }
        console.log('Course updated successfully, changes:', this.changes);
        const response = { message: 'success', changes: this.changes };
        console.log('Sending response:', response);
        res.json(response);
    });
});

// Delete course (Admin only)
router.delete('/courses/:id', requireAuth, (req, res) => {
    const courseId = req.params.id;
    const sql = `DELETE FROM courses WHERE id = ?`;

    db.run(sql, [courseId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'success', changes: this.changes });
    });
});

// Student enrollment in course
router.post('/courses/:id/enroll', (req, res) => {
    const courseId = req.params.id;
    const { student_id, payment_status } = req.body;

    const sql = `INSERT INTO student_enrollments (student_id, course_id, payment_status) VALUES (?, ?, ?)`;
    db.run(sql, [student_id, courseId, payment_status || 'pending'], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', enrollment_id: this.lastID });
    });
});

// Get student enrollments
router.get('/students/:id/enrollments', (req, res) => {
    const studentId = req.params.id;
    const sql = `SELECT e.*, c.title as course_title, c.duration_weeks 
                 FROM student_enrollments e 
                 JOIN courses c ON e.course_id = c.id 
                 WHERE e.student_id = ?`;

    db.all(sql, [studentId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// ===== EVENTS ENDPOINTS =====

// Get all events
router.get('/events', (req, res) => {
    const sql = "SELECT * FROM events WHERE status != 'cancelled' ORDER BY event_date DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// Get upcoming events
router.get('/events/upcoming', (req, res) => {
    const sql = "SELECT * FROM events WHERE event_date >= datetime('now') AND status = 'upcoming' ORDER BY event_date ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// Create event (Admin only)
router.post('/events', requireAuth, (req, res) => {
    const { title, description, event_type, event_date, end_date, location, max_attendees, price, thumbnail_url } = req.body;
    const sql = `INSERT INTO events (title, description, event_type, event_date, end_date, location, max_attendees, price, thumbnail_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [title, description, event_type, event_date, end_date, location, max_attendees, price, thumbnail_url], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', id: this.lastID });
    });
});

// Update event (Admin only)
router.put('/events/:id', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const { title, description, event_type, event_date, end_date, location, max_attendees, price, status, thumbnail_url } = req.body;

    const sql = `UPDATE events 
                 SET title = ?, description = ?, event_type = ?, event_date = ?, end_date = ?,
                     location = ?, max_attendees = ?, price = ?, status = ?, thumbnail_url = ?
                 WHERE id = ?`;

    db.run(sql, [title, description, event_type, event_date, end_date, location, max_attendees, price, status || 'upcoming', thumbnail_url, eventId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'success', changes: this.changes });
    });
});

// Delete event (Admin only)
router.delete('/events/:id', requireAuth, (req, res) => {
    const eventId = req.params.id;
    const sql = `DELETE FROM events WHERE id = ?`;

    db.run(sql, [eventId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'success', changes: this.changes });
    });
});

// Register for event
router.post('/events/:id/register', (req, res) => {
    const eventId = req.params.id;
    const { attendee_name, attendee_email, attendee_phone } = req.body;

    const sql = `INSERT INTO event_registrations (event_id, attendee_name, attendee_email, attendee_phone) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [eventId, attendee_name, attendee_email, attendee_phone], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', registration_id: this.lastID });
    });
});

// ===== CERTIFICATES ENDPOINTS =====

// Generate certificate
router.post('/certificates/generate', requireAuth, (req, res) => {
    const { student_id, course_id, student_name, course_title, certificate_type } = req.body;

    // Generate unique certificate number and verification code
    const certificate_number = `KDIH-${Date.now()}-${student_id}`;
    const verification_code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const issue_date = new Date().toISOString().split('T')[0];

    const sql = `INSERT INTO certificates (certificate_number, student_id, course_id, student_name, course_title, 
                 issue_date, certificate_type, verification_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [certificate_number, student_id, course_id, student_name, course_title, issue_date, certificate_type, verification_code], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            message: 'success',
            certificate_id: this.lastID,
            certificate_number,
            verification_code
        });
    });
});

// Verify certificate
router.get('/certificates/verify/:code', (req, res) => {
    const code = req.params.code;
    const sql = "SELECT * FROM certificates WHERE verification_code = ? OR certificate_number = ?";

    db.get(sql, [code, code], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Certificate not found' });
        res.json({ message: 'success', data: row, valid: true });
    });
});

// ===== STARTUP INCUBATION ENDPOINTS =====

// Submit startup application
router.post('/startups/apply', (req, res) => {
    const { startup_name, founder_name, founder_email, founder_phone, business_description,
        pitch_deck_url, team_size, industry, stage, funding_sought } = req.body;

    const sql = `INSERT INTO startup_applications (startup_name, founder_name, founder_email, founder_phone, 
                 business_description, pitch_deck_url, team_size, industry, stage, funding_sought) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [startup_name, founder_name, founder_email, founder_phone, business_description,
        pitch_deck_url, team_size, industry, stage, funding_sought], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'success', application_id: this.lastID });
        });
});

// Get all startup applications (Admin only)
router.get('/admin/startups', requireAuth, (req, res) => {
    const sql = "SELECT * FROM startup_applications ORDER BY applied_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// Update application status (Admin only)
router.patch('/admin/startups/:id', requireAuth, (req, res) => {
    const { application_status } = req.body;
    const sql = "UPDATE startup_applications SET application_status = ? WHERE id = ?";

    db.run(sql, [application_status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success' });
    });
});

// ===== CO-WORKING SPACE ENDPOINTS =====

// Register as co-working member
router.post('/coworking/register', (req, res) => {
    const { full_name, email, phone, membership_type, start_date, end_date } = req.body;
    const sql = `INSERT INTO coworking_members (full_name, email, phone, membership_type, start_date, end_date) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [full_name, email, phone, membership_type, start_date, end_date], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', member_id: this.lastID });
    });
});

// Book a desk
router.post('/coworking/book-desk', (req, res) => {
    const { member_id, desk_number, booking_date, booking_type } = req.body;
    const sql = `INSERT INTO desk_bookings (member_id, desk_number, booking_date, booking_type) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [member_id, desk_number, booking_date, booking_type], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', booking_id: this.lastID });
    });
});

// Book meeting room
router.post('/coworking/book-room', (req, res) => {
    const { guest_name, guest_email, guest_phone, guest_organization, room_name, booking_date, start_time, end_time, purpose } = req.body;

    // Room capacity mapping
    const roomCapacity = {
        'Conference Room A': 10,
        'Conference Room B': 6,
        'Meeting Pod 1': 4,
        'Meeting Pod 2': 4
    };

    // Calculate duration in hours
    const [startHour, startMin] = start_time.split(':').map(Number);
    const [endHour, endMin] = end_time.split(':').map(Number);
    const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);

    // Calculate amount: ₦2,000 per seat per hour
    const capacity = roomCapacity[room_name] || 0;
    const hourlyRate = capacity * 2000;
    const totalAmount = hourlyRate * durationHours;

    const sql = `INSERT INTO meeting_room_bookings (
        guest_name, guest_email, guest_phone, guest_organization, room_name, booking_date, start_time, end_time, purpose
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [guest_name, guest_email, guest_phone, guest_organization, room_name, booking_date, start_time, end_time, purpose], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Send confirmation email with payment advice including calculated amount
        sendEmail(guest_email, 'roomBooking', [guest_name, room_name, booking_date, start_time, end_time, totalAmount]).catch(err => {
            console.error('Failed to send room booking confirmation email:', err);
        });

        res.json({ message: 'success', booking_id: this.lastID });
    });
});

// Check room availability for a specific time slot
router.post('/coworking/check-room-availability', (req, res) => {
    const { room_name, booking_date, start_time, end_time } = req.body;

    if (!room_name || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Query to find overlapping bookings
    // Two time ranges overlap if: start1 < end2 AND start2 < end1
    const sql = `
        SELECT * FROM meeting_room_bookings 
        WHERE room_name = ? 
        AND booking_date = ? 
        AND status = 'confirmed'
        AND (
            (start_time < ? AND end_time > ?) OR
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND end_time <= ?)
        )
    `;

    db.all(sql, [
        room_name,
        booking_date,
        end_time, start_time,      // Existing booking starts before requested end
        end_time, start_time,      // Existing booking ends after requested start
        start_time, end_time       // Existing booking is completely within requested range
    ], (err, conflicts) => {
        if (err) return res.status(500).json({ error: err.message });

        if (conflicts.length > 0) {
            res.json({
                available: false,
                conflicts: conflicts.map(c => ({
                    start_time: c.start_time,
                    end_time: c.end_time,
                    booking_id: c.id
                }))
            });
        } else {
            res.json({ available: true, conflicts: [] });
        }
    });
});

// Check availability for all rooms at a specific time slot
router.post('/coworking/check-all-rooms', (req, res) => {
    const { booking_date, start_time, end_time } = req.body;

    if (!booking_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const rooms = [
        'Conference Room A',
        'Conference Room B',
        'Meeting Pod 1',
        'Meeting Pod 2'
    ];

    const sql = `
        SELECT room_name, start_time, end_time FROM meeting_room_bookings 
        WHERE booking_date = ? 
        AND status = 'confirmed'
        AND (
            (start_time < ? AND end_time > ?) OR
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND end_time <= ?)
        )
    `;

    db.all(sql, [
        booking_date,
        end_time, start_time,
        end_time, start_time,
        start_time, end_time
    ], (err, bookings) => {
        if (err) return res.status(500).json({ error: err.message });

        // Create availability map
        const bookedRooms = bookings.map(b => b.room_name);
        const availability = rooms.map(room => ({
            room_name: room,
            available: !bookedRooms.includes(room),
            conflicts: bookings
                .filter(b => b.room_name === room)
                .map(b => ({ start_time: b.start_time, end_time: b.end_time }))
        }));

        res.json({ rooms: availability });
    });
});

// Get desk availability for a date
router.get('/coworking/available-desks/:date', (req, res) => {
    const date = req.params.date;
    const sql = "SELECT desk_number FROM desk_bookings WHERE booking_date = ? AND status = 'confirmed'";

    db.all(sql, [date], (err, booked) => {
        if (err) return res.status(500).json({ error: err.message });

        const bookedDesks = booked.map(b => b.desk_number);
        const allDesks = [];

        for (let i = 1; i <= 20; i++) {
            const deskNum = `DESK-${i}`;
            allDesks.push({
                desk_number: deskNum,
                status: bookedDesks.includes(deskNum) ? 'booked' : 'available'
            });
        }

        res.json({ message: 'success', desks: allDesks });
    });
});

// ===== ANALYTICS ENDPOINTS =====

// Dashboard analytics (Admin only)
router.get('/admin/analytics/dashboard', requireAuth, (req, res) => {
    const analytics = {};

    // Get total students
    db.get("SELECT COUNT(*) as count FROM course_registrations", [], (err, row) => {
        analytics.total_students = row ? row.count : 0;

        // Get total revenue (from payments)
        db.get("SELECT SUM(amount) as total FROM payments WHERE status = 'success'", [], (err, row) => {
            analytics.total_revenue = row && row.total ? row.total : 0;

            // Get active courses
            db.get("SELECT COUNT(*) as count FROM courses WHERE status = 'active'", [], (err, row) => {
                analytics.active_courses = row ? row.count : 0;

                // Get upcoming events
                db.get("SELECT COUNT(*) as count FROM events WHERE event_date >= datetime('now')", [], (err, row) => {
                    analytics.upcoming_events = row ? row.count : 0;

                    // Get startup applications
                    db.get("SELECT COUNT(*) as count FROM startup_applications WHERE application_status = 'pending'", [], (err, row) => {
                        analytics.pending_applications = row ? row.count : 0;

                        // Get co-working members
                        db.get("SELECT COUNT(*) as count FROM coworking_members WHERE status = 'active'", [], (err, row) => {
                            analytics.active_members = row ? row.count : 0;

                            res.json({ message: 'success', data: analytics });
                        });
                    });
                });
            });
        });
    });
});

// Course completion rates
router.get('/admin/analytics/completion-rates', requireAuth, (req, res) => {
    const sql = `SELECT 
                    c.title,
                    COUNT(e.id) as total_enrollments,
                    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed,
                    ROUND(CAST(SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(e.id) * 100, 2) as completion_rate
                 FROM courses c
                 LEFT JOIN student_enrollments e ON c.id = e.course_id
                 GROUP BY c.id, c.title`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// ===== ADMIN ROUTES (Protected) =====

// Get all members
router.get('/admin/members', requireAuth, (req, res) => {
    db.all("SELECT * FROM members ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Delete member
router.delete('/admin/members/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM members WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success' });
    });
});

// Get all messages
router.get('/admin/messages', requireAuth, (req, res) => {
    db.all("SELECT * FROM messages ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Delete message
router.delete('/admin/messages/:id', requireAuth, (req, res) => {
    db.run("DELETE FROM messages WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success' });
    });
});

// Get all course registrations
router.get('/admin/registrations', requireAuth, (req, res) => {
    db.all("SELECT * FROM course_registrations ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Get all members with detailed summary data
router.get('/admin/members/detailed', requireAuth, (req, res) => {
    const sql = `
        SELECT 
            m.id,
            m.full_name,
            m.email,
            m.phone,
            m.member_type,
            m.created_at,
            m.last_login,
            m.is_active,
            (SELECT COUNT(*) FROM course_registrations cr WHERE cr.email_personal = m.email) as course_registrations_count,
            (SELECT COUNT(*) FROM member_enrollments me WHERE me.member_id = m.id) as lms_enrollments_count,
            (SELECT COUNT(*) FROM coworking_memberships cm WHERE cm.member_id = m.id AND cm.status = 'active') as active_memberships_count,
            (SELECT SUM(amount) FROM payments p WHERE p.user_id = m.id AND p.status = 'success') as total_payments
        FROM members m
        WHERE m.password IS NOT NULL
        ORDER BY m.created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error(`Error fetching detailed members: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

// Get detailed dashboard for a specific member
router.get('/admin/members/:id/dashboard', requireAuth, (req, res) => {
    const memberId = req.params.id;
    const logger = require('../utils/logger');

    // Get member basic info
    db.get('SELECT id, full_name, email, phone, member_type, created_at, last_login, is_active FROM members WHERE id = ?',
        [memberId], (err, member) => {
            if (err || !member) {
                return res.status(404).json({ error: 'Member not found' });
            }

            const dashboardData = {
                member: member,
                course_registrations: [],
                lms_enrollments: [],
                coworking_memberships: [],
                desk_bookings: [],
                payments: []
            };

            // Get course registrations from course_registrations table
            const regSql = `
            SELECT 
                cr.id,
                cr.course_title,
                cr.schedule,
                cr.firstname,
                cr.surname,
                cr.email_personal,
                cr.phone,
                cr.organization,
                cr.payment_status,
                cr.course_fee,
                cr.payment_reference,
                cr.created_at,
                c.price as course_price,
                c.duration_weeks,
                c.id as course_id
            FROM course_registrations cr
            LEFT JOIN courses c ON cr.course_title = c.title
            WHERE cr.email_personal = ?
            ORDER BY cr.created_at DESC
        `;

            db.all(regSql, [member.email], (err, registrations) => {
                if (!err && registrations) {
                    // Calculate completion dates
                    dashboardData.course_registrations = registrations.map(reg => {
                        let completion_date = null;
                        if (reg.duration_weeks && reg.created_at) {
                            const enrollDate = new Date(reg.created_at);
                            completion_date = new Date(enrollDate);
                            completion_date.setDate(completion_date.getDate() + (reg.duration_weeks * 7));
                        }
                        return {
                            ...reg,
                            completion_date: completion_date ? completion_date.toISOString() : null,
                            fee_display: reg.course_fee || (reg.course_price ? reg.course_price * 100 : 0)
                        };
                    });
                }

                // Get LMS enrollments from member_enrollments table
                const lmsSql = `
                SELECT 
                    me.id,
                    me.course_id,
                    me.enrollment_date,
                    me.completion_date,
                    me.progress_percentage,
                    me.status,
                    me.payment_status,
                    c.title as course_title,
                    c.duration_weeks,
                    c.price,
                    c.track
                FROM member_enrollments me
                JOIN courses c ON me.course_id = c.id
                WHERE me.member_id = ?
                ORDER BY me.enrollment_date DESC
            `;

                db.all(lmsSql, [memberId], (err, lmsEnrollments) => {
                    if (!err && lmsEnrollments) {
                        dashboardData.lms_enrollments = lmsEnrollments.map(enr => {
                            let expected_completion = null;
                            if (enr.duration_weeks && enr.enrollment_date && !enr.completion_date) {
                                const enrollDate = new Date(enr.enrollment_date);
                                expected_completion = new Date(enrollDate);
                                expected_completion.setDate(expected_completion.getDate() + (enr.duration_weeks * 7));
                            }
                            return {
                                ...enr,
                                expected_completion_date: expected_completion ? expected_completion.toISOString() : null
                            };
                        });
                    }

                    // Get coworking memberships
                    const membershipSql = `
                    SELECT 
                        id,
                        membership_plan,
                        start_date,
                        end_date,
                        status,
                        payment_amount,
                        payment_status,
                        auto_renew,
                        created_at
                    FROM coworking_memberships
                    WHERE member_id = ?
                    ORDER BY created_at DESC
                `;

                    db.all(membershipSql, [memberId], (err, memberships) => {
                        if (!err && memberships) {
                            dashboardData.coworking_memberships = memberships.map(mem => {
                                const now = new Date();
                                const endDate = new Date(mem.end_date);
                                const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                                return {
                                    ...mem,
                                    days_remaining: daysRemaining,
                                    is_expired: daysRemaining < 0,
                                    is_expiring_soon: daysRemaining >= 0 && daysRemaining <= 7
                                };
                            });
                        }

                        // Get desk bookings
                        const bookingsSql = `
                        SELECT 
                            id,
                            desk_type,
                            booking_date,
                            start_time,
                            end_time,
                            status,
                            created_at
                        FROM desk_bookings
                        WHERE member_id = ?
                        ORDER BY booking_date DESC
                        LIMIT 20
                    `;

                        db.all(bookingsSql, [memberId], (err, bookings) => {
                            if (!err && bookings) {
                                dashboardData.desk_bookings = bookings;
                            }

                            // Get payment history
                            const paymentsSql = `
                            SELECT 
                                id,
                                amount,
                                payment_method,
                                payment_reference,
                                status,
                                payment_for,
                                created_at,
                                paid_at,
                                metadata
                            FROM payments
                            WHERE user_id = ?
                            ORDER BY created_at DESC
                        `;

                            db.all(paymentsSql, [memberId], (err, payments) => {
                                if (!err && payments) {
                                    dashboardData.payments = payments;
                                }

                                logger.info(`Admin viewed dashboard for member ID: ${memberId}`);
                                res.json({ message: 'success', data: dashboardData });
                            });
                        });
                    });
                });
            });
        });
});

// Get all events (Admin)
router.get('/admin/events', requireAuth, (req, res) => {
    db.all("SELECT * FROM events ORDER BY event_date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Get event registrations
router.get('/admin/events/:id/registrations', requireAuth, (req, res) => {
    db.all("SELECT * FROM event_registrations WHERE event_id = ? ORDER BY registered_at DESC", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// ===== PAYMENT ENDPOINTS (Paystack) =====

const paystack = require('../utils/paystack');
const logger = require('../utils/logger');
const email = require('../utils/email');

// Initialize payment
router.post('/payments/initialize', async (req, res) => {
    try {
        const { email: userEmail, amount, payment_type, metadata } = req.body;

        const paymentData = await paystack.initializePayment(userEmail, amount, {
            ...metadata,
            payment_type
        });

        // Save payment record
        const sql = `INSERT INTO payments (reference, user_id, amount, payment_type, status, metadata) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(sql, [
            paymentData.reference,
            metadata.user_id || null,
            amount,
            payment_type,
            'pending',
            JSON.stringify(metadata)
        ], function (err) {
            if (err) {
                logger.error(`Payment record creation failed: ${err.message}`);
            }
        });

        logger.info(`Payment initialized: ${paymentData.reference}`);
        res.json({
            message: 'success',
            authorization_url: paymentData.authorization_url,
            access_code: paymentData.access_code,
            reference: paymentData.reference
        });
    } catch (error) {
        logger.error(`Payment initialization error: ${error.message}`);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

// Verify payment
// Helper function to process successful payment
async function processSuccessfulPayment(reference) {
    return new Promise((resolve, reject) => {
        // 1. Update payment status
        db.run(`UPDATE payments SET status = ?, paid_at = datetime('now') WHERE reference = ?`,
            ['success', reference], function (err) {
                if (err) return reject(err);

                // 2. Get payment details to find enrollment info
                db.get('SELECT * FROM payments WHERE reference = ?', [reference], (err, payment) => {
                    if (err || !payment) return resolve(payment);

                    try {
                        const metadata = JSON.parse(payment.metadata || '{}');

                        // If this is a course enrollment payment
                        if (metadata.enrollment_id) {
                            const enrollmentId = metadata.enrollment_id;

                            // 3. Update course_registrations status
                            db.run('UPDATE course_registrations SET payment_status = ? WHERE id = ?',
                                ['paid', enrollmentId], (err) => {
                                    if (err) console.error('Error updating registration status:', err);

                                    // 4. Create member_enrollment record (LMS Access)
                                    // First get course details
                                    db.get(`
                                        SELECT cr.email_personal, cr.course_title, c.id as course_id, c.duration_weeks 
                                        FROM course_registrations cr
                                        LEFT JOIN courses c ON cr.course_title = c.title
                                        WHERE cr.id = ?
                                    `, [enrollmentId], (err, details) => {
                                        if (!err && details && details.course_id) {
                                            // Check if already enrolled
                                            db.get('SELECT id FROM member_enrollments WHERE member_id = ? AND course_id = ?',
                                                [payment.user_id, details.course_id], (err, existing) => {
                                                    if (!existing) {
                                                        // Insert new enrollment
                                                        db.run(`
                                                            INSERT INTO member_enrollments (
                                                                member_id, course_id, enrollment_date, 
                                                                status, payment_status, progress_percentage
                                                            ) VALUES (?, ?, datetime('now'), 'active', 'paid', 0)
                                                        `, [payment.user_id, details.course_id], (err) => {
                                                            if (err) console.error('Error creating LMS enrollment:', err);
                                                            else console.log(`Auto-enrolled member ${payment.user_id} in course ${details.course_id}`);
                                                        });
                                                    }
                                                });
                                        }
                                    });
                                });
                        }
                    } catch (e) {
                        console.error('Error processing payment metadata:', e);
                    }
                    resolve(payment);
                });
            });
    });
}

router.get('/payments/verify/:reference', async (req, res) => {
    try {
        const reference = req.params.reference;
        const paymentData = await paystack.verifyPayment(reference);

        if (paymentData.status === 'success') {
            await processSuccessfulPayment(reference);
        }

        logger.info(`Payment verified: ${reference}`);
        res.json({
            message: 'success',
            data: paymentData
        });
    } catch (error) {
        logger.error(`Payment verification error: ${error.message}`);
        res.status(400).json({ error: 'Payment verification failed' });
    }
});

// Check session endpoint
router.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.user.id,
                username: req.session.user.username,
                role: req.session.user.role,
                email: req.session.user.email
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Paystack webhook
router.post('/payments/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];

        if (!paystack.verifyWebhookSignature(req.rawBody, signature)) {
            logger.warn('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const reference = event.data.reference;
            await processSuccessfulPayment(reference);
            logger.info(`Webhook: Payment successful - ${reference}`);
        }

        res.status(200).send();
    } catch (error) {
        logger.error(`Webhook error: ${error.message}`);
        res.status(500).send();
    }
});

// ===== EMAIL ENDPOINTS =====

// Send test email (for configuration testing)
router.post('/email/test', requireAuth, async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        const result = await email.sendEmail(to, 'welcome', [text || 'Test User']);

        if (result.success) {
            res.json({ message: 'Email sent successfully', messageId: result.messageId });
        } else {
            res.status(500).json({ error: 'Email sending failed', details: result.error });
        }
    } catch (error) {
        logger.error(`Test email error: ${error.message}`);
        res.status(500).json({ error: 'Email sending failed' });
    }
});

// ===== FILE UPLOAD ENDPOINTS =====

const { uploadSingle } = require('../utils/upload');

// Upload pitch deck
router.post('/upload/pitch-deck', uploadSingle('pitchDeck'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        logger.info(`Pitch deck uploaded: ${req.file.filename}`);
        res.json({
            message: 'success',
            file: {
                filename: req.file.filename,
                path: `/uploads/pitch-decks/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        logger.error(`File upload error: ${error.message}`);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Upload profile picture
router.post('/upload/profile', uploadSingle('profile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        logger.info(`Profile picture uploaded: ${req.file.filename}`);
        res.json({
            message: 'success',
            file: {
                filename: req.file.filename,
                path: `/uploads/profiles/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        logger.error(`File upload error: ${error.message}`);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// ===== ENHANCED ENDPOINTS WITH EMAIL NOTIFICATIONS =====

// Enhanced course enrollment with email
router.post('/enroll-with-email', async (req, res) => {
    const {
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    } = req.body;

    const sql = `INSERT INTO course_registrations (
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        course_title, schedule, title, surname, firstname, othernames,
        gender, nationality, phone, email_personal, email_official,
        organization, job_title, department, country, state, city,
        address, duties, expectations, requirements, referral
    ];

    db.run(sql, params, async function (err) {
        if (err) {
            logger.error("Course enrollment error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Send confirmation email
        const fullName = `${firstname} ${surname}`;
        await email.sendEmail(email_personal, 'courseEnrollment', [fullName, course_title]);

        logger.info(`Course enrollment: ${fullName} - ${course_title}`);
        res.json({ message: 'success', id: this.lastID });
    });
});

// Enhanced event registration with email
router.post('/events/:id/register-with-email', async (req, res) => {
    const eventId = req.params.id;
    const { attendee_name, attendee_email, attendee_phone } = req.body;

    // Get event details
    db.get("SELECT * FROM events WHERE id = ?", [eventId], async (err, event) => {
        if (err || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const sql = `INSERT INTO event_registrations (event_id, attendee_name, attendee_email, attendee_phone) 
                     VALUES (?, ?, ?, ?)`;

        db.run(sql, [eventId, attendee_name, attendee_email, attendee_phone], async function (err) {
            if (err) {
                logger.error("Event registration error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            // Send confirmation email
            await email.sendEmail(attendee_email, 'eventRegistration', [
                attendee_name,
                event.title,
                event.event_date
            ]);

            logger.info(`Event registration: ${attendee_name} - ${event.title}`);
            res.json({ message: 'success', registration_id: this.lastID });
        });
    });
});

// Enhanced startup application with email
router.post('/startups/apply-with-email', async (req, res) => {
    const { startup_name, founder_name, founder_email, founder_phone, business_description,
        pitch_deck_url, team_size, industry, stage, funding_sought } = req.body;

    const sql = `INSERT INTO startup_applications (startup_name, founder_name, founder_email, founder_phone, 
                 business_description, pitch_deck_url, team_size, industry, stage, funding_sought) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [startup_name, founder_name, founder_email, founder_phone, business_description,
        pitch_deck_url, team_size, industry, stage, funding_sought], async function (err) {
            if (err) {
                logger.error("Startup application error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            // Send confirmation email
            await email.sendEmail(founder_email, 'startupApplicationReceived', [
                founder_name,
                startup_name
            ]);

            logger.info(`Startup application: ${startup_name} by ${founder_name}`);
            res.json({ message: 'success', application_id: this.lastID });
        });
});

// Enhanced certificate generation with email
router.post('/certificates/generate-with-email', requireAuth, async (req, res) => {
    const { student_id, course_id, student_name, student_email, course_title, certificate_type } = req.body;

    const certificate_number = `KDIH-${Date.now()}-${student_id}`;
    const verification_code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const issue_date = new Date().toISOString().split('T')[0];

    const sql = `INSERT INTO certificates (certificate_number, student_id, course_id, student_name, course_title, 
                 issue_date, certificate_type, verification_code) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [certificate_number, student_id, course_id, student_name, course_title, issue_date, certificate_type, verification_code], async function (err) {
        if (err) {
            logger.error("Certificate generation error:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Send certificate via email
        if (student_email) {
            await email.sendEmail(student_email, 'certificateIssued', [
                student_name,
                course_title,
                certificate_number,
                verification_code
            ]);
        }

        logger.info(`Certificate generated: ${certificate_number} for ${student_name}`);
        res.json({
            message: 'success',
            certificate_id: this.lastID,
            certificate_number,
            verification_code
        });
    });
});

// ===== SUPER ADMIN MIDDLEWARE =====

const requireSuperAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
};

// ===== ADMIN MANAGEMENT ENDPOINTS (Super Admin Only) =====

// Get all admins
router.get('/admin/users', requireSuperAdmin, (req, res) => {
    const sql = `SELECT id, username, email, role, created_at, is_active FROM users ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error(`Error fetching admins: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

// Create new admin
router.post('/admin/users', requireSuperAdmin, async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        const bcrypt = require('bcrypt');

        // Validate role
        if (!['admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (username, password, email, role, created_by) VALUES (?, ?, ?, ?, ?)`;

        db.run(sql, [username, hashedPassword, email, role, req.session.user.id], function (err) {
            if (err) {
                logger.error(`Error creating admin: ${err.message}`);
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }

            logger.info(`Admin created: ${username} by ${req.session.user.username}`);
            res.json({ message: 'success', id: this.lastID });
        });
    } catch (error) {
        logger.error(`Admin creation error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update admin
router.patch('/admin/users/:id', requireSuperAdmin, async (req, res) => {
    try {
        const { email, role, is_active } = req.body;
        const userId = req.params.id;

        // Prevent super admin from deactivating themselves
        if (userId == req.session.user.id && is_active === 0) {
            return res.status(400).json({ error: 'Cannot deactivate your own account' });
        }

        let sql = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (role !== undefined) {
            if (!['admin', 'super_admin'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
            updates.push('role = ?');
            params.push(role);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        sql += updates.join(', ') + ' WHERE id = ?';
        params.push(userId);

        db.run(sql, params, function (err) {
            if (err) {
                logger.error(`Error updating admin: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }

            logger.info(`Admin updated: ID ${userId} by ${req.session.user.username}`);
            res.json({ message: 'success' });
        });
    } catch (error) {
        logger.error(`Admin update error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete admin
router.delete('/admin/users/:id', requireSuperAdmin, (req, res) => {
    const userId = req.params.id;

    // Prevent super admin from deleting themselves
    if (userId == req.session.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const sql = 'DELETE FROM users WHERE id = ?';

    db.run(sql, [userId], function (err) {
        if (err) {
            logger.error(`Error deleting admin: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }

        logger.info(`Admin deleted: ID ${userId} by ${req.session.user.username}`);
        res.json({ message: 'success' });
    });
});

// Reset admin password (Super Admin only)
router.post('/admin/users/:id/reset-password', requireSuperAdmin, async (req, res) => {
    try {
        const { new_password } = req.body;
        const userId = req.params.id;
        const bcrypt = require('bcrypt');

        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        const sql = 'UPDATE users SET password = ? WHERE id = ?';

        db.run(sql, [hashedPassword, userId], function (err) {
            if (err) {
                logger.error(`Error resetting password: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }

            logger.info(`Password reset for user ID ${userId} by ${req.session.user.username}`);
            res.json({ message: 'success' });
        });
    } catch (error) {
        logger.error(`Password reset error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ===== MEMBER PORTAL ENDPOINTS =====

// Member Registration
router.post('/member/register', async (req, res) => {
    const { full_name, email, phone, password, member_type } = req.body;

    if (!full_name || !email || !password || !member_type) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO members (full_name, email, phone, password, member_type) 
                     VALUES (?, ?, ?, ?, ?)`;

        db.run(sql, [full_name, email, phone, hashedPassword, member_type], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                return res.status(500).json({ error: 'Registration failed' });
            }

            res.status(201).json({
                message: 'Account created successfully',
                member_id: this.lastID
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Member Login
router.post('/member/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const sql = 'SELECT * FROM members WHERE email = ? AND is_active = 1';

    db.get(sql, [email], async (err, member) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!member) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
            const bcrypt = require('bcrypt');
            const match = await bcrypt.compare(password, member.password);

            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            db.run('UPDATE members SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [member.id]);

            // Set session
            req.session.member = {
                id: member.id,
                email: member.email,
                full_name: member.full_name,
                member_type: member.member_type
            };

            res.json({
                message: 'Login successful',
                member: {
                    id: member.id,
                    full_name: member.full_name,
                    email: member.email,
                    member_type: member.member_type
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Member Logout
router.post('/member/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Check Member Session
router.get('/member/check-session', (req, res) => {
    if (req.session.member) {
        res.json({
            authenticated: true,
            member: req.session.member
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Middleware for member authentication
const requireMemberAuth = (req, res, next) => {
    if (!req.session.member) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Get Member Dashboard Data
router.get('/member/dashboard', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;
    const memberType = req.session.member.member_type;

    let dashboardData = {
        member: req.session.member,
        courses: [],
        membership: null,
        bookings: [],
        events: []
    };

    // Get enrolled courses (if student or both)
    if (memberType === 'student' || memberType === 'both') {
        const coursesSql = `
            SELECT c.*, me.progress_percentage, me.enrollment_date, me.status
            FROM member_enrollments me
            JOIN courses c ON me.course_id = c.id
            WHERE me.member_id = ?
            ORDER BY me.enrollment_date DESC
        `;

        db.all(coursesSql, [memberId], (err, courses) => {
            if (!err) dashboardData.courses = courses || [];

            // Get co-working membership (if coworking or both)
            if (memberType === 'coworking' || memberType === 'both') {
                const membershipSql = `
                    SELECT * FROM coworking_memberships 
                    WHERE member_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 1
                `;

                db.get(membershipSql, [memberId], (err, membership) => {
                    if (!err) dashboardData.membership = membership;

                    // Get desk bookings
                    const bookingsSql = `
                        SELECT * FROM desk_bookings 
                        WHERE member_id = ? 
                        ORDER BY booking_date DESC 
                        LIMIT 10
                    `;

                    db.all(bookingsSql, [memberId], (err, bookings) => {
                        if (!err) dashboardData.bookings = bookings || [];
                        res.json(dashboardData);
                    });
                });
            } else {
                res.json(dashboardData);
            }
        });
    } else if (memberType === 'coworking') {
        // Only co-working member
        const membershipSql = `
            SELECT * FROM coworking_memberships 
            WHERE member_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        db.get(membershipSql, [memberId], (err, membership) => {
            if (!err) dashboardData.membership = membership;

            const bookingsSql = `
                SELECT * FROM desk_bookings 
                WHERE member_id = ? 
                ORDER BY booking_date DESC 
                LIMIT 10
            `;

            db.all(bookingsSql, [memberId], (err, bookings) => {
                if (!err) dashboardData.bookings = bookings || [];
                res.json(dashboardData);
            });
        });
    }
});

// Get Membership Status
router.get('/member/membership-status', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;

    const sql = `
        SELECT * FROM coworking_memberships 
        WHERE member_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    `;

    db.get(sql, [memberId], (err, membership) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!membership) {
            return res.json({ has_membership: false });
        }

        // Check if expired
        const now = new Date();
        const endDate = new Date(membership.end_date);
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        res.json({
            has_membership: true,
            membership: membership,
            days_remaining: daysRemaining,
            is_expired: daysRemaining < 0
        });
    });
});

// Book Desk
router.post('/member/book-desk', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;
    const { desk_type, booking_date, start_time, end_time } = req.body;

    if (!desk_type || !booking_date) {
        return res.status(400).json({ error: 'Desk type and date required' });
    }

    const sql = `
        INSERT INTO desk_bookings (member_id, desk_type, booking_date, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, 'confirmed')
    `;

    db.run(sql, [memberId, desk_type, booking_date, start_time, end_time], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Booking failed' });
        }

        res.status(201).json({
            message: 'Desk booked successfully',
            booking_id: this.lastID
        });
    });
});

// Get Member Profile
router.get('/member/profile', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;

    const sql = 'SELECT id, full_name, email, phone, member_type, profile_photo, created_at, last_login FROM members WHERE id = ?';

    db.get(sql, [memberId], (err, member) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(member);
    });
});

// Update Member Profile
router.put('/member/profile', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;
    const { full_name, phone } = req.body;

    const sql = 'UPDATE members SET full_name = ?, phone = ? WHERE id = ?';

    db.run(sql, [full_name, phone, memberId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Update failed' });
        }
        req.session.member.full_name = full_name;

        res.json({ message: 'Profile updated successfully' });
    });
});

// ===== ADMIN - WALK-IN CUSTOMER MANAGEMENT =====

// Quick Add Member (Admin only)
router.post('/admin/members/quick-add', requireAuth, async (req, res) => {
    try {
        const { full_name, email, phone, member_type } = req.body;
        const bcrypt = require('bcrypt');
        const logger = require('../utils/logger');

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const sql = `INSERT INTO members (full_name, email, phone, member_type, password, created_at) 
                     VALUES (?, ?, ?, ?, ?, datetime('now'))`;

        db.run(sql, [full_name, email, phone, member_type, hashedPassword], function (err) {
            if (err) {
                logger.error(`Quick add member error: ${err.message}`);
                return res.status(500).json({ error: 'Member creation failed. Email might already exist.' });
            }

            // Send welcome email
            sendEmail(email, 'welcome', full_name).catch(err => {
                logger.error('Failed to send welcome email:', err);
            });

            logger.info(`Admin quick-added member: ${email}`);
            res.json({
                message: 'Member created successfully',
                member_id: this.lastID,
                email: email,
                temporary_password: tempPassword
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Record Manual Payment (Admin only)
router.post('/admin/payments/manual', requireAuth, async (req, res) => {
    try {
        const { member_email, amount, payment_method, payment_for, notes } = req.body;
        const logger = require('../utils/logger');

        // Get member ID from email
        db.get('SELECT id FROM members WHERE email = ?', [member_email], (err, member) => {
            if (err || !member) {
                return res.status(404).json({ error: 'Member not found' });
            }

            // Generate internal reference
            const reference = `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const sql = `INSERT INTO payments (
                member_id, amount, payment_method, payment_reference, 
                status, payment_for, notes, created_at, paid_at
            ) VALUES (?, ?, ?, ?, 'success', ?, ?, datetime('now'), datetime('now'))`;

            db.run(sql, [member.id, amount, payment_method, reference, payment_for, notes], function (err) {
                if (err) {
                    logger.error(`Manual payment recording error: ${err.message}`);
                    return res.status(500).json({ error: 'Payment recording failed' });
                }

                logger.info(`Admin recorded manual payment: ${reference}`);
                res.json({
                    message: 'Payment recorded successfully',
                    payment_id: this.lastID,
                    reference: reference,
                    amount: amount,
                    member_email: member_email
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Send Manual Email (Admin only)
router.post('/admin/send-email', requireAuth, async (req, res) => {
    try {
        const { email, template, ...params } = req.body;
        const logger = require('../utils/logger');

        // Validate template
        const validTemplates = ['welcome', 'courseEnrollment', 'eventRegistration', 'paymentConfirmation'];
        if (!validTemplates.includes(template)) {
            return res.status(400).json({ error: 'Invalid email template' });
        }

        // Send email
        await sendEmail(email, template, ...Object.values(params));

        logger.info(`Admin manually sent ${template} email to: ${email}`);
        res.json({
            message: 'Email sent successfully',
            email: email,
            template: template
        });
    } catch (error) {
        res.status(500).json({ error: 'Email sending failed: ' + error.message });
    }
});

// ===== MEMBER DASHBOARD - COURSE ENROLLMENTS & PAYMENTS =====

// Get Member's Course Enrollments
router.get('/member/enrollments', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;
    const memberEmail = req.session.member.email;

    // Get course registrations for this member
    const sql = `
        SELECT 
            cr.id,
            cr.course_title,
            cr.schedule,
            cr.payment_status,
            cr.course_fee,
            cr.payment_reference,
            cr.created_at,
            c.price as course_price,
            c.duration_weeks
        FROM course_registrations cr
        LEFT JOIN courses c ON cr.course_title = c.title
        WHERE cr.email_personal = ?
        ORDER BY cr.created_at DESC
    `;

    db.all(sql, [memberEmail], (err, enrollments) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch enrollments' });
        }

        // Update course_fee from courses table if not set
        enrollments.forEach(enrollment => {
            if (!enrollment.course_fee && enrollment.course_price) {
                enrollment.course_fee = enrollment.course_price * 100; // Convert to kobo
            }
        });

        res.json({
            message: 'success',
            data: enrollments
        });
    });
});

// Initialize Payment for Course
router.post('/member/courses/:id/pay', requireMemberAuth, async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const memberEmail = req.session.member.email;
        const paystack = require('../utils/paystack');
        const logger = require('../utils/logger');

        // Get enrollment details
        db.get(
            `SELECT cr.*, c.price, c.title as course_name 
             FROM course_registrations cr
             LEFT JOIN courses c ON cr.course_title = c.title
             WHERE cr.id = ? AND cr.email_personal = ?`,
            [enrollmentId, memberEmail],
            async (err, enrollment) => {
                if (err || !enrollment) {
                    return res.status(404).json({ error: 'Enrollment not found' });
                }

                if (enrollment.payment_status === 'paid') {
                    return res.status(400).json({ error: 'This course has already been paid for' });
                }

                const amount = enrollment.price * 100 || enrollment.course_fee || 0; // Amount in kobo

                if (amount === 0) {
                    return res.status(400).json({ error: 'Course price not set' });
                }

                // Initialize Paystack payment
                try {
                    const paymentData = await paystack.initializePayment({
                        email: memberEmail,
                        amount: amount,
                        metadata: {
                            enrollment_id: enrollmentId,
                            course_title: enrollment.course_title,
                            member_email: memberEmail,
                            payment_type: 'course_enrollment'
                        },
                        callback_url: `${process.env.APP_URL}/payment-success.html`
                    });

                    // Update enrollment with payment reference
                    db.run(
                        'UPDATE course_registrations SET payment_reference = ? WHERE id = ?',
                        [paymentData.reference, enrollmentId]
                    );

                    // Create payment record
                    db.run(
                        `INSERT INTO payments (member_id, amount, payment_method, payment_reference, status, payment_for, metadata)
                         SELECT id, ?, 'paystack', ?, 'pending', ?, ?
                         FROM members WHERE email = ?`,
                        [amount, paymentData.reference, `Course: ${enrollment.course_title}`,
                            JSON.stringify({ enrollment_id: enrollmentId }), memberEmail]
                    );

                    logger.info(`Course payment initi alized: ${paymentData.reference}`);
                    res.json({
                        message: 'success',
                        authorization_url: paymentData.authorization_url,
                        access_code: paymentData.access_code,
                        reference: paymentData.reference
                    });
                } catch (paystackError) {
                    logger.error(`Paystack error: ${paystackError.message}`);
                    res.status(500).json({ error: 'Payment initialization failed' });
                }
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Member's Payment History
router.get('/member/payments', requireMemberAuth, (req, res) => {
    const memberId = req.session.member.id;

    const sql = `
        SELECT 
            payment_reference,
            amount,
            payment_method,
            status,
            payment_for,
            created_at,
            paid_at
        FROM payments
        WHERE member_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [memberId], (err, payments) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        res.json({
            message: 'success',
            data: payments
        });
    });
});

module.exports = router;
