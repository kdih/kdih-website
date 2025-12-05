#!/usr/bin/env node

/**
 * KDIH Course Population Script
 * 
 * This script populates the KDIH database with sample courses.
 * Run this script to quickly add professional courses to your catalog.
 * 
 * Usage: node populate-courses.js
 */

const http = require('http');

// Sample courses data
const courses = [
    {
        title: "Full Stack Web Development",
        description: "Master both frontend and backend development with HTML, CSS, JavaScript, React, Node.js, and databases. Build complete web applications from scratch.",
        track: "Technical Skills",
        duration_weeks: 16,
        price: 100000,
        status: "active",
        thumbnail_url: "/images/courses/web-dev.jpg"
    },
    {
        title: "Data Science & Analytics",
        description: "Learn Python, data analysis, machine learning, and visualization. Work with real datasets and build predictive models.",
        track: "Technical Skills",
        duration_weeks: 12,
        price: 80000,
        status: "active",
        thumbnail_url: "/images/courses/data-science.jpg"
    },
    {
        title: "UI/UX Design Masterclass",
        description: "Master user interface and user experience design. Learn Figma, design thinking, prototyping, and user research methodologies.",
        track: "Design",
        duration_weeks: 8,
        price: 60000,
        status: "active",
        thumbnail_url: "/images/courses/uiux.jpg"
    },
    {
        title: "Cybersecurity Fundamentals",
        description: "Learn network security, ethical hacking, penetration testing, and security best practices. Prepare for industry certifications.",
        track: "Technical Skills",
        duration_weeks: 10,
        price: 70000,
        status: "active",
        thumbnail_url: "/images/courses/cybersecurity.jpg"
    },
    {
        title: "Digital Marketing & Social Media",
        description: "Master SEO, social media marketing, content strategy, Google Ads, and analytics. Build effective digital marketing campaigns.",
        track: "Business Skills",
        duration_weeks: 6,
        price: 50000,
        status: "active",
        thumbnail_url: "/images/courses/digital-marketing.jpg"
    },
    {
        title: "Mobile App Development (Flutter)",
        description: "Build cross-platform mobile apps for iOS and Android using Flutter and Dart. Deploy apps to app stores.",
        track: "Technical Skills",
        duration_weeks: 14,
        price: 90000,
        status: "active",
        thumbnail_url: "/images/courses/mobile-dev.jpg"
    },
    {
        title: "Graphic Design & Branding",
        description: "Learn Adobe Photoshop, Illustrator, and InDesign. Create logos, brand identities, and marketing materials.",
        track: "Design",
        duration_weeks: 8,
        price: 55000,
        status: "active",
        thumbnail_url: "/images/courses/graphic-design.jpg"
    },
    {
        title: "Business Analytics & Intelligence",
        description: "Master Excel, Power BI, and Tableau. Learn data-driven decision making and business intelligence strategies.",
        track: "Business Skills",
        duration_weeks: 10,
        price: 65000,
        status: "active",
        thumbnail_url: "/images/courses/business-analytics.jpg"
    },
    {
        title: "Cloud Computing (AWS)",
        description: "Learn Amazon Web Services, cloud architecture, deployment, and DevOps practices. Prepare for AWS certifications.",
        track: "Technical Skills",
        duration_weeks: 12,
        price: 85000,
        status: "active",
        thumbnail_url: "/images/courses/cloud-computing.jpg"
    },
    {
        title: "Entrepreneurship & Startup Management",
        description: "Learn business planning, fundraising, product development, and startup growth strategies from experienced entrepreneurs.",
        track: "Business Skills",
        duration_weeks: 8,
        price: 45000,
        status: "active",
        thumbnail_url: "/images/courses/entrepreneurship.jpg"
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

// Create a course
function createCourse(course, cookies) {
    return new Promise((resolve, reject) => {
        const courseData = JSON.stringify(course);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/courses',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': courseData.length,
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
                    console.log(`✓ Created: ${course.title}`);
                    resolve(data);
                } else {
                    console.log(`✗ Failed: ${course.title} - ${data}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`✗ Error creating ${course.title}:`, error.message);
            resolve(null);
        });

        req.write(courseData);
        req.end();
    });
}

// Main execution
async function main() {
    console.log('🚀 KDIH Course Population Script\n');
    console.log('📚 Preparing to add 10 sample courses...\n');

    try {
        // Step 1: Login
        console.log('Step 1: Logging in...');
        const cookies = await login();

        // Step 2: Create courses
        console.log('\nStep 2: Creating courses...\n');

        for (const course of courses) {
            await createCourse(course, cookies);
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n✅ Course population complete!');
        console.log('\n📊 Summary:');
        console.log(`   - Total courses added: ${courses.length}`);
        console.log(`   - Technical Skills: ${courses.filter(c => c.track === 'Technical Skills').length}`);
        console.log(`   - Business Skills: ${courses.filter(c => c.track === 'Business Skills').length}`);
        console.log(`   - Design: ${courses.filter(c => c.track === 'Design').length}`);
        console.log('\n🌐 View courses at: http://localhost:3000/courses.html');
        console.log('🔧 Manage courses at: http://localhost:3000/admin/dashboard.html');

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
