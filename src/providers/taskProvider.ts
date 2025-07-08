import * as vscode from 'vscode';
import { Task } from '../types';
import { AiAgentManager } from '../aiAgentManager';

export class TaskProvider implements vscode.TreeDataProvider<TaskItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined | null | void> = new vscode.EventEmitter<TaskItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private aiAgentManager: AiAgentManager) {
        // Listen for task updates
        setInterval(() => {
            this._onDidChangeTreeData.fire();
        }, 5000);
    }

    getTreeItem(element: TaskItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TaskItem): Thenable<TaskItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const tasks = this.aiAgentManager.getTasks();
        const taskItems = tasks.map(task => new TaskItem(task));
        
        // Group by status
        const groupedTasks = this.groupTasksByStatus(taskItems);
        return Promise.resolve(groupedTasks);
    }

    private groupTasksByStatus(tasks: TaskItem[]): TaskItem[] {
        const statusGroups = new Map<string, TaskItem[]>();
        
        for (const task of tasks) {
            const status = task.task.status;
            if (!statusGroups.has(status)) {
                statusGroups.set(status, []);
            }
            statusGroups.get(status)!.push(task);
        }

        const result: TaskItem[] = [];
        
        // Add status headers and tasks
        for (const [status, statusTasks] of statusGroups) {
            const statusItem = new TaskItem({
                id: `status-${status}`,
                type: 'status',
                title: this.capitalizeStatus(status),
                description: `${statusTasks.length} tasks`,
                status: status as any,
                priority: 'medium',
                labels: [status],
                createdAt: new Date(),
                updatedAt: new Date()
            }, true);
            
            statusItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            result.push(statusItem);
            
            // Add tasks under this status
            for (const task of statusTasks) {
                task.collapsibleState = vscode.TreeItemCollapsibleState.None;
                result.push(task);
            }
        }
        
        return result;
    }

    private capitalizeStatus(status: string): string {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class TaskItem extends vscode.TreeItem {
    constructor(
        public readonly task: Task,
        public readonly isStatusHeader: boolean = false
    ) {
        super(
            isStatusHeader ? task.title : task.title,
            isStatusHeader ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = isStatusHeader ? `${task.description}` : `${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}`;
        this.description = isStatusHeader ? task.description : this.getTaskDescription();
        
        this.iconPath = this.getIconPath();
        this.contextValue = isStatusHeader ? 'statusHeader' : 'task';
    }

    private getTaskDescription(): string {
        const parts = [];
        
        if (this.task.priority !== 'medium') {
            parts.push(this.task.priority);
        }
        
        if (this.task.assignee) {
            parts.push(`@${this.task.assignee}`);
        }
        
        return parts.join(' • ');
    }

    private getIconPath(): vscode.ThemeIcon | undefined {
        if (this.isStatusHeader) {
            return new vscode.ThemeIcon('list-tree');
        }

        switch (this.task.type) {
            case 'bug':
                return new vscode.ThemeIcon('bug', new vscode.ThemeColor('errorForeground'));
            case 'feature':
                return new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor('textLink.foreground'));
            case 'diff':
                return new vscode.ThemeIcon('git-compare');
            case 'logs':
                return new vscode.ThemeIcon('output');
            default:
                return new vscode.ThemeIcon('circle');
        }
    }
} 