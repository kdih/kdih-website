const { emailTemplates } = require('./utils/email');

// Mock process.env
process.env.APP_URL = 'http://localhost:3000';

function testWelcomeEmail(interest) {
    console.log(`\nTesting Welcome Email for Interest: ${interest}`);
    const template = emailTemplates.welcome('Test User', interest);
    console.log('Subject:', template.subject);
    if (template.html.includes('Browse our Courses') && interest === 'Training') {
        console.log('✅ Correctly includes link to Courses');
    } else if (template.html.includes('Book a Desk') && interest === 'Coworking') {
        console.log('✅ Correctly includes link to Coworking');
    } else if (template.html.includes('Visit Website') && !['Training', 'Coworking'].includes(interest)) {
        console.log('✅ Correctly includes generic link');
    } else {
        console.log('❌ Failed to include correct link');
        console.log(template.html);
    }
}

testWelcomeEmail('Training');
testWelcomeEmail('Coworking');
testWelcomeEmail('Incubation');
