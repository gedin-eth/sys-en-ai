export interface Task {
    id: string;
    type: 'bug' | 'feature' | 'status' | 'diff' | 'logs';
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    assignee?: string;
}

export interface Change {
    id: string;
    taskId: string;
    type: 'file' | 'directory' | 'config';
    path: string;
    operation: 'create' | 'update' | 'delete' | 'rename';
    content?: string;
    diff?: string;
    metadata: {
        author: string;
        timestamp: Date;
        rollbackLink?: string;
        version: string;
    };
    status: 'pending' | 'applied' | 'verified' | 'failed';
    verificationResults?: VerificationResults;
}

export interface VerificationResults {
    syntaxCheck: {
        passed: boolean;
        errors: string[];
        warnings: string[];
    };
    edgeCaseTest: {
        passed: boolean;
        testCases: TestCase[];
    };
    integrationValidation: {
        passed: boolean;
        regressionTests: RegressionTest[];
    };
}

export interface TestCase {
    name: string;
    passed: boolean;
    error?: string;
    executionTime: number;
}

export interface RegressionTest {
    name: string;
    passed: boolean;
    beforeMetrics: any;
    afterMetrics: any;
    difference: number;
}

export interface AiAgentConfig {
    apiUrl: string;
    apiToken: string;
    syncInterval: number;
    autoApply: boolean;
}

export interface SyncResult {
    success: boolean;
    tasksSynced: number;
    changesApplied: number;
    errors: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
} 