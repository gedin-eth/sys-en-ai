import * as vscode from 'vscode';
import { AiAgentManager } from './aiAgentManager';
import { TaskProvider } from './providers/taskProvider';
import { ChangeProvider } from './providers/changeProvider';
import { LogProvider } from './providers/logProvider';
import { AiAgentPanel } from './ui/aiAgentPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Agent Extension is now active!');

    // Initialize AI Agent Manager
    const aiAgentManager = new AiAgentManager(context);
    
    // Register providers
    const taskProvider = new TaskProvider(aiAgentManager);
    const changeProvider = new ChangeProvider(aiAgentManager);
    const logProvider = new LogProvider(aiAgentManager);
    
    // Register tree data providers
    vscode.window.registerTreeDataProvider('aiAgentTasks', taskProvider);
    vscode.window.registerTreeDataProvider('aiAgentChanges', changeProvider);
    vscode.window.registerTreeDataProvider('aiAgentLogs', logProvider);
    
    // Register commands
    const syncTasksCommand = vscode.commands.registerCommand('aiAgent.syncTasks', () => {
        aiAgentManager.syncTasks();
    });
    
    const applyChangesCommand = vscode.commands.registerCommand('aiAgent.applyChanges', () => {
        aiAgentManager.applyPendingChanges();
    });
    
    const verifyChangesCommand = vscode.commands.registerCommand('aiAgent.verifyChanges', () => {
        aiAgentManager.verifyChanges();
    });
    
    const showPanelCommand = vscode.commands.registerCommand('aiAgent.showPanel', () => {
        AiAgentPanel.createOrShow(context.extensionUri, aiAgentManager);
    });
    
    // Register context subscriptions
    context.subscriptions.push(
        syncTasksCommand,
        applyChangesCommand,
        verifyChangesCommand,
        showPanelCommand,
        aiAgentManager
    );
    
    // Start initial sync
    aiAgentManager.startSync();
}

export function deactivate() {
    console.log('AI Agent Extension deactivated');
} 