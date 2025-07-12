# System Engineering AI Agent

A comprehensive AI agent system for automated task sync, change management, and triple verification via REST API and WebSocket communication.

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

### ✅ Triple Verification System
After changes are applied, the system automatically runs three verification steps:

1. **Syntax Check**: Validates code syntax and structure
2. **Edge Case Testing**: Comprehensive test case execution
3. **Integration Validation**: Regression testing and performance validation

## Quick Start

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Usage

### Start Server with ngrok (for external access)
```bash
node scripts/start-server-and-ngrok.js
```

### Test API Endpoints
```bash
node test-openapi.js
```

## Configuration

The system uses environment variables for configuration:

```bash
# API Configuration
API_PORT=3000
API_TOKEN=your-api-token-here
SYNC_INTERVAL=30000
AUTO_APPLY=false
```

## API Endpoints

### Tasks API
```
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
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

## Project Structure

```
├── server/                  # Backend server
│   ├── start-server.js     # Server entry point
│   ├── server/             # Server implementation
│   └── package.json        # Server dependencies
├── api/                    # API endpoints
│   ├── execution/          # Command execution
│   ├── fileSystem/         # File operations
│   ├── git/               # Git operations
│   └── testing/           # Test execution
├── scripts/               # Utility scripts
├── openapi.yaml           # API specification
├── tasks.md              # Task definitions
└── webapp-example/       # Example web interface
```

## Development

### Running Tests
```bash
npm test
```

### API Documentation
The complete API specification is available in `openapi.yaml` and can be viewed with any OpenAPI viewer.

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