import { loggerService } from '../../src/services/logger.service';
import fs from 'fs';

jest.mock('fs', () => ({
  appendFile: jest.fn((path, data, callback) => callback(null)), // Mock לכתיבה מוצלחת
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

describe('Logger Service Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log error messages', () => {
    loggerService.error('Error message');
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
  });

  it('should log info messages', () => {
    loggerService.info('Info message');
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('INFO'));
  });

  it('should write logs to a file', () => {
    loggerService.info('Writing to file');
    expect(fs.appendFile).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('backend.log'),
      expect.stringContaining('INFO'),
      expect.any(Function)
    );
  });
});