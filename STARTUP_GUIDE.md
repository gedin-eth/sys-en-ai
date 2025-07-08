# 🚀 **Extension Startup Guide for Webapp Integration**

## **Quick Start (5 minutes)**

### **1. ✅ API Server Status**
The mock API server is already running:
- **URL**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:3001`
- **Status**: ✅ Running and responding

### **2. 🎯 Start the Extension in VS Code/Cursor**

#### **Option A: Development Mode (Recommended)**
```bash
# In VS Code/Cursor:
# 1. Open the project folder
# 2. Press F5 (or Cmd+Shift+P → "Developer: Start Debugging")
# 3. Select "Extension" from the dropdown
```

#### **Option B: Install as Extension**
```bash
# Build the extension package
npm run compile
npm run package

# Install the .vsix file in VS Code/Cursor
# Extensions → Install from VSIX → Select the generated .vsix file
```

### **3. 🔧 Configure the Extension**

Open VS Code/Cursor settings and add:

```json
{
  "aiAgent.apiUrl": "http://localhost:3000",
  "aiAgent.apiToken": "your-api-token-here",
  "aiAgent.syncInterval": 30000,
  "aiAgent.autoApply": false
}
```

### **4. 🌐 Connect Your Webapp**

#### **Option A: Direct API Integration**
Your webapp can directly call the API endpoints:

```javascript
// Example: Create a task from your webapp
const createTask = async (taskData) => {
  const response = await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token'
    },
    body: JSON.stringify({
      type: 'bug',
      title: 'Fix login issue',
      priority: 'high',
      description: 'Users cannot log in'
    })
  });
  return response.json();
};
```

#### **Option B: WebSocket Real-time Updates**
```javascript
// Connect to WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'task_update':
      // Update your webapp UI with new task
      updateTaskList(message.data);
      break;
    case 'change_ready':
      // Notify about new changes
      notifyChange(message.data);
      break;
  }
};
```

## **🎨 Using the Extension UI**

### **Sidebar Views**
Once the extension is loaded, you'll see:

1. **🤖 AI Agent** - Main sidebar section
2. **📋 Tasks** - List of all tasks
3. **🔄 Changes** - Pending and applied changes
4. **📝 Logs** - Complete change history

### **Commands Available**
Press `Cmd+Shift+P` and search for:
- `AI Agent: Sync Tasks` - Manual sync
- `AI Agent: Apply Changes` - Apply pending changes
- `AI Agent: Verify Changes` - Run verification
- `AI Agent: Show Panel` - Open status panel

### **Status Panel**
The status panel shows:
- Connection status
- Task statistics
- Change statistics
- Quick action buttons

## **🔗 Webapp Integration Examples**

### **React Component Example**
```jsx
import React, { useState, useEffect } from 'react';

const AiAgentIntegration = () => {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});

  useEffect(() => {
    // Fetch tasks
    fetchTasks();
    // Connect WebSocket
    connectWebSocket();
  }, []);

  const fetchTasks = async () => {
    const response = await fetch('http://localhost:3000/api/tasks');
    const data = await response.json();
    setTasks(data.data);
  };

  const createTask = async (taskData) => {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    const newTask = await response.json();
    setTasks([...tasks, newTask.data]);
  };

  return (
    <div>
      <h2>AI Agent Tasks</h2>
      {tasks.map(task => (
        <div key={task.id} className={`task ${task.type}`}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span className={`priority ${task.priority}`}>
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  );
};
```

### **Vue.js Component Example**
```vue
<template>
  <div class="ai-agent">
    <h2>AI Agent Integration</h2>
    <div class="tasks">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        :class="['task', task.type]"
      >
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <span :class="['priority', task.priority]">
          {{ task.priority }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [],
      ws: null
    }
  },
  mounted() {
    this.fetchTasks();
    this.connectWebSocket();
  },
  methods: {
    async fetchTasks() {
      const response = await fetch('http://localhost:3000/api/tasks');
      const data = await response.json();
      this.tasks = data.data;
    },
    connectWebSocket() {
      this.ws = new WebSocket('ws://localhost:3001');
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'task_update') {
          this.updateTask(message.data);
        }
      };
    }
  }
}
</script>
```

## **🔧 Production Setup**

### **1. Update API URL**
For production, update the API URL in your extension settings:

```json
{
  "aiAgent.apiUrl": "https://your-production-api.com",
  "aiAgent.apiToken": "your-production-token"
}
```

### **2. Environment Variables**
Set up environment variables in your webapp:

```bash
# .env
REACT_APP_AI_AGENT_API_URL=http://localhost:3000
REACT_APP_AI_AGENT_WS_URL=ws://localhost:3001
REACT_APP_AI_AGENT_TOKEN=your-token
```

### **3. CORS Configuration**
If your webapp is on a different domain, ensure CORS is configured:

```javascript
// In your API server
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-webapp.com'],
  credentials: true
}));
```

## **🚨 Troubleshooting**

### **Extension Not Loading**
1. Check VS Code/Cursor console for errors
2. Ensure TypeScript compilation succeeded
3. Restart VS Code/Cursor

### **API Connection Issues**
1. Verify server is running: `curl http://localhost:3000/api/tasks`
2. Check API URL in settings
3. Verify network connectivity

### **WebSocket Issues**
1. Check WebSocket URL: `ws://localhost:3001`
2. Ensure no firewall blocking port 3001
3. Check browser console for connection errors

## **📞 Support**

- **Extension Issues**: Check VS Code/Cursor console
- **API Issues**: Check server logs
- **Integration Issues**: Review browser console

---

**🎯 You're ready to use the extension with your webapp!** 