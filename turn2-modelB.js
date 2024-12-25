const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

const logFilePath = path.join(__dirname, 'log.txt');
const lockFilePath = path.join(__dirname, 'log.lock');

// Helper function to acquire a lock
async function acquireLock() {
    try {
        await fs.writeFile(lockFilePath, 'locked');
        console.log('Lock acquired.');
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log('Lock already held. Waiting...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return await acquireLock(); // Recursively try to acquire the lock
        } else {
            throw err;
        }
    }
}

// Helper function to release a lock
async function releaseLock() {
    try {
        await fs.unlink(lockFilePath);
        console.log('Lock released.');
    } catch (err) {
        console.error('Error releasing lock:', err);
    }
}

// Function to write a log entry with concurrency control
async function writeLogEntry(entry) {
    try {
        await acquireLock();

        const start = performance.now();

        let logData = await fs.readFile(logFilePath, 'utf-8');
        logData += `${entry}\n`;
        await fs.writeFile(logFilePath, logData);

        const end = performance.now();
        console.log(`Wrote log entry: ${entry}, Time taken: ${end - start} ms`);
    } catch (err) {
        console.error('Error writing log entry:', err);
    } finally {
        releaseLock();
    }
}

// Function to read the log file with concurrency control
async function readLog() {
    try {
        await acquireLock();

        const start = performance.now();
        const logData = await fs.readFile(logFilePath, 'utf-8');
        const end = performance.now();
        console.log('Read log data:', logData);
        console.log(`Read log file in: ${end - start} ms`);
    } catch (err) {
        console.error('Error reading log file:', err);
    } finally {
        releaseLock();
    }
}

// Example usage
async function main() {
    try {
        // Write some log entries concurrently
        const writeTasks = [
            writeLogEntry('Process A started'),
            writeLogEntry('Process B started'),
            writeLogEntry('Process A processing data'),
        ];

        await Promise.all(writeTasks);

        // Read the log file
        await readLog();
    } catch (err) {
        console.error('Error in main function:', err);
    }
}

main();
