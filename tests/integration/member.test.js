const request = require('supertest');
const app = require('../../server');

describe('Member Portal API', () => {
    let memberSession;

    describe('POST /api/member/register', () => {
        it('should register a new member with valid data', async () => {
            const memberData = {
                email: `testmember${Date.now()}@example.com`,
                password: 'SecurePass123!',
                full_name: 'Test Member',
                phone: '+2348012345678',
                member_type: 'student'
            };

            const response = await request(app)
                .post('/api/member/register')
                .send(memberData);

            expect([200, 201]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail registration with duplicate email', async () => {
            const memberData = {
                email: 'duplicate@example.com',
                password: 'SecurePass123!',
                full_name: 'Test Member',
                phone: '+2348012345678'
            };

            // Register once
            await request(app)
                .post('/api/member/register')
                .send(memberData);

            // Try to register again with same email
            const response = await request(app)
                .post('/api/member/register')
                .send(memberData);

            expect([400, 409]).toContain(response.status);
        });

        it('should fail registration with weak password', async () => {
            const memberData = {
                email: 'weakpass@example.com',
                password: '123', // Weak password
                full_name: 'Test Member',
                phone: '+2348012345678'
            };

            const response = await request(app)
                .post('/api/member/register')
                .send(memberData);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/member/login', () => {
        it('should fail login without credentials', async () => {
            const response = await request(app)
                .post('/api/member/login')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/member/check-session', () => {
        it('should return session status', async () => {
            const response = await request(app)
                .get('/api/member/check-session');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('authenticated');
        });
    });
});
