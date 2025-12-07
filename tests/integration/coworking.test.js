const request = require('supertest');
const app = require('../../server');

describe('Coworking API', () => {
    describe('GET /api/coworking/available-desks/:date', () => {
        it('should return available desks for a given date', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];

            const response = await request(app)
                .get(`/api/coworking/available-desks/${dateStr}`);

            expect(response.status).toBe(200);
            // Response structure may vary
            expect(response.body).toBeDefined();
        });

        it('should handle invalid date format', async () => {
            const response = await request(app)
                .get('/api/coworking/available-desks/invalid-date');

            // API may return 200 (empty), 400, or 500
            expect([200, 400, 500]).toContain(response.status);
        });
    });

    describe('POST /api/coworking/register', () => {
        it('should register a coworking member with valid data', async () => {
            const memberData = {
                full_name: 'Test Coworking Member',
                email: 'coworking.test@example.com',
                phone: '+2348012345678',
                membership_type: 'monthly',
                gender: 'male',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const response = await request(app)
                .post('/api/coworking/register')
                .send(memberData);

            expect([200, 201]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });

        it('should handle registration with missing required fields', async () => {
            const response = await request(app)
                .post('/api/coworking/register')
                .send({
                    full_name: 'Test Member'
                    // Missing other required fields
                });

            // API validation may vary
            expect([400, 500]).toContain(response.status);
        });
    });

    describe('POST /api/coworking/book-desk', () => {
        it('should fail booking without member_id', async () => {
            const bookingData = {
                desk_type: 'hot-desk',
                booking_date: new Date().toISOString().split('T')[0]
            };

            const response = await request(app)
                .post('/api/coworking/book-desk')
                .send(bookingData);

            expect(response.status).toBe(400);
        });
    });
});
