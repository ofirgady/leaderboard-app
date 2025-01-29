import request from 'supertest';
import { app, server } from '../../src/server';
import { pool, closeDatabaseConnections } from '../../src/db';

jest.setTimeout(40000); // Increase Jest timeout

afterAll(async () => {
  await closeDatabaseConnections();
  (await server).close();
});

describe('User Routes Integration Tests', () => {
  it('should check server status successfully', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Leaderboard API is running!');
  });

  it('should add a new user successfully', async () => {
    const newUser = {
      username: 'TestUser',
      score: 100,
      img_url: 'https://example.com/test-image.jpg',
    };

    const response = await request(app).post('/api/user/addUser').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should fetch top users successfully', async () => {
    await pool.query('REFRESH MATERIALIZED VIEW leaderboard_ranking');

    const response = await request(app).get(`/api/user/getTopUsers/5`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeLessThanOrEqual(5);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('rank'); // Fix for missing rank
  });
});