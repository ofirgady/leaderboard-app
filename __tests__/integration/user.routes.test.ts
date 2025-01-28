import request from 'supertest';
import { app, server } from '../../src/server';
import pool from '../../src/db';

afterAll(async () => {
  await pool.end();
  server.close();
});

describe('User Routes Integration Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should add a new user successfully', async () => {
    const newUser = {
      username: 'TestUser',
      score: 100,
      img_url: 'https://example.com/test-image.jpg',
    };

    const response = await request(app).post('/api/users/addUser').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.score).toBe(newUser.score);
    expect(response.body.img_url).toBe(newUser.img_url);
  });

  it('should update a user\'s score successfully', async () => {
    const userId = 1;
    const updatedScore = { score: 200 };

    const response = await request(app).put(`/api/users/updateScore/${userId}`).send(updatedScore);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.score).toBe(updatedScore.score);
  });

  it('should fetch top users successfully', async () => {
    const limit = 5;

    const response = await request(app).get(`/api/users/getTopUsers/${limit}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeLessThanOrEqual(limit);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('score');
  });

  it('should fetch user and neighbors successfully', async () => {
    const userId = 1;

    const response = await request(app).get(`/api/users/getUserWithNeighbors/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.some((user: { id: number }) => user.id === userId)).toBe(true);
  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 99999;

    const response = await request(app).get(`/api/users/getUserWithNeighbors/${nonExistentUserId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 400 if invalid user ID is provided for neighbors', async () => {
    const invalidUserId = 'abc';

    const response = await request(app).get(`/api/users/getUserWithNeighbors/${invalidUserId}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  it('should return 400 if invalid score is provided during update', async () => {
    const userId = 1;
    const invalidScore = { score: -10 };

    const response = await request(app).put(`/api/users/updateScore/${userId}`).send(invalidScore);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });
});