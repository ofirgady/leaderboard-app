import { loggerService } from '../../src/services/logger.service';
import fs from 'fs';
import path from 'path';

// Mock the 'fs' module
jest.mock('fs', () => ({
  appendFile: jest.fn((_, __, cb: (err: null | Error) => void) => cb(null)),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

describe('Logger Service Tests', () => {
  it('should log info messages', () => {
    loggerService.info('Test message');
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it('should handle errors during logging', () => {
    (fs.appendFile as unknown as jest.Mock).mockImplementationOnce((_, __, cb) => cb(new Error('Write error')));
    loggerService.error('Error message');
    expect(fs.appendFile).toHaveBeenCalled();
  });
});