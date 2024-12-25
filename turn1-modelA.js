const fs = require('fs').promises;
const { performance } = require('perf_hooks');

async function readData(filePath) {
    const start = performance.now();
    const data = await fs.readFile(filePath, 'utf-8');
    const end = performance.now();
    console.log(`Read file: ${filePath}, Time taken: ${end - start} ms`);
    return data;
}

async function processSequentialData(filePath, processFunction) {
    const data = await readData(filePath);
    const lines = data.split('\n');

    for (let line of lines) {
        const processStart = performance.now();
        await processFunction(line);
        const processEnd = performance.now();
        console.log(`Processed line in: ${processEnd - processStart} ms`);
    }
}

async function exampleProcessingFunction(line) {
    // Simulate some asynchronous processing
    return new Promise(resolve => setTimeout(resolve, Math.random() * 100));
}

// Usage
const filePath = 'data.txt'; // Path to your sequential data file
processSequentialData(filePath, exampleProcessingFunction)
    .then(() => console.log('Processing complete'))
    .catch(err => console.error('Error processing data:', err));
