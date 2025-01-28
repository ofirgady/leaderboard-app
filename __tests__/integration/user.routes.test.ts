import pool from '../../src/db';
import { app, server } from '../../src/server';
import request from 'supertest';

afterAll(async () => {
  await pool.end(); // Close all PostgreSQL connections
  server.close();
});

describe('User Routes Integration Tests', () => {
  it('should return 200 OK on GET /api/users/getTopUsers/:limit', async () => {
    const limit = 5;
    const response = await request(app).get(`/api/users/getTopUsers/${limit}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(limit);
  });

  it('should create a new user on POST /api/users/addUser', async () => {
    const newUser = {
      username: 'TestUser',
      score: 50,
      img_url: 'https://example.com/image.jpg',
    };

    const response = await request(app).post('/api/users/addUser').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.score).toBe(newUser.score);
  });

  it('should update the user score on PUT /api/users/updateScore/:id', async () => {
    const userId = 1; // Ensure this user exists in your database
    const newScore = { score: 100 };

    const response = await request(app).put(`/api/users/updateScore/${userId}`).send(newScore);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.score).toBe(newScore.score);
  });

  it('should return 404 if the user does not exist on GET /api/users/getUserWithNeighbors/:id', async () => {
    const nonExistentUserId = 0;

    const response = await request(app).get(`/api/users/getUserWithNeighbors/${nonExistentUserId}`);
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });
});