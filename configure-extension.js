const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Configuring AI Agent Extension Settings...\n');

// Get the user's VS Code/Cursor settings directory
function getSettingsPath() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    // VS Code settings path
    const vscodePath = path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
    
    // Cursor settings path (if different)
    const cursorPath = path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'settings.json');
    
    // Check which one exists
    if (fs.existsSync(vscodePath)) {
        return vscodePath;
    } else if (fs.existsSync(cursorPath)) {
        return cursorPath;
    } else {
        // Default to VS Code path
        return vscodePath;
    }
}

// Read existing settings
function readSettings(settingsPath) {
    try {
        if (fs.existsSync(settingsPath)) {
            const content = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.log('⚠️  Could not read existing settings, creating new file');
    }
    return {};
}

// Write settings
function writeSettings(settingsPath, settings) {
    try {
        // Ensure directory exists
        const dir = path.dirname(settingsPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error writing settings:', error.message);
        return false;
    }
}

// Main configuration
function configureExtension() {
    const settingsPath = getSettingsPath();
    console.log(`📁 Settings path: ${settingsPath}`);
    
    // Read existing settings
    const settings = readSettings(settingsPath);
    
    // AI Agent configuration
    const aiAgentConfig = {
        "aiAgent.apiUrl": "http://localhost:3000",
        "aiAgent.apiToken": "test-token",
        "aiAgent.syncInterval": 30000,
        "aiAgent.autoApply": false
    };
    
    // Merge with existing settings
    const updatedSettings = { ...settings, ...aiAgentConfig };
    
    // Write settings
    if (writeSettings(settingsPath, updatedSettings)) {
        console.log('✅ Extension settings configured successfully!');
        console.log('\n📋 Added configuration:');
        Object.entries(aiAgentConfig).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log('\n🔄 Please restart VS Code/Cursor for changes to take effect.');
    } else {
        console.log('❌ Failed to configure settings automatically.');
        console.log('\n📝 Please manually add this to your settings.json:');
        console.log(JSON.stringify(aiAgentConfig, null, 2));
    }
}

// Run configuration
configureExtension(); 