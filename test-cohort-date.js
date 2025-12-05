const { emailTemplates } = require('./utils/email');

// Mock process.env
process.env.APP_URL = 'http://localhost:3000';

function testCohortDateLogic() {
    console.log('\nTesting Cohort Date Logic...');

    // Simulate API logic
    let schedule = 'Next Available';
    if (schedule === 'Next Available') {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        schedule = nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    console.log(`Calculated Schedule: ${schedule}`);

    // Test Email Template
    console.log('\nTesting Email Template...');
    const template = emailTemplates.courseEnrollment('Test User', 'Web Development', schedule);

    if (template.html.includes(`Start Date:</strong> ${schedule}`)) {
        console.log('✅ Email template includes correct start date');
    } else {
        console.log('❌ Email template missing start date');
        console.log(template.html);
    }
}

testCohortDateLogic();
