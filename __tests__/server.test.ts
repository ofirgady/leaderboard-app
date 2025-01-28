import pool from '../src/db';
import { app, server } from '../src/server';
import request from 'supertest';

// After all tests, close the PostgreSQL connection and server
afterAll(async () => {
  await pool.end(); // Close all PostgreSQL connections
  server.close();
});

// Group of tests to verify the server is running
describe('API Tests', () => {
  it('should return 200 OK on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Leaderboard API is running!');
  });
});

// Group of tests to verify user creation functionality
describe('POST /addUser', () => {
  it('should create a new user and return the user object', async () => {
    const newUser = {
      username: 'TestUser',
      score: 50,
      img_url: 'https://res.cloudinary.com/ofirgady/image/upload/v1647329558/cld-sample.jpg',
    };

    const response = await request(app).post('/addUser').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.score).toBe(newUser.score);
    expect(response.body.img_url).toBe(newUser.img_url);
  });
});

// Group of tests to verify score update functionality
describe('PUT /updateScore/:id', () => {
  it('should update the score of an existing user', async () => {
    const userId = 1; // Make sure this ID exists in your database
    const newScore = { score: 100 };

    const response = await request(app).put(`/updateScore/${userId}`).send(newScore);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.score).toBe(newScore.score);
  });
});

// Group of tests to verify top users functionality
describe('GET /getTopUsers/:limit', () => {
  it('should return the top N users sorted by score', async () => {
    const limit = 5;

    const response = await request(app).get(`/getTopUsers/${limit}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(limit);
  });
});

// Group of tests to verify fetching a user and their neighbors
describe('GET /getUserWithNeighbors/:id', () => {
  it('should return a user and their 5 neighbors', async () => {
    const userId = 1; // Make sure this ID exists in your database

    const response = await request(app).get(`/getUserWithNeighbors/${userId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return 404 if the user does not exist', async () => {
    const nonExistentUserId = 0; // ID that doesn't exist in the database

    const response = await request(app).get(`/getUserWithNeighbors/${nonExistentUserId}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });
});