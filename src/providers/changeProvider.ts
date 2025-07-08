import * as vscode from 'vscode';
import { Change } from '../types';
import { AiAgentManager } from '../aiAgentManager';

export class ChangeProvider implements vscode.TreeDataProvider<ChangeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChangeItem | undefined | null | void> = new vscode.EventEmitter<ChangeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ChangeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private aiAgentManager: AiAgentManager) {
        // Listen for change updates
        setInterval(() => {
            this._onDidChangeTreeData.fire();
        }, 3000);
    }

    getTreeItem(element: ChangeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangeItem): Promise<ChangeItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const changes = this.aiAgentManager.getChanges();
        const changeItems = changes.map(change => new ChangeItem(change));
        
        // Group by status
        const groupedChanges = this.groupChangesByStatus(changeItems);
        return Promise.resolve(groupedChanges);
    }

    private groupChangesByStatus(changes: ChangeItem[]): ChangeItem[] {
        const statusGroups = new Map<string, ChangeItem[]>();
        
        for (const change of changes) {
            const status = change.change.status;
            if (!statusGroups.has(status)) {
                statusGroups.set(status, []);
            }
            statusGroups.get(status)!.push(change);
        }

        const result: ChangeItem[] = [];
        
        // Add status headers and changes
        for (const [status, statusChanges] of statusGroups) {
            const statusItem = new ChangeItem({
                id: `status-${status}`,
                taskId: '',
                type: 'file',
                path: this.capitalizeStatus(status),
                operation: 'update',
                metadata: {
                    author: '',
                    timestamp: new Date(),
                    version: '1.0'
                },
                status: status as any
            }, true);
            
            statusItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            result.push(statusItem);
            
            // Add changes under this status
            for (const change of statusChanges) {
                change.collapsibleState = vscode.TreeItemCollapsibleState.None;
                result.push(change);
            }
        }
        
        return result;
    }

    private capitalizeStatus(status: string): string {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class ChangeItem extends vscode.TreeItem {
    constructor(
        public readonly change: Change,
        public readonly isStatusHeader: boolean = false
    ) {
        super(
            isStatusHeader ? change.path : pathModule.basename(change.path),
            isStatusHeader ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = isStatusHeader ? `${change.path}` : this.getChangeTooltip();
        this.description = isStatusHeader ? `${this.getChangesCount()} changes` : this.getChangeDescription();
        
        this.iconPath = this.getIconPath();
        this.contextValue = isStatusHeader ? 'statusHeader' : 'change';
    }

    private getChangeTooltip(): string {
        return `${this.change.path}\nOperation: ${this.change.operation}\nStatus: ${this.change.status}\nAuthor: ${this.change.metadata.author}`;
    }

    private getChangeDescription(): string {
        const parts = [];
        
        parts.push(this.change.operation);
        
        if (this.change.metadata.author) {
            parts.push(`by ${this.change.metadata.author}`);
        }
        
        return parts.join(' ');
    }

    private getChangesCount(): number {
        // This would be calculated from the actual changes
        return 1;
    }

    private getIconPath(): vscode.ThemeIcon | undefined {
        if (this.isStatusHeader) {
            return new vscode.ThemeIcon('list-tree');
        }

        switch (this.change.status) {
            case 'pending':
                return new vscode.ThemeIcon('clock');
            case 'applied':
                return new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
            case 'verified':
                return new vscode.ThemeIcon('shield', new vscode.ThemeColor('testing.iconPassed'));
            case 'failed':
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
            default:
                return new vscode.ThemeIcon('file');
        }
    }
}

import * as pathModule from 'path'; 