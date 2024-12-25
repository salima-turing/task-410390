const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.locked = false;
        this.readers = 0;
    }

    async acquireLock() {
        while (this.locked) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Wait before retrying
        }
        this.locked = true;
    }

    releaseLock() {
        this.locked = false;
    }

    async read() {
        await this.acquireLock();
        try {
            this.readers++;
            // Simulate reading
            const data = await fs.readFile(this.filePath, 'utf-8');
            console.log(`Read data: ${data}`);
            return data;
        } finally {
            this.readers--;
            if (this.readers === 0) {
                this.releaseLock();
            }
        }
    }

    async write(data) {
        await this.acquireLock();
        try {
            await fs.writeFile(this.filePath, data);
            console.log(`Wrote data: ${data}`);
        } finally {
            this.releaseLock();
        }
    }
}

// Example usage
(async () => {
    const filePath = path.join(__dirname, 'data.txt');
    const fileManager = new FileManager(filePath);

    // Simulating concurrent reads
    const readPromises = Array.from({ length: 5 }, (_, i) => {
        return fileManager.read().catch(err => console.error(`Read error: ${err}`));
    });

    // Simulating a write operation
    const writePromise = fileManager.write(`New Data at ${new Date().toISOString()}`).catch(err => console.error(`Write error: ${err}`));

    // Wait for all read and write operations to complete
    await Promise.all([...readPromises, writePromise]);
    console.log('All operations completed.');
})();
