import * as vscode from 'vscode';
import * as path from 'path';
import { AiAgentManager } from '../aiAgentManager';

export class AiAgentPanel {
    public static currentPanel: AiAgentPanel | undefined;
    public static readonly viewType = 'aiAgentPanel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _aiAgentManager: AiAgentManager;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, aiAgentManager: AiAgentManager) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AiAgentPanel.currentPanel) {
            AiAgentPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            AiAgentPanel.viewType,
            'AI Agent Status',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out/compiled')
                ]
            }
        );

        AiAgentPanel.currentPanel = new AiAgentPanel(panel, extensionUri, aiAgentManager);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, aiAgentManager: AiAgentManager) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._aiAgentManager = aiAgentManager;

        this._setHtml();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'syncTasks':
                        this._aiAgentManager.syncTasks();
                        return;
                    case 'applyChanges':
                        this._aiAgentManager.applyPendingChanges();
                        return;
                    case 'verifyChanges':
                        this._aiAgentManager.verifyChanges();
                        return;
                }
            },
            null,
            this._disposables
        );

        // Update panel content periodically
        setInterval(() => {
            this._updateContent();
        }, 5000);
    }

    private _setHtml() {
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const tasks = this._aiAgentManager.getTasks();
        const changes = this._aiAgentManager.getChanges();
        const config = this._aiAgentManager.getConfig();

        const taskStats = this._getTaskStats(tasks);
        const changeStats = this._getChangeStats(changes);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Agent Status</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .title {
            font-size: 18px;
            font-weight: bold;
        }
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.connected {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }
        .status.disconnected {
            background-color: var(--vscode-errorForeground);
            color: white;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
        }
        .stat-title {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-detail {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        }
        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn:hover {
            opacity: 0.8;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
        .task-list, .change-list {
            max-height: 200px;
            overflow-y: auto;
        }
        .task-item, .change-item {
            padding: 8px;
            margin-bottom: 5px;
            background-color: var(--vscode-list-hoverBackground);
            border-radius: 4px;
            border-left: 3px solid var(--vscode-panel-border);
        }
        .task-item.bug {
            border-left-color: var(--vscode-errorForeground);
        }
        .task-item.feature {
            border-left-color: var(--vscode-textLink-foreground);
        }
        .change-item.pending {
            border-left-color: var(--vscode-textPreformat-foreground);
        }
        .change-item.applied {
            border-left-color: var(--vscode-testing-iconPassed);
        }
        .change-item.verified {
            border-left-color: var(--vscode-testing-iconPassed);
        }
        .change-item.failed {
            border-left-color: var(--vscode-errorForeground);
        }
        .item-title {
            font-weight: bold;
            margin-bottom: 2px;
        }
        .item-meta {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">AI Agent Status</div>
        <div class="status connected">Connected</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">Tasks</div>
            <div class="stat-value">${taskStats.total}</div>
            <div class="stat-detail">
                ${taskStats.pending} pending • ${taskStats.inProgress} in progress • ${taskStats.completed} completed
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Changes</div>
            <div class="stat-value">${changeStats.total}</div>
            <div class="stat-detail">
                ${changeStats.pending} pending • ${changeStats.applied} applied • ${changeStats.verified} verified
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-title">API Status</div>
            <div class="stat-value">${config.apiUrl ? 'Online' : 'Offline'}</div>
            <div class="stat-detail">
                ${config.apiUrl}
            </div>
        </div>
    </div>

    <div class="actions">
        <button class="btn btn-primary" onclick="syncTasks()">Sync Tasks</button>
        <button class="btn btn-secondary" onclick="applyChanges()">Apply Changes</button>
        <button class="btn btn-secondary" onclick="verifyChanges()">Verify Changes</button>
    </div>

    <div class="section">
        <div class="section-title">Recent Tasks</div>
        <div class="task-list">
            ${this._renderTasks(tasks.slice(0, 5))}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Recent Changes</div>
        <div class="change-list">
            ${this._renderChanges(changes.slice(0, 5))}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function syncTasks() {
            vscode.postMessage({ command: 'syncTasks' });
        }

        function applyChanges() {
            vscode.postMessage({ command: 'applyChanges' });
        }

        function verifyChanges() {
            vscode.postMessage({ command: 'verifyChanges' });
        }
    </script>
</body>
</html>`;
    }

    private _getTaskStats(tasks: any[]) {
        const stats = {
            total: tasks.length,
            pending: 0,
            inProgress: 0,
            completed: 0,
            failed: 0
        };

        for (const task of tasks) {
            switch (task.status) {
                case 'pending':
                    stats.pending++;
                    break;
                case 'in_progress':
                    stats.inProgress++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
                case 'failed':
                    stats.failed++;
                    break;
            }
        }

        return stats;
    }

    private _getChangeStats(changes: any[]) {
        const stats = {
            total: changes.length,
            pending: 0,
            applied: 0,
            verified: 0,
            failed: 0
        };

        for (const change of changes) {
            switch (change.status) {
                case 'pending':
                    stats.pending++;
                    break;
                case 'applied':
                    stats.applied++;
                    break;
                case 'verified':
                    stats.verified++;
                    break;
                case 'failed':
                    stats.failed++;
                    break;
            }
        }

        return stats;
    }

    private _renderTasks(tasks: any[]): string {
        if (tasks.length === 0) {
            return '<div class="task-item">No tasks available</div>';
        }

        return tasks.map(task => `
            <div class="task-item ${task.type}">
                <div class="item-title">${task.title}</div>
                <div class="item-meta">
                    ${task.type} • ${task.priority} • ${task.status}
                </div>
            </div>
        `).join('');
    }

    private _renderChanges(changes: any[]): string {
        if (changes.length === 0) {
            return '<div class="change-item">No changes available</div>';
        }

        return changes.map(change => `
            <div class="change-item ${change.status}">
                <div class="item-title">${change.operation} ${change.path}</div>
                <div class="item-meta">
                    ${change.metadata.author} • ${change.status} • ${change.metadata.timestamp.toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    private _updateContent() {
        this._setHtml();
    }

    public dispose() {
        AiAgentPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
} 