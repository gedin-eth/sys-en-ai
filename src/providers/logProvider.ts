import * as vscode from 'vscode';
import { Change } from '../types';
import { AiAgentManager } from '../aiAgentManager';

export class LogProvider implements vscode.TreeDataProvider<LogItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<LogItem | undefined | null | void> = new vscode.EventEmitter<LogItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<LogItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private aiAgentManager: AiAgentManager) {
        // Listen for log updates
        setInterval(() => {
            this._onDidChangeTreeData.fire();
        }, 2000);
    }

    getTreeItem(element: LogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: LogItem): Promise<LogItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const changes = this.aiAgentManager.getChangeLog();
        const logItems = changes.map(change => new LogItem(change));
        
        // Sort by timestamp (newest first)
        logItems.sort((a, b) => b.change.metadata.timestamp.getTime() - a.change.metadata.timestamp.getTime());
        
        return Promise.resolve(logItems);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class LogItem extends vscode.TreeItem {
    constructor(
        public readonly change: Change
    ) {
        super(
            `${change.operation} ${change.path.split('/').pop() || change.path}`,
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = this.getLogTooltip();
        this.description = this.getLogDescription();
        
        this.iconPath = this.getIconPath();
        this.contextValue = 'log';
    }

    private getLogTitle(): string {
        return `${this.change.operation} ${this.getFileName(this.change.path)}`;
    }

    private getLogTooltip(): string {
        const timestamp = this.change.metadata.timestamp.toLocaleString();
        return `${this.change.operation} ${this.change.path}\nAuthor: ${this.change.metadata.author}\nTime: ${timestamp}\nStatus: ${this.change.status}`;
    }

    private getLogDescription(): string {
        const timestamp = this.change.metadata.timestamp.toLocaleTimeString();
        return `${this.change.metadata.author} • ${timestamp}`;
    }

    private getFileName(filePath: string): string {
        const parts = filePath.split('/');
        return parts[parts.length - 1] || filePath;
    }

    private getIconPath(): vscode.ThemeIcon | undefined {
        switch (this.change.operation) {
            case 'create':
                return new vscode.ThemeIcon('add', new vscode.ThemeColor('testing.iconPassed'));
            case 'update':
                return new vscode.ThemeIcon('edit', new vscode.ThemeColor('textLink.foreground'));
            case 'delete':
                return new vscode.ThemeIcon('trash', new vscode.ThemeColor('errorForeground'));
            case 'rename':
                return new vscode.ThemeIcon('arrow-swap', new vscode.ThemeColor('textLink.foreground'));
            default:
                return new vscode.ThemeIcon('file');
        }
    }
} 