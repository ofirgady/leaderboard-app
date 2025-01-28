import fs from 'fs';
import path from 'path';

// Define the logger service
export const loggerService = {
  debug(...args: unknown[]) {
    doLog('DEBUG', ...args);
  },
  info(...args: unknown[]) {
    doLog('INFO', ...args);
  },
  warn(...args: unknown[]) {
    doLog('WARN', ...args);
  },
  error(...args: unknown[]) {
    doLog('ERROR', ...args);
  }
};

// Directory for log files (use absolute path)
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true }); // Ensure parent directories are created
}

// Function to get current time in the desired format
function getTime(): string {
  const now = new Date();
  return now.toLocaleString('he');
}

// Check if an argument is an Error object
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

// Core logging function
function doLog(level: string, ...args: unknown[]): void {
  // Map arguments to strings or JSON
  const strs = args.map(arg => 
    typeof arg === 'string' || isError(arg) ? arg : JSON.stringify(arg)
  );

  // Format the log line
  let line = strs.join(' | ');
  line = `${getTime()} - ${level} - ${line}\n`;

  // Print to console
  console.log(line);

  // Append to log file
  const logFilePath = path.join(logsDir, 'backend.log');
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error('FATAL: cannot write to log file', err);
  });
}