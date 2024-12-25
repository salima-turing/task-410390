const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Function to read a file sequentially using readline
async function readFileSequentially(filePath) {
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false
    });

    const lines = [];

    for await (const line of rl) {
        lines.push(line);
    }

    rl.close();
    return lines;
}

// Function to benchmark the read operation
async function benchmarkReadOperation(filePath) {
    const startTime = Date.now();
    const lines = await readFileSequentially(filePath);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`Execution time: ${executionTime} ms`);
    console.log(`Number of lines read: ${lines.length}`);
}

// Example usage
const filePath = path.join(__dirname, 'data.txt');
benchmarkReadOperation(filePath);
