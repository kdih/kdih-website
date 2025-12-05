const BASE_URL = 'http://localhost:3000/api';
let cookie = '';

async function testAdminDashboard() {
    try {
        console.log('1. Logging in as admin...');
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.statusText}`);
        }

        // Get cookie from response headers
        const setCookie = loginResponse.headers.get('set-cookie');
        if (setCookie) {
            cookie = setCookie.split(';')[0];
            console.log('✅ Admin logged in successfully');
        } else {
            throw new Error('No cookie received from login');
        }

        console.log('\n2. Fetching detailed members list...');
        const membersResponse = await fetch(`${BASE_URL}/admin/members/detailed`, {
            headers: { 'Cookie': cookie }
        });

        if (!membersResponse.ok) {
            throw new Error(`Failed to fetch members: ${membersResponse.statusText}`);
        }

        const membersData = await membersResponse.json();
        const members = membersData.data;
        console.log(`✅ Fetched ${members.length} members`);

        if (members.length > 0) {
            const member = members[0];
            console.log(`   First member: ${member.full_name} (${member.email})`);
            console.log(`   - Course Registrations: ${member.course_registrations_count}`);
            console.log(`   - LMS Enrollments: ${member.lms_enrollments_count}`);
            console.log(`   - Active Memberships: ${member.active_memberships_count}`);

            console.log(`\n3. Fetching detailed dashboard for member ID ${member.id}...`);
            const dashboardResponse = await fetch(`${BASE_URL}/admin/members/${member.id}/dashboard`, {
                headers: { 'Cookie': cookie }
            });

            if (!dashboardResponse.ok) {
                throw new Error(`Failed to fetch dashboard: ${dashboardResponse.statusText}`);
            }

            const dashboardData = await dashboardResponse.json();
            const dashboard = dashboardData.data;

            console.log('✅ Dashboard data retrieved:');
            console.log(`   - Member: ${dashboard.member.full_name}`);
            console.log(`   - Course Registrations: ${dashboard.course_registrations.length}`);
            if (dashboard.course_registrations.length > 0) {
                const reg = dashboard.course_registrations[0];
                console.log(`     * ${reg.course_title} (Fee: ${reg.fee_display}, Status: ${reg.payment_status})`);
                console.log(`     * Completion Date: ${reg.completion_date}`);
            }

            console.log(`   - LMS Enrollments: ${dashboard.lms_enrollments.length}`);
            console.log(`   - Coworking Memberships: ${dashboard.coworking_memberships.length}`);
            if (dashboard.coworking_memberships.length > 0) {
                const mem = dashboard.coworking_memberships[0];
                console.log(`     * ${mem.membership_plan} (Expires: ${mem.days_remaining} days)`);
            }

            console.log(`   - Payments: ${dashboard.payments.length}`);
        } else {
            console.log('⚠️ No members found to test detailed dashboard view');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAdminDashboard();
