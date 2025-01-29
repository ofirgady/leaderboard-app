import { Request, Response } from 'express';
import { userRepository } from '../../src/repositories/user.repository';
import {
  addUser,
  updateScore,
  getTopUsers,
  getUserWithNeighbors,
  checkServerStatus,
} from '../../src/controllers/user.controller';
import { loggerService } from '../../src/services/logger.service';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/logger.service');

describe('User Controller Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  it('should check server status successfully', async () => {
    await checkServerStatus(req as Request, res as Response);

    expect(loggerService.info).toHaveBeenCalledWith('Checking server status');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Leaderboard API is running!');
  });

  it('should add a new user', async () => {
    req.body = { username: 'TestUser', score: 100, img_url: 'https://example.com/image.jpg' };
    (userRepository.addUser as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'TestUser',
      score: 100,
      img_url: 'https://example.com/image.jpg',
    });

    await addUser(req as Request, res as Response);

    expect(userRepository.addUser).toHaveBeenCalledWith('TestUser', 100, 'https://example.com/image.jpg');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      username: 'TestUser',
      score: 100,
      img_url: 'https://example.com/image.jpg',
    });
  });

  it('should update a user\'s score', async () => {
    req.params = { id: '1' };
    req.body = { score: 200 };
    (userRepository.updateScore as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'TestUser',
      score: 200,
      img_url: 'https://example.com/image.jpg',
    });

    await updateScore(req as Request, res as Response);

    expect(userRepository.updateScore).toHaveBeenCalledWith(1, 200);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      username: 'TestUser',
      score: 200,
      img_url: 'https://example.com/image.jpg',
    });
  });
});