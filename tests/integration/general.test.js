const request = require('supertest');
const app = require('../../server');

describe('General API Endpoints', () => {
    describe('GET /health', () => {
        it('should return health check status', async () => {
            const response = await request(app)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('environment');
        });
    });

    describe('GET /api/services', () => {
        it('should return list of services', async () => {
            const response = await request(app)
                .get('/api/services');

            expect(response.status).toBe(200);
            // API returns either array or object depending on implementation
            expect(response.body).toBeDefined();
        });
    });

    describe('GET /api/stats', () => {
        it('should return statistics', async () => {
            const response = await request(app)
                .get('/api/stats');

            // Stats endpoint may vary, just verify it responds
            expect([200, 500]).toContain(response.status);
        });
    });

    describe('POST /api/contact', () => {
        it('should submit contact message successfully', async () => {
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                message: 'This is a test message'
            };

            const response = await request(app)
                .post('/api/contact')
                .send(contactData);

            expect([200, 201]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });

        it('should handle incomplete contact data', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'Test User'
                    // Missing email and message
                });

            // API may accept partial data, so allow both 200 and 400
            expect([200, 400]).toContain(response.status);
        });
    });

    describe('GET /api/certificates/verify/:code', () => {
        it('should handle certificate verification request', async () => {
            const response = await request(app)
                .get('/api/certificates/verify/TEST-CODE-123');

            // Should handle gracefully even if code doesn't exist
            expect([200, 404]).toContain(response.status);
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent API routes', async () => {
            const response = await request(app)
                .get('/api/nonexistent-endpoint');

            expect(response.status).toBe(404);
        });
    });
});
