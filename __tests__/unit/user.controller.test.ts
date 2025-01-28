import { addUser, updateScore, getTopUsers, getUserWithNeighbors } from '../../src/controllers/user.controller';
import pool from '../../src/db';
import { loggerService } from '../../src/services/logger.service';

// Mock the database pool
jest.mock('../../src/db', () => ({
  query: jest.fn(),
}));

// Mock the logger service
jest.mock('../../src/services/logger.service', () => ({
  loggerService: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock response object
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  res.send = jest.fn();
  return res;
};

// Tests
describe('User Controller Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a user successfully', async () => {
    const req = {
      body: {
        username: 'TestUser',
        score: 50,
        img_url: 'https://example.com/image.jpg',
      },
    };
    const res = mockResponse();

    // Mock database response
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 1, ...req.body }],
    });

    await addUser(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO users (username, score, img_url) VALUES ($1, $2, $3) RETURNING *`,
      [req.body.username, req.body.score, req.body.img_url]
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
  });

  it('should handle database errors when adding a user', async () => {
    const req = {
      body: {
        username: 'TestUser',
        score: 50,
        img_url: 'https://example.com/image.jpg',
      },
    };
    const res = mockResponse();

    // Mock database error
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await addUser(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error adding user');
    expect(loggerService.error).toHaveBeenCalledWith('Error adding user', new Error('Database error'));
  });

  it('should update a user score successfully', async () => {
    const req = {
      params: { id: '1' },
      body: { score: 100 },
    };
    const res = mockResponse();

    // Mock database response
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 1, username: 'TestUser', score: 100, img_url: 'https://example.com/image.jpg' }],
    });

    await updateScore(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      `UPDATE users SET score = $1 WHERE id = $2 RETURNING *`,
      [req.body.score, req.params.id]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      username: 'TestUser',
      score: 100,
      img_url: 'https://example.com/image.jpg',
    });
  });

  it('should handle user not found when updating score', async () => {
    const req = {
      params: { id: '0' },
      body: { score: 100 },
    };
    const res = mockResponse();

    // Mock empty database response
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await updateScore(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('User not found');
    expect(loggerService.warn).toHaveBeenCalledWith('User not found for update', { id: req.params.id });
  });

  it('should fetch top users successfully', async () => {
    const req = { params: { limit: '5' } };
    const res = mockResponse();

    // Mock database response
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, username: 'TestUser1', score: 100, img_url: 'https://example.com/image1.jpg' },
        { id: 2, username: 'TestUser2', score: 90, img_url: 'https://example.com/image2.jpg' },
      ],
    });

    await getTopUsers(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(`SELECT * FROM users ORDER BY score DESC LIMIT $1`, [5]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, username: 'TestUser1', score: 100, img_url: 'https://example.com/image1.jpg' },
      { id: 2, username: 'TestUser2', score: 90, img_url: 'https://example.com/image2.jpg' },
    ]);
  });

  it('should fetch a user and their neighbors successfully', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();

    // Mock database response
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, username: 'TestUser', score: 100, img_url: 'https://example.com/image.jpg', rank_row: 1 },
        { id: 2, username: 'Neighbor1', score: 95, img_url: 'https://example.com/image2.jpg', rank_row: 2 },
      ],
    });

    await getUserWithNeighbors(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, username: 'TestUser', score: 100, img_url: 'https://example.com/image.jpg', rank_row: 1 },
      { id: 2, username: 'Neighbor1', score: 95, img_url: 'https://example.com/image2.jpg', rank_row: 2 },
    ]);
  });

  it('should return 404 if the user with neighbors is not found', async () => {
    const req = { params: { id: '0' } };
    const res = mockResponse();

    // Mock empty database response
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await getUserWithNeighbors(req as any, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('User not found');
    expect(loggerService.warn).toHaveBeenCalledWith('User not found for neighbors', { id: req.params.id });
  });
});