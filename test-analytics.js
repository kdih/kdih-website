// Quick test of analytics endpoints
const analytics = require('./utils/analytics');

async function testAnalytics() {
    console.log('Testing Analytics Functions...\n');

    try {
        // Test Overview
        console.log('1. Overview Analytics:');
        const overview = await analytics.getOverviewAnalytics();
        console.log(JSON.stringify(overview, null, 2));
        console.log('✓ Overview analytics working\n');

        // Test Revenue
        console.log('2. Revenue Analytics (30d):');
        const revenue = await analytics.getRevenueAnalytics('30d');
        console.log(JSON.stringify(revenue, null, 2));
        console.log('✓ Revenue analytics working\n');

        // Test Conversion Funnel
        console.log('3. Conversion Funnel:');
        const funnel = await analytics.getConversionFunnel();
        console.log(JSON.stringify(funnel, null, 2));
        console.log('✓ Conversion funnel working\n');

        // Test User Growth
        console.log('4. User Growth (30d):');
        const growth = await analytics.getUserGrowth('30d');
        console.log(JSON.stringify(growth, null, 2));
        console.log('✓ User growth analytics working\n');

        // Test Coworking
        console.log('5. Coworking Analytics:');
        const coworking = await analytics.getCoworkingAnalytics();
        console.log(JSON.stringify(coworking, null, 2));
        console.log('✓ Coworking analytics working\n');

        // Test Course Performance
        console.log('6. Course Performance:');
        const courses = await analytics.getCoursePerformance();
        console.log(JSON.stringify(courses, null, 2));
        console.log('✓ Course performance analytics working\n');

        console.log('✅ All analytics functions tested successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }

    process.exit(0);
}

testAnalytics();
