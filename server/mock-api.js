const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const { execSync } = require('child_process');

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let tasks = [
    {
        id: '1',
        type: 'bug',
        title: 'Fix authentication token validation',
        description: 'Authentication tokens are not being validated properly',
        status: 'pending',
        priority: 'high',
        labels: ['bug', 'high', 'auth'],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        type: 'feature',
        title: 'Add real-time task synchronization',
        description: 'Implement real-time sync between client and server',
        status: 'in_progress',
        priority: 'high',
        labels: ['feature', 'high', 'sync'],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

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
    const newTask = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    tasks.push(newTask);
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
app.post('/api/apply', (req, res) => {
    try {
        const filePath = req.body.file;
        const patch = req.body.changes;
        // Fail-fast validation for ChatGPT compatibility
        if (!filePath || !patch) {
            return res.status(400).json({ 
                error: "Missing required fields: file and changes" 
            });
        }
        // Save patch to a temp file
        const tmpPatchPath = '/tmp/patch.diff';
        try {
            fs.writeFileSync(tmpPatchPath, patch);
        } catch (err) {
            console.error('Failed to write patch file:', err);
            return res.status(500).json({ error: 'Failed to write patch file' });
        }
        // Apply patch using git
        try {
            execSync(`git apply ${tmpPatchPath}`, { cwd: process.cwd() });
        } catch (err) {
            console.error('Failed to apply patch:', err);
            return res.status(500).json({ error: 'Failed to apply patch' });
        }
        // Update agent state
        agentState.lastSync = new Date();
        // Add to changes history
        const appliedChange = {
            id: Date.now().toString(),
            type: 'file',
            path: filePath,
            operation: 'update',
            content: patch,
            diff: patch,
            metadata: {
                author: 'ai-agent',
                timestamp: new Date(),
                version: '1.0'
            },
            status: 'applied'
        };
        changes.push(appliedChange);
        // Return ChatGPT-compatible response format
        res.json({ 
            success: true, 
            file: filePath 
        });
    } catch (error) {
        console.error('Error applying changes:', error);
        res.status(500).json({ 
            error: 'Failed to apply changes' 
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