// Test fixtures for common test data

const testUser = {
    username: 'testadmin',
    password: 'TestPassword123!',
    email: 'testadmin@kdih.org',
    role: 'admin'
};

const testMember = {
    email: 'testmember@example.com',
    password: 'MemberPass123!',
    full_name: 'Test Member',
    phone: '+2348012345678',
    member_type: 'student'
};

const testCourse = {
    title: 'Test Course',
    description: 'A test course for automated testing',
    track: 'software-development',
    duration_weeks: 12,
    price: 50000,
    status: 'active'
};

const testEvent = {
    title: 'Test Event',
    description: 'A test event',
    event_type: 'workshop',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: 'KDIH Office',
    max_attendees: 50,
    price: 5000,
    status: 'upcoming'
};

const testCoworkingMember = {
    full_name: 'Test Coworking Member',
    email: 'coworking@test.com',
    phone: '+2348123456789',
    membership_type: 'monthly',
    gender: 'male',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active'
};

const testDeskBooking = {
    desk_type: 'hot-desk',
    booking_date: new Date().toISOString().split('T')[0],
    status: 'confirmed'
};

module.exports = {
    testUser,
    testMember,
    testCourse,
    testEvent,
    testCoworkingMember,
    testDeskBooking
};
