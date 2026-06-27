// lib/mathBridge.js — Node.js Bridge to Python mathEngine.py
const { spawn } = require('child_process');
const path = require('path');

const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const ENGINE_PATH = path.join(__dirname, 'mathEngine.py');

/**
 * Execute a math/science calculation via mathEngine.py
 * @param {string} type - Operation type (solve, derivative, stats, etc.)
 * @param {string} input - The expression or query
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result object with status, result, steps
 */
function mathEngine(type, input, options = {}) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            type: type,
            input: input,
            options: options
        });

        const child = spawn(PYTHON_PATH, [ENGINE_PATH], {
            cwd: path.join(__dirname, '..'),
            timeout: 30000
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0 && code !== null) {
                // Fallback to lightweight JS math for simple cases
                try {
                    const fallback = lightweightMath(type, input);
                    resolve(fallback);
                } catch (e) {
                    resolve({
                        status: 'error',
                        result: `Python engine exited with code ${code}. stderr: ${stderr.slice(0, 200)}`,
                        steps: []
                    });
                }
                return;
            }

            try {
                const lines = stdout.trim().split('\n').filter(l => l.trim());
                const result = JSON.parse(lines[lines.length - 1]);
                resolve(result);
            } catch (e) {
                resolve({
                    status: 'error',
                    result: `Failed to parse engine output: ${stdout.slice(0, 200)}`,
                    steps: []
                });
            }
        });

        child.on('error', (err) => {
            // Python not available — use JS fallback
            try {
                const fallback = lightweightMath(type, input);
                resolve(fallback);
            } catch (e) {
                resolve({
                    status: 'error',
                    result: `Engine unavailable: ${err.message}. Ensure python3 and required packages are installed.`,
                    steps: []
                });
            }
        });

        child.stdin.write(payload);
        child.stdin.end();
    });
}

/**
 * Lightweight JavaScript fallback for basic math operations
 * when Python engine is unavailable
 */
function lightweightMath(type, input) {
    try {
        switch (type.toLowerCase()) {
            case 'solve':
            case 'evaluate':
            case 'eval':
            case 'compute': {
                // Safe evaluation using Function
                const sanitized = input.replace(/[^0-9+\-*/().,^%\s\[\]a-zA-Z]/g, '');
                const result = new Function('return (' + sanitized + ')')();
                return { status: 'success', result: String(result), steps: ['Evaluated using JS fallback'] };
            }
            case 'convert': {
                // Basic conversions
                const match = input.match(/([\d.]+)\s*(\w+)\s+(?:to|into|in)\s+(\w+)/i);
                if (match) {
                    const val = parseFloat(match[1]);
                    const fromUnit = match[2].toLowerCase();
                    const toUnit = match[3].toLowerCase();
                    // Basic length conversions
                    const conversions = {
                        m: 1, km: 1000, cm: 0.01, mm: 0.001,
                        ft: 0.3048, in: 0.0254, mi: 1609.344,
                        kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495
                    };
                    if (conversions[fromUnit] && conversions[toUnit]) {
                        const result = val * conversions[fromUnit] / conversions[toUnit];
                        return { status: 'success', result: `${result}`, steps: ['Converted using JS fallback'] };
                    }
                }
                return { status: 'error', result: 'Conversion not supported in fallback mode', steps: [] };
            }
            case 'stats':
            case 'statistics': {
                const nums = input.match(/-?\d+\.?\d*/g)?.map(Number) || [];
                if (nums.length === 0) return { status: 'error', result: 'No numbers found', steps: [] };
                const sum = nums.reduce((a, b) => a + b, 0);
                const mean = sum / nums.length;
                const sorted = [...nums].sort((a, b) => a - b);
                const median = sorted.length % 2 === 0 
                    ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 
                    : sorted[Math.floor(sorted.length/2)];
                return { 
                    status: 'success', 
                    result: `Mean: ${mean.toFixed(4)}, Median: ${median.toFixed(4)}, Count: ${nums.length}`, 
                    steps: ['Computed using JS fallback'] 
                };
            }
            default:
                return { status: 'error', result: `Operation '${type}' requires Python engine`, steps: [] };
        }
    } catch (e) {
        return { status: 'error', result: `Fallback error: ${e.message}`, steps: [] };
    }
}

module.exports = { mathEngine, lightweightMath };
