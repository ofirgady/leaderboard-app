import fs from 'fs';
import path from 'path';

// Define the logger service
export const loggerService = {
  debug(...args: unknown[]): void {
    doLog('DEBUG', ...args);
  },
  info(...args: unknown[]): void {
    doLog('INFO', ...args);
  },
  warn(...args: unknown[]): void {
    doLog('WARN', ...args);
  },
  error(...args: unknown[]): void {
    doLog('ERROR', ...args);
  },
};

// Directory for log files (absolute path)
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`Logs directory created at ${logsDir}`);
  } catch (err) {
    console.error('FATAL: Cannot create logs directory', err);
  }
}

// Function to get the current time in ISO format
function getTime(): string {
  return new Date().toISOString(); // ISO format for better compatibility
}

// Check if an argument is an Error object
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

// Core logging function
function doLog(level: string, ...args: unknown[]): void {
  // Map arguments to strings or JSON
  const formattedArgs = args.map(arg =>
    typeof arg === 'string' || isError(arg) ? arg : JSON.stringify(arg)
  );

  // Format the log line
  const logLine = `${getTime()} - ${level} - ${formattedArgs.join(' | ')}\n`;

  // Print to console
  if (level === 'ERROR') {
    console.error(logLine);
  } else {
    console.log(logLine);
  }

  // Append to log file
  const logFilePath = path.join(logsDir, 'backend.log');
  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) {
      console.error('FATAL: cannot write to log file', err);
    }
  });
}