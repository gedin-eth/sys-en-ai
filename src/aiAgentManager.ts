import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosInstance } from 'axios';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Task, Change, AiAgentConfig, SyncResult, ApiResponse } from './types';

export class AiAgentManager implements vscode.Disposable {
    private config!: AiAgentConfig;
    private apiClient: AxiosInstance;
    private wsConnection?: WebSocket;
    private syncInterval?: NodeJS.Timeout;
    private tasks: Map<string, Task> = new Map();
    private changes: Map<string, Change> = new Map();
    private changeLog: Change[] = [];
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;

    constructor(private context: vscode.ExtensionContext) {
        this.loadConfig();
        this.apiClient = axios.create({
            baseURL: this.config.apiUrl,
            headers: {
                'Authorization': `Bearer ${this.config.apiToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.outputChannel = vscode.window.createOutputChannel('AI Agent');
        
        this.setupWebSocket();
        this.setupEventListeners();
    }

    private loadConfig(): void {
        const config = vscode.workspace.getConfiguration('aiAgent');
        this.config = {
            apiUrl: config.get('apiUrl', 'http://localhost:3000'),
            apiToken: config.get('apiToken', ''),
            syncInterval: config.get('syncInterval', 30000),
            autoApply: config.get('autoApply', false)
        };
    }

    private setupWebSocket(): void {
        try {
            const wsUrl = this.config.apiUrl.replace('http', 'ws') + '/ws';
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.on('open', () => {
                this.outputChannel.appendLine('WebSocket connected to AI Agent');
                this.statusBarItem.text = '$(check) AI Agent Connected';
                this.statusBarItem.show();
            });
            
            this.wsConnection.on('message', (data: Buffer) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    this.outputChannel.appendLine(`Error parsing WebSocket message: ${error}`);
                }
            });
            
            this.wsConnection.on('error', (error: Error) => {
                this.outputChannel.appendLine(`WebSocket error: ${error}`);
                this.statusBarItem.text = '$(error) AI Agent Error';
            });
            
            this.wsConnection.on('close', () => {
                this.outputChannel.appendLine('WebSocket disconnected from AI Agent');
                this.statusBarItem.text = '$(error) AI Agent Disconnected';
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.setupWebSocket(), 5000);
            });
        } catch (error) {
            this.outputChannel.appendLine(`Failed to setup WebSocket: ${error}`);
        }
    }

    private handleWebSocketMessage(message: any): void {
        switch (message.type) {
            case 'task_update':
                this.handleTaskUpdate(message.data);
                break;
            case 'change_ready':
                this.handleChangeReady(message.data);
                break;
            case 'verification_complete':
                this.handleVerificationComplete(message.data);
                break;
            default:
                this.outputChannel.appendLine(`Unknown message type: ${message.type}`);
        }
    }

    private setupEventListeners(): void {
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('aiAgent')) {
                this.loadConfig();
                this.outputChannel.appendLine('Configuration updated');
            }
        });
    }

    public async syncTasks(): Promise<SyncResult> {
        try {
            this.outputChannel.appendLine('Starting task sync...');
            
            // Fetch tasks from API
            const response = await this.apiClient.get<ApiResponse<Task[]>>('/api/tasks');
            
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Failed to fetch tasks');
            }
            
            const newTasks = response.data.data;
            let tasksSynced = 0;
            
            for (const task of newTasks) {
                if (!this.tasks.has(task.id) || this.tasks.get(task.id)!.updatedAt < task.updatedAt) {
                    this.tasks.set(task.id, task);
                    tasksSynced++;
                }
            }
            
            this.outputChannel.appendLine(`Synced ${tasksSynced} tasks`);
            
            // Parse local tasks.md if it exists
            await this.parseLocalTasks();
            
            return {
                success: true,
                tasksSynced,
                changesApplied: 0,
                errors: []
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Task sync failed: ${errorMessage}`);
            return {
                success: false,
                tasksSynced: 0,
                changesApplied: 0,
                errors: [errorMessage]
            };
        }
    }

    private async parseLocalTasks(): Promise<void> {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) return;
        
        const tasksPath = path.join(workspaceRoot, 'tasks.md');
        
        try {
            if (fs.existsSync(tasksPath)) {
                const content = fs.readFileSync(tasksPath, 'utf8');
                const lines = content.split('\n');
                
                for (const line of lines) {
                    const task = this.parseTaskLine(line);
                    if (task) {
                        this.tasks.set(task.id, task);
                    }
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error parsing local tasks: ${error}`);
        }
    }

    private parseTaskLine(line: string): Task | null {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return null;
        
        // Parse task format: [bug] [high] Fix authentication issue
        const match = trimmed.match(/^\[(\w+)\]\s*\[(\w+)\]\s*(.+)$/);
        if (!match) return null;
        
        const [, type, priority, title] = match;
        
        return {
            id: uuidv4(),
            type: type as Task['type'],
            title: title.trim(),
            description: '',
            status: 'pending',
            priority: priority as Task['priority'],
            labels: [type, priority],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    public async applyPendingChanges(): Promise<void> {
        const pendingChanges = Array.from(this.changes.values()).filter(c => c.status === 'pending');
        
        for (const change of pendingChanges) {
            try {
                await this.applyChange(change);
                change.status = 'applied';
                this.changeLog.push(change);
                this.outputChannel.appendLine(`Applied change: ${change.path}`);
            } catch (error) {
                change.status = 'failed';
                this.outputChannel.appendLine(`Failed to apply change ${change.path}: ${error}`);
            }
        }
    }

    private async applyChange(change: Change): Promise<void> {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) throw new Error('No workspace root found');
        
        const fullPath = path.join(workspaceRoot, change.path);
        
        switch (change.operation) {
            case 'create':
                await this.ensureDirectoryExists(path.dirname(fullPath));
                if (change.content) {
                    fs.writeFileSync(fullPath, change.content);
                }
                break;
            case 'update':
                if (change.content) {
                    fs.writeFileSync(fullPath, change.content);
                } else if (change.diff) {
                    await this.applyDiff(fullPath, change.diff);
                }
                break;
            case 'delete':
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
                break;
            case 'rename':
                // Handle rename operation
                break;
        }
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    private async applyDiff(filePath: string, diff: string): Promise<void> {
        // Simple diff application - in production, use a proper diff library
        const currentContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
        const newContent = this.applyUnifiedDiff(currentContent, diff);
        fs.writeFileSync(filePath, newContent);
    }

    private applyUnifiedDiff(originalContent: string, diff: string): string {
        // Simplified diff application - replace with proper diff library
        return diff;
    }

    public async verifyChanges(): Promise<void> {
        const appliedChanges = Array.from(this.changes.values()).filter(c => c.status === 'applied');
        
        for (const change of appliedChanges) {
            try {
                const results = await this.runTripleVerification(change);
                change.verificationResults = results;
                change.status = results.syntaxCheck.passed && 
                              results.edgeCaseTest.passed && 
                              results.integrationValidation.passed ? 'verified' : 'failed';
                
                this.outputChannel.appendLine(`Verification ${change.status} for: ${change.path}`);
            } catch (error) {
                change.status = 'failed';
                this.outputChannel.appendLine(`Verification failed for ${change.path}: ${error}`);
            }
        }
    }

    private async runTripleVerification(change: Change): Promise<any> {
        const diffData = {
            path: change.path,
            content: change.content,
            diff: change.diff
        };
        
        // 1. Syntax Check
        const syntaxResponse = await this.apiClient.post('/api/lint', diffData);
        
        // 2. Edge Case Test
        const edgeCaseResponse = await this.apiClient.post('/api/test-cases', diffData);
        
        // 3. Integration Validation
        const integrationResponse = await this.apiClient.post('/api/regression-check', diffData);
        
        return {
            syntaxCheck: syntaxResponse.data,
            edgeCaseTest: edgeCaseResponse.data,
            integrationValidation: integrationResponse.data
        };
    }

    public startSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            this.syncTasks();
        }, this.config.syncInterval);
        
        // Initial sync
        this.syncTasks();
    }

    public stopSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = undefined;
        }
    }

    public getTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    public getChanges(): Change[] {
        return Array.from(this.changes.values());
    }

    public getChangeLog(): Change[] {
        return this.changeLog;
    }

    public getConfig(): AiAgentConfig {
        return this.config;
    }

    private handleTaskUpdate(task: Task): void {
        this.tasks.set(task.id, task);
        this.outputChannel.appendLine(`Task updated: ${task.title}`);
    }

    private handleChangeReady(change: Change): void {
        this.changes.set(change.id, change);
        this.outputChannel.appendLine(`Change ready: ${change.path}`);
        
        if (this.config.autoApply) {
            this.applyPendingChanges();
        }
    }

    private handleVerificationComplete(data: any): void {
        const change = this.changes.get(data.changeId);
        if (change) {
            change.verificationResults = data.results;
            change.status = data.status;
            this.outputChannel.appendLine(`Verification complete for: ${change.path}`);
        }
    }

    public dispose(): void {
        this.stopSync();
        this.wsConnection?.close();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
} 