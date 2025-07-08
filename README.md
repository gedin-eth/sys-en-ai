# Cursor AI Agent Extension

A comprehensive extension for Cursor that provides integrated web AI agent support with automated task sync, change management, and triple verification.

## Features

### 🤖 AI Agent Integration
- **Secure Communication**: Bi-directional communication with web AI agents via REST APIs and WebSockets
- **Authentication**: Pre-configured API tokens or OAuth for secure access
- **Unified Schema**: Consistent task format for bugs, features, status, diffs, and logs

### 📋 Automated Task Sync
- **Event-driven Sync**: Real-time synchronization of bug/feature lists from tasks.md or remote JSON sources
- **Smart Parsing**: Automatic categorization with labels like [bug], [feature]
- **Live Updates**: Real-time polling and webhook triggers for instant updates

### 🔄 Change Implementation & Diff Management
- **Task Routing**: Intelligent routing of tasks to AI agents
- **Versioned Logs**: Complete change history with metadata tracking
- **Direct Application**: Apply diffs directly to workspace files
- **Rollback Support**: Easy revert functionality with rollback links

### 🎨 Enhanced UI
- **Status Panel**: Clear display of new fixes, features, and error reports
- **Color-coded Tags**: Visual indicators for [bug] (red), [feature] (blue), [error] (yellow)
- **Real-time Updates**: Live status updates in the sidebar

### ✅ Triple Verification System
After changes are applied, the extension automatically runs three verification steps:

1. **Syntax Check**: Validates code syntax and structure
2. **Edge Case Testing**: Comprehensive test case execution
3. **Integration Validation**: Regression testing and performance validation

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Press F5 in VS Code to run the extension in development mode

## Configuration

Configure the extension in your VS Code settings:

```json
{
  "aiAgent.apiUrl": "http://localhost:3000",
  "aiAgent.apiToken": "your-api-token-here",
  "aiAgent.syncInterval": 30000,
  "aiAgent.autoApply": false
}
```

### Configuration Options

- **apiUrl**: Web AI Agent API endpoint
- **apiToken**: Authentication token for API access
- **syncInterval**: Task synchronization interval in milliseconds
- **autoApply**: Automatically apply verified changes

## Usage

### Commands

The extension provides several commands accessible via the command palette:

- `AI Agent: Sync Tasks` - Manually sync tasks from the AI agent
- `AI Agent: Apply Changes` - Apply pending changes to workspace
- `AI Agent: Verify Changes` - Run triple verification on applied changes
- `AI Agent: Show Panel` - Open the AI Agent status panel

### Sidebar Views

The extension adds three new views to the sidebar:

1. **Tasks**: Shows all tasks grouped by status
2. **Changes**: Displays pending and applied changes
3. **Logs**: Complete change history with timestamps

### Status Panel

The AI Agent Status Panel provides:
- Real-time connection status
- Task and change statistics
- Quick action buttons
- Recent activity feed

## API Integration

The extension expects the following API endpoints from your web AI agent:

### Tasks API
```
GET /api/tasks
```

### Verification APIs
```
POST /api/lint
POST /api/test-cases
POST /api/regression-check
```

### WebSocket Events
- `task_update`: New or updated tasks
- `change_ready`: Changes ready for application
- `verification_complete`: Verification results

## Task Format

Tasks can be defined in a `tasks.md` file in your workspace:

```markdown
[bug] [high] Fix authentication issue
[feature] [medium] Add user profile page
[bug] [low] Update error messages
```

## Development

### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── aiAgentManager.ts         # Core AI agent management
├── types/index.ts           # TypeScript type definitions
├── providers/               # Tree data providers
│   ├── taskProvider.ts
│   ├── changeProvider.ts
│   └── logProvider.ts
└── ui/                      # UI components
    └── aiAgentPanel.ts
```

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run tests
npm test

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create an issue in the GitHub repository. 