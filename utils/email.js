const logger = require('./logger');

// Create reusable transporter
let transporter = null;
let emailConfigured = false;

try {
    const nodemailer = require('nodemailer');

    if (process.env.EMAIL_SERVICE === 'gmail') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        emailConfigured = true;
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
        emailConfigured = true;
    } else if (process.env.EMAIL_HOST) {
        // Custom SMTP
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        emailConfigured = true;
    } else {
        logger.warn('Email service not configured. Email notifications will be disabled.');
    }
} catch (error) {
    logger.error(`Email configuration error: ${error.message}`);
    logger.warn('Email notifications will be disabled.');
}

// Email templates
const emailTemplates = {
    welcome: (name, interest) => {
        let actionLink = '';
        let actionText = '';

        if (interest === 'Training') {
            actionLink = `<p>Ready to start learning? <a href="${process.env.APP_URL}/courses.html" style="color: #2563eb; font-weight: bold;">Browse our Courses</a></p>`;
            actionText = 'Check out our available courses and enroll today!';
        } else if (interest === 'Coworking') {
            actionLink = `<p>Need a workspace? <a href="${process.env.APP_URL}/coworking.html" style="color: #2563eb; font-weight: bold;">Book a Desk</a></p>`;
            actionText = 'Secure your spot in our modern co-working space.';
        } else {
            actionLink = `<p>Explore all our services: <a href="${process.env.APP_URL}" style="color: #2563eb; font-weight: bold;">Visit Website</a></p>`;
            actionText = 'We will be in touch shortly to discuss your needs.';
        }

        return {
            subject: 'Welcome to KDIH!',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to Katsina Digital Innovation Hub!</h2>
                <p>Dear ${name},</p>
                <p>Thank you for your interest in <strong>${interest}</strong> at KDIH. We're excited to connect with you.</p>
                
                ${actionLink}
                
                <p>${actionText}</p>

                <p>You can also explore our other services:</p>
                <ul>
                    <li>Professional courses and training programs</li>
                    <li>Startup incubation opportunities</li>
                    <li>Co-working space facilities</li>
                    <li>Tech events and workshops</li>
                </ul>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
        };
    },

    courseEnrollment: (name, courseTitle, startDate) => ({
        subject: `Course Enrollment Confirmation - ${courseTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Course Enrollment Confirmed!</h2>
                <p>Dear ${name},</p>
                <p>You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p>We will send you further details about the course schedule and materials soon.</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    roomBooking: (name, roomName, bookingDate, startTime, endTime, amount) => ({
        subject: `Room Booking Confirmation - ${roomName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
                <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2563eb; margin-bottom: 20px;">✓ Room Booking Confirmed!</h2>
                    
                    <p>Dear ${name},</p>
                    
                    <p>Your meeting room booking has been confirmed. Here are your booking details:</p>
                    
                    <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Room:</strong></td>
                                <td style="padding: 8px 0; color: #0f172a;">${roomName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Date:</strong></td>
                                <td style="padding: 8px 0; color: #0f172a;">${new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Time:</strong></td>
                                <td style="padding: 8px 0; color: #0f172a;">${startTime} - ${endTime}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">💳 Payment Advice</h3>
                        <p style="color: #78350f; margin: 5px 0; font-size: 14px;">Please complete payment to confirm your reservation:</p>
                        <ul style="color: #78350f; margin: 10px 0; padding-left: 20px; font-size: 14px;">
                            <li><strong>Bank:</strong> UBA</li>
                            <li><strong>Account Name:</strong> Katsina Digital Innovation Hub</li>
                            <li><strong>Account Number:</strong> 1028403842</li>
                            <li><strong>Amount:</strong> ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
                        </ul>
                        <p style="color: #78350f; margin: 5px 0; font-size: 13px;"><em>Send payment confirmation to: payments@kdih.org</em></p>
                    </div>

                    <p style="margin-top: 20px;">If you have any questions or need to modify your booking, please contact us immediately.</p>
                    
                    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                        Best regards,<br>
                        <strong style="color: #0f172a;">The KDIH Team</strong><br>
                        Email: info@kdih.org, katsinadigitalhub@gmail.com | Phone: +234 701 111 4441
                    </p>
                </div>
            </div>
        `
    }),

    eventRegistration: (name, eventTitle, eventDate) => ({
        subject: `Event Registration Confirmed - ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Event Registration Confirmed!</h2>
                <p>Dear ${name},</p>
                <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
                <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                <p>We look forward to seeing you at the event!</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    certificateIssued: (name, courseTitle, certificateNumber, verificationCode) => ({
        subject: `Your KDIH Certificate - ${courseTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Congratulations! Your Certificate is Ready</h2>
                <p>Dear ${name},</p>
                <p>Congratulations on completing <strong>${courseTitle}</strong>!</p>
                <p>Your certificate has been issued with the following details:</p>
                <ul>
                    <li><strong>Certificate Number:</strong> ${certificateNumber}</li>
                    <li><strong>Verification Code:</strong> ${verificationCode}</li>
                </ul>
                <p>You can verify your certificate at any time: <a href="${process.env.APP_URL}/verify-certificate.html">Verify Certificate</a></p>
                <p>We're proud of your achievement and wish you continued success!</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    startupApplicationReceived: (founderName, startupName) => ({
        subject: 'Startup Incubation Application Received',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Application Received!</h2>
                <p>Dear ${founderName},</p>
                <p>Thank you for applying to the KDIH Startup Incubation Program with <strong>${startupName}</strong>.</p>
                <p>Our team will review your application and get back to you within 5-7 business days.</p>
                <p>In the meantime, feel free to explore our resources and connect with our community.</p>
                <p>Best regards,<br>The KDIH Incubation Team</p>
            </div>
        `
    }),

    startupApplicationStatus: (founderName, startupName, status) => ({
        subject: `Startup Application Update - ${startupName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Application Status Update</h2>
                <p>Dear ${founderName},</p>
                <p>Your application for <strong>${startupName}</strong> has been ${status}.</p>
                ${status === 'accepted' ? `
                    <p>Congratulations! We're excited to have you join our incubation program.</p>
                    <p>Our team will contact you soon with next steps and program details.</p>
                ` : status === 'rejected' ? `
                    <p>Unfortunately, we are unable to accept your application at this time.</p>
                    <p>We encourage you to continue developing your idea and apply again in the future.</p>
                ` : `
                    <p>Your application status has been updated to: <strong>${status}</strong>.</p>
                `}
                <p>Best regards,<br>The KDIH Incubation Team</p>
            </div>
        `
    }),

    passwordReset: (email, token) => ({
        subject: 'Reset Your KDIH Admin Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>We received a request to reset your password for the KDIH Admin Dashboard.</p>
                <p>Click the link below to set a new password:</p>
                <p>
                    <a href="${process.env.APP_URL || 'https://kdih-website.onrender.com'}/admin/reset-password.html?token=${token}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                       Reset Password
                    </a>
                </p>
                <p style="margin-top: 20px; color: #64748b; font-size: 14px;">This link is valid for 1 hour.</p>
                <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    coworkingRegistration: (name, memberCode, type, startDate, endDate) => ({
        subject: 'Welcome to KDIH Co-working Community!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to the Hub!</h2>
                <p>Dear ${name},</p>
                <p>Your membership has been successfully registered.</p>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 0.9em;">Member ID</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.5em; font-weight: bold; color: #0f172a; letter-spacing: 1px;">${memberCode}</p>
                </div>
                <p><strong>Membership Details:</strong></p>
                <ul>
                    <li><strong>Type:</strong> ${type}</li>
                    <li><strong>Validity:</strong> ${startDate} to ${endDate}</li>
                </ul>
                <p>Please use your Member ID (${memberCode}) to book desks and meeting rooms.</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    deskBookingConfirmed: (name, deskNumber, date, bookingId) => ({
        subject: `Desk Booking Confirmed - ${deskNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Desk Reserved! ✅</h2>
                <p>Dear ${name},</p>
                <p>You have successfully booked <strong>${deskNumber}</strong> for ${date}.</p>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p>Please check in at the front desk when you arrive.</p>
                </div>

                <p><strong>What you can do in your member portal:</strong></p>
                <ul>
                    <li>View and access enrolled courses</li>
                    <li>Book co-working desks and meeting rooms</li>
                    <li>Manage your profile</li>
                    <li>Track your progress</li>
                </ul>

                <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">This link is valid for <strong>1 hour</strong>.</p>
                <p style="color: #64748b; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">For security reasons, this link will expire after 1 hour. If you need a new link, visit the forgot password page again.</p>
                </div>
                <p style="margin-top: 20px;">Best regards,<br>The KDIH Team</p>
            </div>
        `
    }),

    contactAcknowledgment: (name) => ({
        subject: 'We received your message - KDIH',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Thank You for Contacting KDIH</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and appreciate you reaching out to us.</p>
                <p>Our team will review your inquiry and get back to you as soon as possible.</p>
                <p>Best regards,<br>The KDIH Team</p>
            </div>
        `
    })
};

// Send email function
async function sendEmail(to, templateName, data) {
    // If email is not configured, log and return success (don't block operations)
    if (!emailConfigured || !transporter) {
        logger.warn(`Email not sent (service not configured): ${templateName} to ${to}`);
        return { success: true, messageId: 'email-disabled', skipped: true };
    }

    try {
        const template = emailTemplates[templateName];
        if (!template) {
            throw new Error(`Email template '${templateName}' not found`);
        }

        const { subject, html } = typeof template === 'function' ? template(...data) : template;

        const mailOptions = {
            from: `"KDIH" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Email sending failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test email configuration
async function testEmailConfig() {
    if (!emailConfigured || !transporter) {
        logger.warn('Email service not configured');
        return false;
    }

    try {
        await transporter.verify();
        logger.info('Email configuration is valid');
        return true;
    } catch (error) {
        logger.error(`Email configuration error: ${error.message}`);
        return false;
    }
}

/**
 * Send custom free-form email
 */
async function sendCustomEmail(to, subject, messageBody) {
    if (!emailConfigured || !transporter) {
        logger.warn('Email service not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const mailOptions = {
            from: `"KDIH" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: messageBody,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e3a8a; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">KDIH</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <div style="white-space: pre-wrap;">${messageBody.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div style="background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                        <p>This email was sent from Kano Digital Innovation Hub</p>
                        <p>© ${new Date().getFullYear()} KDIH. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Custom email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Custom email sending failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Send email with PDF attachment
 */
async function sendEmailWithAttachment(to, subject, messageBody, attachmentBuffer, filename) {
    if (!emailConfigured || !transporter) {
        logger.warn('Email service not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const mailOptions = {
            from: `"KDIH" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: messageBody,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e3a8a; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">KDIH</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <div style="white-space: pre-wrap;">${messageBody.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div style="background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                        <p>This email was sent from Kano Digital Innovation Hub</p>
                        <p>© ${new Date().getFullYear()} KDIH. All rights reserved.</p>
                    </div>
                </div>
            `,
            attachments: [{
                filename: filename,
                content: attachmentBuffer,
                contentType: 'application/pdf'
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email with attachment sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Email with attachment failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendEmail,
    testEmailConfig,
    sendCustomEmail,
    sendEmailWithAttachment,
    emailTemplates
};
