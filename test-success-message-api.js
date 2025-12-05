const http = require('http');

const baseUrl = 'http://localhost:3000';

// Helper function to make API requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testSuccessMessageApi() {
    console.log('\n🧪 Testing Success Message API Endpoints\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Contact Form Submission (uses 'success' response)
        console.log('\n📝 Test 1: Contact Form Submission');
        console.log('-'.repeat(60));
        const contactResponse = await makeRequest('POST', '/api/contact', {
            name: 'Test User',
            email: 'testuser@example.com',
            message: 'This is a test message from API testing'
        });
        console.log('Status:', contactResponse.status);
        console.log('Response:', JSON.stringify(contactResponse.body, null, 2));

        if (contactResponse.body.message === 'success') {
            console.log('✅ Contact form returns success message correctly');
        } else {
            console.log('❌ Contact form did not return success message');
        }

        // Test 2: Quick Inquiry (uses 'success' response)
        console.log('\n📞 Test 2: Quick Inquiry Submission');
        console.log('-'.repeat(60));
        const inquiryResponse = await makeRequest('POST', '/api/inquiry', {
            full_name: 'Test Inquiry User',
            email: 'inquiry@example.com',
            phone: '+234-800-123-4567',
            interest: 'LMS Course'
        });
        console.log('Status:', inquiryResponse.status);
        console.log('Response:', JSON.stringify(inquiryResponse.body, null, 2));

        if (inquiryResponse.body.message === 'success') {
            console.log('✅ Inquiry form returns success message correctly');
        } else {
            console.log('❌ Inquiry form did not return success message');
        }

        // Test 3: Course Enrollment (uses 'success' response)
        console.log('\n🎓 Test 3: Course Enrollment');
        console.log('-'.repeat(60));
        const enrollResponse = await makeRequest('POST', '/api/enroll', {
            course_title: 'Full Stack Web Development',
            schedule: 'Next Available',
            title: 'Mr',
            surname: 'Test',
            firstname: 'Enrollment',
            othernames: '',
            gender: 'Male',
            nationality: 'Nigerian',
            phone: '+234-800-555-1234',
            email_personal: 'enrollment@example.com',
            email_official: 'official@example.com',
            organization: 'Test Organization',
            job_title: 'Developer',
            department: 'IT',
            country: 'Nigeria',
            state: 'Lagos',
            city: 'Lagos',
            address: '123 Test Street',
            duties: 'Testing',
            expectations: 'Learn Full Stack Development',
            requirements: 'None',
            referral: 'Website'
        });
        console.log('Status:', enrollResponse.status);
        console.log('Response:', JSON.stringify(enrollResponse.body, null, 2));

        if (enrollResponse.body.message === 'success') {
            console.log('✅ Course enrollment returns success message correctly');
        } else {
            console.log('❌ Course enrollment did not return success message');
        }

        // Test 4: Startup Application (uses 'success' response)
        console.log('\n🚀 Test 4: Startup Application');
        console.log('-'.repeat(60));
        const startupResponse = await makeRequest('POST', '/api/startups/apply', {
            startup_name: 'Test Startup Inc',
            founder_name: 'Jane Doe',
            founder_email: 'jane@teststartup.com',
            founder_phone: '+234-800-999-8888',
            business_description: 'A revolutionary tech platform for testing',
            pitch_deck_url: 'https://example.com/pitch.pdf',
            team_size: 5,
            industry: 'Technology',
            stage: 'Pre-seed',
            funding_sought: 50000
        });
        console.log('Status:', startupResponse.status);
        console.log('Response:', JSON.stringify(startupResponse.body, null, 2));

        if (startupResponse.body.message === 'success') {
            console.log('✅ Startup application returns success message correctly');
        } else {
            console.log('❌ Startup application did not return success message');
        }

        // Test 5: Meeting Room Booking (uses 'success' response)
        console.log('\n🏢 Test 5: Meeting Room Booking');
        console.log('-'.repeat(60));
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const bookingDate = tomorrow.toISOString().split('T')[0];

        const roomResponse = await makeRequest('POST', '/api/coworking/book-room', {
            guest_name: 'Conference Test',
            guest_email: 'conference@example.com',
            guest_phone: '+234-800-777-6666',
            guest_organization: 'Test Corp',
            room_name: 'Conference Room A',
            booking_date: bookingDate,
            start_time: '10:00',
            end_time: '12:00',
            purpose: 'Team Meeting'
        });
        console.log('Status:', roomResponse.status);
        console.log('Response:', JSON.stringify(roomResponse.body, null, 2));

        if (roomResponse.body.message === 'success') {
            console.log('✅ Room booking returns success message correctly');
        } else {
            console.log('❌ Room booking did not return success message');
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ All Success Message API Tests Completed!\n');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        process.exit(1);
    }
}

// Run the tests
testSuccessMessageApi();
