console.log("[LIVE MOCK-API] This is the active mock-api.js");
require("dotenv").config();
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Auto-stage missing files when agent attempts to write to untracked paths
async function ensureFileTracked(filePath) {
    const absPath = path.resolve(path.join(process.cwd(), '..'), filePath);
    const dir = path.dirname(absPath);

    try {
        // Create directory if it doesn't exist
        await fs.promises.mkdir(dir, { recursive: true });
        
        // Touch the file if it doesn't exist
        await fs.promises.writeFile(absPath, '', { flag: 'a' });
        
        // Add to git
        execSync(`git add "${absPath}"`, { 
            cwd: path.join(process.cwd(), '..'),
            stdio: 'pipe'
        });
        
        console.log(`[AUTO-STAGE] Added file to Git: ${filePath}`);
        return true;
    } catch (err) {
        console.error(`[AUTO-STAGE] Failed to add file to Git: ${filePath}`, err.message);
        return false;
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let tasks = [];

let changes = [
    {
        id: '1',
        taskId: '1',
        type: 'file',
        path: 'src/auth.js',
        operation: 'update',
        content: '// Updated authentication logic',
        diff: '@@ -1,3 +1,5 @@\n-function validateToken(token) {\n+function validateToken(token) {\n+  if (!token) return false;\n   return token.length > 0;\n }',
        metadata: {
            author: 'ai-agent',
            timestamp: new Date(),
            version: '1.0'
        },
        status: 'pending'
    }
];

// Agent state tracking
let agentState = {
    status: 'online',
    lastSync: new Date(),
    activeTasks: tasks.filter(task => task.status === 'in_progress').length,
    totalTasks: tasks.length
};

// API Routes
app.get('/api/tasks', (req, res) => {
    res.json({
        success: true,
        data: tasks,
        timestamp: new Date()
    });
});

app.post('/api/tasks', (req, res) => {
    console.log('[TASK CREATE] Received task creation request:', JSON.stringify(req.body, null, 2));
    
    const newTask = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    tasks.push(newTask);
    
    console.log('[TASK CREATE] Created task:', newTask.id, newTask.title);
    console.log('[TASK CREATE] Total tasks now:', tasks.length);
    
    res.json({
        success: true,
        data: newTask,
        timestamp: new Date()
    });
});

app.get('/api/changes', (req, res) => {
    res.json({
        success: true,
        data: changes,
        timestamp: new Date()
    });
});

app.post('/api/changes', (req, res) => {
    const newChange = {
        id: Date.now().toString(),
        ...req.body,
        metadata: {
            ...req.body.metadata,
            timestamp: new Date()
        },
        status: 'pending'
    };
    changes.push(newChange);
    res.json({
        success: true,
        data: newChange,
        timestamp: new Date()
    });
});

// Apply changes endpoint
app.post('/api/apply', async (req, res) => {
    try {
        // Debug logging
        console.log('[debug] Received payload:', JSON.stringify(req.body, null, 2));
        
        // Validate Content-Type
        if (!req.is('application/json')) {
            return res.status(415).json({ error: 'Content-Type must be application/json' });
        }
        
        const { file, changes: patchContent } = req.body;
        
        // Proper type validation
        if (typeof file !== 'string' || typeof patchContent !== 'string') {
            return res.status(400).json({ 
                error: 'Missing required fields: file and changes',
                received: { file: typeof file, changes: typeof patchContent }
            });
        }
        
        if (!file.trim() || !patchContent.trim()) {
            return res.status(400).json({ 
                error: 'File and changes fields cannot be empty',
                received: { file: file, changes: patchContent.substring(0, 100) + '...' }
            });
        }
        
        // 1. Verify git repository
        try {
            execSync('git rev-parse --is-inside-work-tree', { cwd: path.join(process.cwd(), '..') });
        } catch {
            return res.status(500).json({ error: 'Project is not a git repository' });
        }
        
        // 2. Parse patch header for file path
        const match = patchContent.match(/^\+\+\+\s+[ab]?\/?(.+)$/m);
        if (!match) {
            return res.status(400).json({ error: 'Invalid patch format: missing +++ header' });
        }
        const relativePath = match[1].trim();
        
        // 3. Auto-stage file if not tracked by git
        try {
            execSync(`git ls-files --error-unmatch "${file}"`, { cwd: path.join(process.cwd(), '..') });
        } catch {
            console.log(`[AUTO-STAGE] File not tracked, attempting to stage: ${file}`);
            const staged = await ensureFileTracked(file);
            if (!staged) {
                return res.status(400).json({ error: `File ${file} not tracked by git and could not be auto-staged` });
            }
        }
        
        // 4. Write patch to temp file
        const tmpPatchPath = '/tmp/patch.diff';
        try {
            fs.writeFileSync(tmpPatchPath, patchContent);
        } catch (err) {
            console.error('Failed to write patch file:', err);
            return res.status(500).json({ error: 'Failed to write patch file', details: err.message });
        }
        
        // 5. Dry-run patch
        try {
            execSync(`git apply --check ${tmpPatchPath}`, { cwd: path.join(process.cwd(), '..'), stdio: 'pipe' });
        } catch (err) {
            return res.status(400).json({ error: 'Patch cannot be applied cleanly', details: err.message });
        }
        
        // 6. Apply patch
        try {
            execSync(`git apply ${tmpPatchPath}`, { cwd: path.join(process.cwd(), '..'), stdio: 'pipe' });
        } catch (err) {
            return res.status(500).json({ error: 'Failed to apply patch', details: err.message });
        }
        
        agentState.lastSync = new Date();
        const appliedChange = {
            id: Date.now().toString(),
            type: 'file',
            path: file,
            operation: 'update',
            content: patchContent,
            diff: patchContent,
            metadata: {
                author: 'ai-agent',
                timestamp: new Date(),
                version: '1.0'
            },
            status: 'applied'
        };
        changes.push(appliedChange);
        res.json({ success: true, file: file });
    } catch (error) {
        console.error('Error applying changes:', error);
        res.status(500).json({ error: 'Failed to apply changes', details: error.message });
    }
});

// File system operations endpoint
app.post('/api/filesystem', async (req, res) => {
    try {
        const { operation, path: filePath, content } = req.body;
        
        console.log(`[FILESYSTEM] ${operation} request for: ${filePath}`);
        
        switch (operation) {
            case 'readFile':
                try {
                    const fullPath = path.join(process.cwd(), '..', filePath);
                    const fileContent = await fs.promises.readFile(fullPath, 'utf8');
                    res.json({
                        success: true,
                        content: fileContent,
                        path: filePath
                    });
                } catch (error) {
                    res.status(404).json({ error: 'File not found', path: filePath });
                }
                break;
                
            case 'writeFile':
                try {
                    // Auto-stage the file before writing
                    await ensureFileTracked(filePath);
                    
                    const fullPath = path.join(process.cwd(), '..', filePath);
                    await fs.promises.writeFile(fullPath, content || '');
                    
                    console.log(`[FILESYSTEM] Successfully wrote to: ${filePath}`);
                    res.json({
                        success: true,
                        path: filePath,
                        message: 'File written successfully'
                    });
                } catch (error) {
                    console.error(`[FILESYSTEM] Write failed for ${filePath}:`, error.message);
                    res.status(500).json({ error: 'Failed to write file', path: filePath, details: error.message });
                }
                break;
                
            case 'listFiles':
                try {
                    const fullPath = path.join(process.cwd(), '..', filePath || '.');
                    const items = await fs.promises.readdir(fullPath, { withFileTypes: true });
                    const fileList = items.map(item => ({
                        name: item.name,
                        type: item.isDirectory() ? 'directory' : 'file',
                        path: path.join(filePath || '.', item.name)
                    }));
                    
                    res.json({
                        success: true,
                        files: fileList,
                        path: filePath || '.'
                    });
                } catch (error) {
                    res.status(404).json({ error: 'Directory not found', path: filePath });
                }
                break;
                
            default:
                res.status(400).json({ error: 'Unsupported operation', operation });
        }
        
    } catch (error) {
        console.error('[FILESYSTEM] Error:', error);
        res.status(500).json({ error: 'File system operation failed', details: error.message });
    }
});

// Git operations endpoint
app.post('/api/git', (req, res) => {
    try {
        const { command, args } = req.body;
        
        // Validate command is allowed
        const allowedCommands = ['add', 'commit', 'status'];
        if (!allowedCommands.includes(command)) {
            return res.status(400).json({ 
                error: 'Unsupported git command',
                allowedCommands: allowedCommands
            });
        }
        
        // Sanitize args to prevent shell injection (less aggressive)
        let sanitizedArgs = '';
        if (args && typeof args === 'string') {
            // Allow more characters but still prevent dangerous shell injection
            sanitizedArgs = args.replace(/[;&|`$(){}[\]]/g, '');
        }
        
        // Construct git command
        const gitCommand = `git ${command} ${sanitizedArgs}`.trim();
        
        // Execute git command from project root
        const result = execSync(gitCommand, { 
            cwd: path.join(process.cwd(), '..'),
            stdio: 'pipe',
            encoding: 'utf8'
        });
        
        // Check if this is a "nothing to commit" case (which is actually successful)
        const isNothingToCommit = result.includes('nothing to commit') || 
                                 result.includes('working tree clean') ||
                                 result.includes('up to date');
        
        // For add command with no files, this is also successful
        const isAddWithNoFiles = command === 'add' && 
                                (result.includes('fatal: pathspec') || result === '');
        
        if (isNothingToCommit || isAddWithNoFiles) {
            return res.json({
                success: true,
                output: result || 'Command completed successfully (no changes)',
                command: gitCommand,
                note: 'No changes to commit or add'
            });
        }
        
        res.json({
            success: true,
            output: result,
            command: gitCommand
        });
        
    } catch (error) {
        console.error('Git command failed:', error);
        
        // Check if this is a "nothing to commit" error (which is actually successful)
        const errorOutput = error.stderr || error.message || '';
        const isNothingToCommit = errorOutput.includes('nothing to commit') || 
                                 errorOutput.includes('working tree clean') ||
                                 errorOutput.includes('up to date');
        
        // For add command with no files, this is also successful
        const isAddWithNoFiles = req.body.command === 'add' && 
                                errorOutput.includes('fatal: pathspec');
        
        if (isNothingToCommit || isAddWithNoFiles) {
            return res.json({
                success: true,
                output: errorOutput || 'Command completed successfully (no changes)',
                command: `git ${req.body.command} ${req.body.args || ''}`,
                note: 'No changes to commit or add'
            });
        }
        
        res.status(500).json({ 
            error: 'Git execution failed', 
            details: error.message,
            command: req.body.command,
            stderr: error.stderr || ''
        });
    }
});

// Status endpoint
app.get('/api/status', (req, res) => {
    // Update agent state with current data
    agentState.activeTasks = tasks.filter(task => task.status === 'in_progress').length;
    agentState.totalTasks = tasks.length;
    agentState.lastSync = new Date();

    res.json({
        success: true,
        data: {
            status: agentState.status,
            tasks: agentState.totalTasks,
            activeTasks: agentState.activeTasks,
            lastSync: agentState.lastSync.toISOString()
        },
        timestamp: new Date()
    });
});

// Triple Verification APIs
app.post('/api/lint', (req, res) => {
    // Mock syntax check
    res.json({
        success: true,
        data: {
            passed: true,
            errors: [],
            warnings: ['Consider adding JSDoc comments']
        }
    });
});

app.post('/api/test-cases', (req, res) => {
    // Mock edge case testing
    res.json({
        success: true,
        data: {
            passed: true,
            testCases: [
                {
                    name: 'Empty token test',
                    passed: true,
                    executionTime: 15
                },
                {
                    name: 'Invalid token test',
                    passed: true,
                    executionTime: 12
                }
            ]
        }
    });
});

app.post('/api/regression-check', (req, res) => {
    // Mock integration validation
    res.json({
        success: true,
        data: {
            passed: true,
            regressionTests: [
                {
                    name: 'Authentication flow',
                    passed: true,
                    beforeMetrics: { responseTime: 150 },
                    afterMetrics: { responseTime: 145 },
                    difference: -5
                }
            ]
        }
    });
});

// Import middleware - DISABLED FOR TESTING
const auth = (req, res, next) => next();
const checkTier = () => (req, res, next) => next();

// Register dynamic handlers with middleware
app.post('/api/runTests', require('../api/testing/runTests'));
app.post('/api/runCommand', auth, checkTier('runCommand'), require('../api/execution/runCommand'));

// WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send initial data
    ws.send(JSON.stringify({
        type: 'connection_established',
        data: { message: 'Connected to AI Agent API' }
    }));

    // Simulate periodic updates
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'heartbeat',
                data: { timestamp: new Date() }
            }));
        }
    }, 30000);

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clearInterval(interval);
    });
});

// Start server
app.listen(port, () => {
    console.log(`AI Agent Mock API running on http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:3001`);
    console.log(`[DEV] Auto-reload enabled with nodemon`);
});

// Simulate task updates
setInterval(() => {
    if (wss.clients.size > 0) {
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'task_update',
                    data: randomTask
                }));
            }
        });
    }
}, 60000);
