// Analytics helper functions
const db = require('../database');

/**
 * Get overview analytics
 */
async function getOverviewAnalytics() {
    return new Promise((resolve, reject) => {
        const queries = {
            // Total members across all types
            totalMembers: `
        SELECT 
          (SELECT COUNT(*) FROM members WHERE is_active = 1) +
          (SELECT COUNT(*) FROM coworking_members WHERE status = 'active')
        as total
      `,

            // Total revenue
            totalRevenue: `
        SELECT SUM(amount) as total
        FROM payments
        WHERE status = 'success'
      `,

            // Active courses
            activeCourses: `
        SELECT COUNT(*) as total
        FROM courses
        WHERE status = 'active'
      `,

            // Upcoming events
            upcomingEvents: `
        SELECT COUNT(*) as total
        FROM events
        WHERE event_date >= datetime('now') AND status = 'upcoming'
      `,

            // Coworking occupancy for today
            coworkingOccupancy: `
        SELECT 
          COUNT(*) as booked,
          20 as total_desks
        FROM desk_bookings
        WHERE booking_date = date('now') AND status = 'confirmed'
      `
        };

        const results = {};
        const queryPromises = [];

        for (const [key, sql] of Object.entries(queries)) {
            queryPromises.push(
                new Promise((res, rej) => {
                    db.get(sql, [], (err, row) => {
                        if (err) rej(err);
                        else {
                            results[key] = row;
                            res();
                        }
                    });
                })
            );
        }

        Promise.all(queryPromises)
            .then(() => resolve(results))
            .catch(reject);
    });
}

/**
 * Get revenue analytics by period
 */
async function getRevenueAnalytics(period = '30d') {
    return new Promise((resolve, reject) => {
        let dateFilter = '';

        switch (period) {
            case '7d':
                dateFilter = "datetime('now', '-7 days')";
                break;
            case '30d':
                dateFilter = "datetime('now', '-30 days')";
                break;
            case '90d':
                dateFilter = "datetime('now', '-90 days')";
                break;
            case '1y':
                dateFilter = "datetime('now', '-1 year')";
                break;
            default:
                dateFilter = "datetime('now', '-30 days')";
        }

        const queries = {
            bySource: `
        SELECT 
          COALESCE(json_extract(metadata, '$.type'), 'other') as source,
          SUM(amount) as revenue,
          COUNT(*) as count
        FROM payments
        WHERE status = 'success' AND paid_at >= ${dateFilter}
        GROUP BY source
      `,

            timeline: `
        SELECT 
          date(paid_at) as date,
          SUM(amount) as revenue,
          COUNT(*) as transactions
        FROM payments
        WHERE status = 'success' AND paid_at >= ${dateFilter}
        GROUP BY date(paid_at)
        ORDER BY date
      `,

            summary: `
        SELECT 
          SUM(amount) as totalRevenue,
          COUNT(*) as totalTransactions,
          AVG(amount) as avgTransaction,
          COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*) as successRate
        FROM payments
        WHERE paid_at >= ${dateFilter}
      `
        };

        const results = {};
        const queryPromises = [];

        for (const [key, sql] of Object.entries(queries)) {
            queryPromises.push(
                new Promise((res, rej) => {
                    if (key === 'summary') {
                        db.get(sql, [], (err, row) => {
                            if (err) rej(err);
                            else {
                                results[key] = row;
                                res();
                            }
                        });
                    } else {
                        db.all(sql, [], (err, rows) => {
                            if (err) rej(err);
                            else {
                                results[key] = rows || [];
                                res();
                            }
                        });
                    }
                })
            );
        }

        Promise.all(queryPromises)
            .then(() => resolve(results))
            .catch(reject);
    });
}

/**
 * Get conversion funnel metrics
 */
async function getConversionFunnel() {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        (SELECT COUNT(*) FROM messages) as inquiries,
        (SELECT COUNT(*) FROM course_registrations) as registrations,
        (SELECT COUNT(*) FROM member_enrollments) as enrollments,
        (SELECT COUNT(*) FROM payments WHERE status = 'success') as payments
    `;

        db.get(sql, [], (err, row) => {
            if (err) return reject(err);

            const funnel = {
                stages: [
                    { name: 'Inquiries', count: row.inquiries || 0 },
                    { name: 'Registrations', count: row.registrations || 0 },
                    { name: 'Enrollments', count: row.enrollments || 0 },
                    { name: 'Payments', count: row.payments || 0 }
                ],
                conversionRates: {
                    inquiryToRegistration: row.inquiries ? ((row.registrations / row.inquiries) * 100).toFixed(2) : 0,
                    registrationToEnrollment: row.registrations ? ((row.enrollments / row.registrations) * 100).toFixed(2) : 0,
                    enrollmentToPayment: row.enrollments ? ((row.payments / row.enrollments) * 100).toFixed(2) : 0
                }
            };

            resolve(funnel);
        });
    });
}

/**
 * Get user growth analytics
 */
async function getUserGrowth(period = '30d') {
    return new Promise((resolve, reject) => {
        let dateFilter = '';

        switch (period) {
            case '7d':
                dateFilter = "datetime('now', '-7 days')";
                break;
            case '30d':
                dateFilter = "datetime('now', '-30 days')";
                break;
            case '90d':
                dateFilter = "datetime('now', '-90 days')";
                break;
            case '1y':
                dateFilter = "datetime('now', '-1 year')";
                break;
            default:
                dateFilter = "datetime('now', '-30 days')";
        }

        const queries = {
            timeline: `
        SELECT 
          date(created_at) as date,
          COUNT(*) as newMembers
        FROM members
        WHERE created_at >= ${dateFilter}
        GROUP BY date(created_at)
        ORDER BY date
      `,

            byType: `
        SELECT 
          member_type,
          COUNT(*) as count
        FROM members
        WHERE created_at >= ${dateFilter}
        GROUP BY member_type
      `,

            byGender: `
        SELECT 
          gender,
          COUNT(*) as count
        FROM (
          SELECT gender FROM course_registrations WHERE created_at >= ${dateFilter}
          UNION ALL
          SELECT gender FROM coworking_members WHERE created_at >= ${dateFilter}
        )
        WHERE gender IS NOT NULL AND gender != ''
        GROUP BY gender
      `
        };

        const results = {};
        const queryPromises = [];

        for (const [key, sql] of Object.entries(queries)) {
            queryPromises.push(
                new Promise((res, rej) => {
                    db.all(sql, [], (err, rows) => {
                        if (err) rej(err);
                        else {
                            results[key] = rows || [];
                            res();
                        }
                    });
                })
            );
        }

        Promise.all(queryPromises)
            .then(() => resolve(results))
            .catch(reject);
    });
}

/**
 * Get coworking analytics
 */
async function getCoworkingAnalytics() {
    return new Promise((resolve, reject) => {
        const queries = {
            occupancyRate: `
        SELECT 
          COUNT(*) as bookedDesks,
          20 as totalDesks,
          (COUNT(*) * 100.0 / 20) as occupancyRate
        FROM desk_bookings
        WHERE booking_date = date('now') AND status = 'confirmed'
      `,

            bookingsByType: `
        SELECT 
          desk_type,
          COUNT(*) as count
        FROM desk_bookings
        WHERE booking_date >= date('now', '-30 days')
        GROUP BY desk_type
      `,

            popularTimes: `
        SELECT 
          CAST(strftime('%H', start_time) as INTEGER) as hour,
          COUNT(*) as bookings
        FROM desk_bookings
        WHERE booking_date >= date('now', '-30 days')
        AND start_time IS NOT NULL
        GROUP BY hour
        ORDER BY bookings DESC
        LIMIT 5
      `,

            monthlyRevenue: `
        SELECT SUM(amount_paid) as revenue
        FROM desk_bookings
        WHERE booking_date >= date('now', '-30 days')
        AND status = 'confirmed'
      `
        };

        const results = {};
        const queryPromises = [];

        for (const [key, sql] of Object.entries(queries)) {
            queryPromises.push(
                new Promise((res, rej) => {
                    if (key === 'occupancyRate' || key === 'monthlyRevenue') {
                        db.get(sql, [], (err, row) => {
                            if (err) rej(err);
                            else {
                                results[key] = row;
                                res();
                            }
                        });
                    } else {
                        db.all(sql, [], (err, rows) => {
                            if (err) rej(err);
                            else {
                                results[key] = rows || [];
                                res();
                            }
                        });
                    }
                })
            );
        }

        Promise.all(queryPromises)
            .then(() => resolve(results))
            .catch(reject);
    });
}

/**
 * Get course performance analytics
 */
async function getCoursePerformance() {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        c.id,
        c.title,
        c.track,
        c.price,
        COUNT(DISTINCT e.id) as enrollments,
        SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completions,
        (SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(e.id)) as completionRate,
        SUM(CASE WHEN e.payment_status = 'paid' THEN c.price ELSE 0 END) as revenue
      FROM courses c
      LEFT JOIN member_enrollments e ON c.id = e.course_id
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY enrollments DESC
    `;

        db.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

module.exports = {
    getOverviewAnalytics,
    getRevenueAnalytics,
    getConversionFunnel,
    getUserGrowth,
    getCoworkingAnalytics,
    getCoursePerformance
};
