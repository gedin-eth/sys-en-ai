# 🚀 Cursor AI Agent API - ChatGPT Web Agent Integration

## **Overview**

This OpenAPI 3.1.0 specification provides a comprehensive API for ChatGPT Web Agent interaction with the Cursor AI Agent extension. The API enables seamless integration between ChatGPT and the Cursor development environment.

**Base URL**: `https://b58cb0d0b1f7.ngrok-free.app`

## **🔐 Authentication**

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer YOUR_API_TOKEN
```

## **📋 API Endpoints**

### **1. Verification Endpoints**

#### **POST /api/lint** - Syntax Check
Validates code syntax and structure for provided diffs or content.

**Request:**
```json
{
  "path": "src/auth.js",
  "content": "function validateToken(token) {\n  return token.length > 0;\n}",
  "diff": "@@ -1,3 +1,5 @@\n-function validateToken(token) {\n+function validateToken(token) {\n+  if (!token) return false;\n   return token.length > 0;\n }"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passed": true,
    "errors": [],
    "warnings": ["Consider adding JSDoc comments"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### **POST /api/test-cases** - Edge Case Testing
Executes comprehensive test cases to validate edge cases and potential issues.

**Request:**
```json
{
  "path": "src/auth.js",
  "content": "function validateToken(token) {\n  if (!token) return false;\n  return token.length > 0;\n}",
  "testConfig": {
    "includeEdgeCases": true,
    "timeout": 30000,
    "maxTestCases": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passed": true,
    "testCases": [
      {
        "name": "Empty token test",
        "passed": true,
        "executionTime": 15.5
      }
    ],
    "summary": {
      "total": 5,
      "passed": 5,
      "failed": 0,
      "executionTime": 1250.5
    }
  }
}
```

#### **POST /api/regression-check** - Integration Validation
Performs regression testing and integration validation to ensure changes don't break existing functionality.

**Request:**
```json
{
  "path": "src/auth.js",
  "content": "function validateToken(token) {\n  if (!token) return false;\n  return token.length > 0;\n}",
  "baselineMetrics": {
    "responseTime": 150,
    "memoryUsage": 1024,
    "cpuUsage": 5.2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passed": true,
    "regressionTests": [
      {
        "name": "Authentication flow",
        "passed": true,
        "beforeMetrics": { "responseTime": 150 },
        "afterMetrics": { "responseTime": 145 },
        "difference": -5.0
      }
    ],
    "performanceImpact": {
      "responseTime": {
        "before": 150,
        "after": 145,
        "difference": -5,
        "percentage": -3.33
      }
    }
  }
}
```

### **2. Task Management**

#### **GET /api/tasks** - List Tasks
Retrieves all current tasks with optional filtering.

**Query Parameters:**
- `status`: Filter by status (pending, in_progress, completed, failed)
- `priority`: Filter by priority (low, medium, high, critical)
- `type`: Filter by type (bug, feature, status, diff, logs)
- `limit`: Maximum results (1-100, default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-123",
      "type": "bug",
      "title": "Fix authentication token validation",
      "description": "Authentication tokens are not being validated properly",
      "status": "pending",
      "priority": "high",
      "labels": ["bug", "high", "auth"],
      "assignee": "ai-agent",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### **POST /api/tasks** - Create Task
Creates a new task with specified details.

**Request:**
```json
{
  "type": "bug",
  "title": "Fix authentication token validation",
  "description": "Authentication tokens are not being validated properly",
  "priority": "high",
  "labels": ["bug", "high", "auth"],
  "assignee": "ai-agent"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-456",
    "type": "bug",
    "title": "Fix authentication token validation",
    "status": "pending",
    "priority": "high",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **3. Change Management**

#### **POST /api/apply** - Apply Changes
Applies code changes to the workspace with optional verification.

**Request:**
```json
{
  "changes": [
    {
      "type": "file",
      "path": "src/auth.js",
      "operation": "update",
      "content": "function validateToken(token) {\n  if (!token) return false;\n  return token.length > 0;\n}",
      "diff": "@@ -1,3 +1,5 @@\n-function validateToken(token) {\n+function validateToken(token) {\n+  if (!token) return false;\n   return token.length > 0;\n }",
      "metadata": {
        "author": "ai-agent",
        "version": "1.0"
      }
    }
  ],
  "taskId": "task-123",
  "autoVerify": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appliedChanges": [
      {
        "id": "change-789",
        "path": "src/auth.js",
        "status": "applied"
      }
    ],
    "failedChanges": [],
    "conflicts": [],
    "verificationResults": {
      "syntaxCheck": { "passed": true },
      "testCases": { "passed": true },
      "regressionCheck": { "passed": true }
    }
  }
}
```

### **4. System Status**

#### **GET /api/status** - Get Status
Retrieves current system status and synchronization information.

**Response:**
```json
{
  "success": true,
  "data": {
    "connection": {
      "status": "connected",
      "lastHeartbeat": "2024-01-01T00:00:00.000Z"
    },
    "sync": {
      "lastSync": "2024-01-01T00:00:00.000Z",
      "pendingTasks": 5,
      "pendingChanges": 2
    },
    "workspace": {
      "rootPath": "/workspace",
      "totalFiles": 150,
      "modifiedFiles": 3
    }
  }
}
```

## **🔄 Workflow Examples**

### **Complete Bug Fix Workflow**

1. **Create Task**
```bash
curl -X POST https://b58cb0d0b1f7.ngrok-free.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"bug","title":"Fix auth validation","priority":"high"}'
```

2. **Generate Fix**
```bash
curl -X POST https://b58cb0d0b1f7.ngrok-free.app/api/lint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"path":"src/auth.js","content":"function validateToken(token) { if (!token) return false; return token.length > 0; }"}'
```

3. **Apply Changes**
```bash
curl -X POST https://b58cb0d0b1f7.ngrok-free.app/api/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"changes":[{"path":"src/auth.js","operation":"update","content":"..."}],"autoVerify":true}'
```

## **📊 Error Handling**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Invalid request format",
  "code": "INVALID_REQUEST",
  "details": {
    "field": "path",
    "message": "Path is required"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request
- `401` - Unauthorized
- `409` - Conflict (for file conflicts)
- `500` - Internal Server Error

## **🔧 Integration with ChatGPT**

### **ChatGPT Plugin Configuration**

```yaml
# .well-known/ai-plugin.json
{
  "schema_version": "v1",
  "name_for_human": "Cursor AI Agent",
  "name_for_model": "cursor_ai_agent",
  "description_for_human": "Integrate with Cursor AI Agent for code verification and task management",
  "description_for_model": "API for managing tasks, verifying code, and applying changes in Cursor",
  "auth": {
    "type": "bearer"
  },
  "api": {
    "type": "openapi",
    "url": "https://b58cb0d0b1f7.ngrok-free.app/openapi.yaml"
  },
  "logo_url": "https://b58cb0d0b1f7.ngrok-free.app/logo.png",
  "contact_email": "support@cursor-ai-agent.com",
  "legal_info_url": "https://cursor-ai-agent.com/legal"
}
```

### **ChatGPT Usage Examples**

```
User: "Create a bug task for fixing the authentication issue in auth.js"

ChatGPT: I'll create a bug task for the authentication issue. Let me use the Cursor AI Agent API to create this task.

[API Call: POST /api/tasks]
Task created successfully! Bug task "Fix authentication issue in auth.js" has been created with high priority.
```

```
User: "Verify the syntax of my auth.js changes"

ChatGPT: I'll run a syntax check on your auth.js changes using the Cursor AI Agent API.

[API Call: POST /api/lint]
Syntax check completed! ✅ All syntax is valid. There's one warning: consider adding JSDoc comments for better documentation.
```

## **🚀 Getting Started**

1. **Obtain API Token**: Get your bearer token from the Cursor AI Agent extension
2. **Test Connection**: Use the status endpoint to verify connectivity
3. **Start Integration**: Begin with simple task creation and verification
4. **Scale Up**: Implement full workflows with change application

## **📈 Best Practices**

- **Always verify changes** before applying them
- **Use meaningful task titles** and descriptions
- **Monitor status** regularly for system health
- **Handle errors gracefully** with proper retry logic
- **Cache responses** when appropriate for performance

---

**📞 Support**: For API support, contact support@cursor-ai-agent.com
**📚 Documentation**: Full OpenAPI spec available at `/openapi.yaml`
**🔗 Repository**: https://github.com/cursor-ai-agent/extension 