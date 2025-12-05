#!/usr/bin/env node

/**
 * KDIH Events Population Script
 * 
 * This script populates the KDIH database with sample events and workshops.
 * Run this script to quickly add upcoming events to your calendar.
 * 
 * Usage: node populate-events.js
 */

const http = require('http');

// Helper to get future dates
function getFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

// Sample events data
const events = [
    {
        title: "Web Development Bootcamp Kickoff",
        description: "Join us for the launch of our intensive 16-week Full Stack Web Development Bootcamp. Meet instructors, network with peers, and get an overview of the curriculum.",
        event_type: "Workshop",
        event_date: getFutureDate(7),
        start_time: "09:00",
        end_time: "12:00",
        location: "KDIH Main Hall, Katsina",
        max_attendees: 50,
        registration_fee: 0,
        status: "upcoming"
    },
    {
        title: "AI & Machine Learning Hackathon",
        description: "24-hour hackathon focused on building AI-powered solutions for local challenges. Prizes for top 3 teams. Bring your laptops and creativity!",
        event_type: "Hackathon",
        event_date: getFutureDate(14),
        start_time: "08:00",
        end_time: "08:00",
        location: "KDIH Innovation Lab",
        max_attendees: 100,
        registration_fee: 5000,
        status: "upcoming"
    },
    {
        title: "UI/UX Design Thinking Workshop",
        description: "Learn design thinking methodology, user research, wireframing, and prototyping. Hands-on workshop with real projects.",
        event_type: "Workshop",
        event_date: getFutureDate(21),
        start_time: "10:00",
        end_time: "16:00",
        location: "KDIH Design Studio",
        max_attendees: 30,
        registration_fee: 10000,
        status: "upcoming"
    },
    {
        title: "Startup Pitch Night",
        description: "Watch local startups pitch their ideas to investors and industry experts. Network with entrepreneurs and learn about the startup ecosystem.",
        event_type: "Networking",
        event_date: getFutureDate(28),
        start_time: "18:00",
        end_time: "21:00",
        location: "KDIH Auditorium",
        max_attendees: 150,
        registration_fee: 0,
        status: "upcoming"
    },
    {
        title: "Cybersecurity Awareness Seminar",
        description: "Learn about common cyber threats, security best practices, and how to protect yourself and your business online. Free for all attendees.",
        event_type: "Seminar",
        event_date: getFutureDate(35),
        start_time: "14:00",
        end_time: "17:00",
        location: "KDIH Conference Room",
        max_attendees: 80,
        registration_fee: 0,
        status: "upcoming"
    },
    {
        title: "Women in Tech Meetup",
        description: "Monthly meetup for women in technology. Share experiences, learn from each other, and build a supportive community.",
        event_type: "Networking",
        event_date: getFutureDate(42),
        start_time: "16:00",
        end_time: "19:00",
        location: "KDIH Co-working Space",
        max_attendees: 40,
        registration_fee: 0,
        status: "upcoming"
    },
    {
        title: "Digital Marketing Masterclass",
        description: "Intensive one-day masterclass covering SEO, social media marketing, content strategy, and Google Ads. Certificate provided.",
        event_type: "Workshop",
        event_date: getFutureDate(49),
        start_time: "09:00",
        end_time: "17:00",
        location: "KDIH Training Center",
        max_attendees: 60,
        registration_fee: 15000,
        status: "upcoming"
    }
];

// Login first to get session
function login() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            username: 'superadmin',
            password: 'superadmin123'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            const cookies = res.headers['set-cookie'];

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✓ Logged in as superadmin');
                    resolve(cookies);
                } else {
                    reject(new Error('Login failed: ' + data));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(loginData);
        req.end();
    });
}

// Create an event
function createEvent(event, cookies) {
    return new Promise((resolve, reject) => {
        const eventData = JSON.stringify(event);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/events',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': eventData.length,
                'Cookie': cookies.join('; ')
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log(`✓ Created: ${event.title} (${event.event_date})`);
                    resolve(data);
                } else {
                    console.log(`✗ Failed: ${event.title} - ${data}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`✗ Error creating ${event.title}:`, error.message);
            resolve(null);
        });

        req.write(eventData);
        req.end();
    });
}

// Main execution
async function main() {
    console.log('🎉 KDIH Events Population Script\n');
    console.log('📅 Preparing to add 7 sample events...\n');

    try {
        // Step 1: Login
        console.log('Step 1: Logging in...');
        const cookies = await login();

        // Step 2: Create events
        console.log('\nStep 2: Creating events...\n');

        for (const event of events) {
            await createEvent(event, cookies);
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n✅ Events population complete!');
        console.log('\n📊 Summary:');
        console.log(`   - Total events added: ${events.length}`);
        console.log(`   - Workshops: ${events.filter(e => e.event_type === 'Workshop').length}`);
        console.log(`   - Hackathons: ${events.filter(e => e.event_type === 'Hackathon').length}`);
        console.log(`   - Networking: ${events.filter(e => e.event_type === 'Networking').length}`);
        console.log(`   - Seminars: ${events.filter(e => e.event_type === 'Seminar').length}`);
        console.log(`   - Free events: ${events.filter(e => e.registration_fee === 0).length}`);
        console.log('\n🌐 View events at: http://localhost:3000/events.html');
        console.log('🔧 Manage events at: http://localhost:3000/admin/dashboard.html');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nMake sure:');
        console.error('  1. Server is running (npm start)');
        console.error('  2. Server is accessible at http://localhost:3000');
        console.error('  3. Superadmin credentials are correct');
        process.exit(1);
    }
}

// Run the script
main();
