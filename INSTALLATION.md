# 📦 **Extension Installation Guide**

## **✅ Extension Package Ready**

Your extension has been successfully built and packaged:
- **File**: `cursor-ai-agent-extension-1.0.0.vsix`
- **Size**: 1.24MB
- **Location**: `/Users/kgedin/dev/sys-en-ai/`

## **🚀 Install the Extension**

### **Method 1: VS Code/Cursor (Recommended)**

1. **Open VS Code/Cursor**
2. **Go to Extensions** (`Cmd+Shift+X`)
3. **Click the "..." menu** (three dots) in the Extensions panel
4. **Select "Install from VSIX..."**
5. **Navigate to**: `/Users/kgedin/dev/sys-en-ai/cursor-ai-agent-extension-1.0.0.vsix`
6. **Select the file** and click "Install"
7. **Reload VS Code/Cursor** when prompted

### **Method 2: Command Line**

```bash
# Install via command line
code --install-extension cursor-ai-agent-extension-1.0.0.vsix

# Or for Cursor
cursor --install-extension cursor-ai-agent-extension-1.0.0.vsix
```

### **Method 3: Drag & Drop**

1. **Open VS Code/Cursor**
2. **Drag the .vsix file** directly onto the VS Code/Cursor window
3. **Click "Install"** when prompted

## **🔧 Configure the Extension**

After installation, configure the extension in VS Code/Cursor settings:

### **Open Settings**
- Press `Cmd+,` (or `File → Preferences → Settings`)
- Click the "Open Settings (JSON)" icon in the top right

### **Add Configuration**
```json
{
  "aiAgent.apiUrl": "http://localhost:3000",
  "aiAgent.apiToken": "test-token",
  "aiAgent.syncInterval": 30000,
  "aiAgent.autoApply": false
}
```

## **🎯 Verify Installation**

### **Check Extension is Loaded**
1. **Go to Extensions** (`Cmd+Shift+X`)
2. **Search for "AI Agent"**
3. **You should see**: "Cursor AI Agent Extension" installed and enabled

### **Check Sidebar**
1. **Look for the AI Agent icon** in the sidebar (🤖)
2. **Click it** to see the AI Agent views
3. **You should see**: Tasks, Changes, and Logs sections

### **Check Commands**
1. **Press `Cmd+Shift+P`**
2. **Type "AI Agent"**
3. **You should see** these commands:
   - AI Agent: Sync Tasks
   - AI Agent: Apply Changes
   - AI Agent: Verify Changes
   - AI Agent: Show Panel

## **🌐 Start the API Server**

Before using the extension, make sure the API server is running:

```bash
# Navigate to the server directory
cd /Users/kgedin/dev/sys-en-ai/server

# Start the server
npm start
```

**Expected output:**
```
AI Agent Mock API running on http://localhost:3000
WebSocket server running on ws://localhost:3001
```

## **🎨 Using the Extension**

### **1. View Tasks**
- Click the **AI Agent icon** in the sidebar
- Select **"Tasks"** to see all current tasks
- Tasks are grouped by status (pending, in progress, completed, failed)

### **2. Create Tasks**
- Use the command palette: `Cmd+Shift+P` → "AI Agent: Sync Tasks"
- Or create tasks via the API: `POST http://localhost:3000/api/tasks`

### **3. Apply Changes**
- Use the command palette: `Cmd+Shift+P` → "AI Agent: Apply Changes"
- Or apply changes via the API: `POST http://localhost:3000/api/apply`

### **4. Verify Code**
- Use the command palette: `Cmd+Shift+P` → "AI Agent: Verify Changes"
- Or verify via the API:
  - `POST http://localhost:3000/api/lint` (syntax check)
  - `POST http://localhost:3000/api/test-cases` (test cases)
  - `POST http://localhost:3000/api/regression-check` (regression testing)

### **5. View Status**
- Use the command palette: `Cmd+Shift+P` → "AI Agent: Show Panel"
- Or check status via the API: `GET http://localhost:3000/api/status`

## **🔗 Webapp Integration**

Your webapp can now integrate with the extension via the API:

```javascript
// Example: Create a task from your webapp
const createTask = async () => {
  const response = await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'bug',
      title: 'Fix login issue',
      priority: 'high'
    })
  });
  return response.json();
};
```

## **🚨 Troubleshooting**

### **Extension Not Installing**
- Check if the .vsix file exists: `ls -la *.vsix`
- Try restarting VS Code/Cursor
- Check VS Code/Cursor console for errors

### **Extension Not Loading**
- Check if the extension is enabled in Extensions panel
- Look for errors in VS Code/Cursor console (`Help → Toggle Developer Tools`)
- Verify TypeScript compilation: `npm run compile`

### **API Connection Issues**
- Ensure server is running: `curl http://localhost:3000/api/tasks`
- Check API URL in settings
- Verify network connectivity

### **WebSocket Issues**
- Check WebSocket connection: `ws://localhost:3001`
- Ensure no firewall blocking port 3001
- Check browser console for connection errors

## **📞 Support**

- **Installation Issues**: Check VS Code/Cursor console
- **Extension Issues**: Review the extension logs
- **API Issues**: Check server logs
- **Integration Issues**: Review the webapp example

---

**🎉 Your extension is now installed and ready to use!** 