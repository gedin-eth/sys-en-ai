# ⚡ **Quick Start Guide - Use Extension Now!**

## **🎯 Current Status**
- ✅ **API Server**: Running on `http://localhost:3000`
- ✅ **WebSocket**: Running on `ws://localhost:3001`
- ✅ **Extension**: Compiled and ready
- ✅ **Webapp Example**: Running on `http://localhost:8080`

## **🚀 Start Using the Extension Right Now**

### **Option 1: Start Extension in VS Code/Cursor (Recommended)**

1. **Open VS Code/Cursor**
2. **Open this project folder** (`/Users/kgedin/dev/sys-en-ai`)
3. **Press F5** (or `Cmd+Shift+P` → "Developer: Start Debugging")
4. **Select "Extension"** from the dropdown
5. **New VS Code window opens** with the extension loaded

### **Option 2: Test the Webapp Integration**

1. **Open your browser**
2. **Go to**: `http://localhost:8080`
3. **You'll see**: A beautiful webapp with real-time task management
4. **Features available**:
   - View current tasks
   - Create new tasks
   - Run syntax checks
   - Execute test cases
   - Real-time WebSocket updates

## **🎨 What You'll See**

### **In VS Code/Cursor Extension:**
- **Sidebar**: AI Agent section with Tasks, Changes, and Logs
- **Commands**: Available via `Cmd+Shift+P`
- **Status Bar**: Connection status indicator
- **Output Panel**: AI Agent logs and messages

### **In the Webapp:**
- **Task Management**: Create and view tasks
- **Code Verification**: Syntax checks and test execution
- **Real-time Updates**: Live task updates via WebSocket
- **Beautiful UI**: Modern, responsive design

## **🔧 Configure the Extension**

In VS Code/Cursor settings (JSON):

```json
{
  "aiAgent.apiUrl": "http://localhost:3000",
  "aiAgent.apiToken": "test-token",
  "aiAgent.syncInterval": 30000,
  "aiAgent.autoApply": false
}
```

## **📋 Available Commands**

Press `Cmd+Shift+P` and search for:
- `AI Agent: Sync Tasks` - Manual task synchronization
- `AI Agent: Apply Changes` - Apply pending changes
- `AI Agent: Verify Changes` - Run triple verification
- `AI Agent: Show Panel` - Open status panel

## **🌐 API Endpoints Ready**

All endpoints are working and ready for your webapp:

```bash
# Test the API
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/status

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"bug","title":"Test Bug","priority":"high"}'

# Run syntax check
curl -X POST http://localhost:3000/api/lint \
  -H "Content-Type: application/json" \
  -d '{"path":"test.js","content":"function test() {}"}'
```

## **🔗 Integration Examples**

### **React/Vue/Angular Integration**
The webapp example shows how to integrate with any framework:
- **REST API calls** for CRUD operations
- **WebSocket connection** for real-time updates
- **Error handling** and status management

### **Direct API Integration**
```javascript
// Create task
const response = await fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'bug',
    title: 'Fix login issue',
    priority: 'high'
  })
});

// WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle real-time updates
};
```

## **🎯 Next Steps**

1. **Start the extension** (F5 in VS Code/Cursor)
2. **Test the webapp** (http://localhost:8080)
3. **Integrate with your project** using the API endpoints
4. **Customize the UI** and workflows as needed

## **🚨 Troubleshooting**

### **Extension Not Loading**
- Check VS Code/Cursor console for errors
- Ensure TypeScript compilation succeeded (`npm run compile`)
- Restart VS Code/Cursor

### **API Not Responding**
- Verify server is running: `curl http://localhost:3000/api/tasks`
- Check if port 3000 is available
- Restart server: `cd server && npm start`

### **Webapp Not Loading**
- Check if port 8080 is available
- Restart webapp: `cd webapp-example && python3 -m http.server 8080`

## **📞 Quick Help**

- **Extension Issues**: Check VS Code/Cursor console
- **API Issues**: Check server logs in terminal
- **Webapp Issues**: Check browser console
- **Integration Issues**: Review the webapp example code

---

**🎉 You're all set! The extension is ready to use with your webapp!** 