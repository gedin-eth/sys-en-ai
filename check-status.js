const http = require('http');
const WebSocket = require('ws');

console.log('🔍 Checking AI Agent Extension Status...\n');

// Check REST API
function checkRestAPI() {
    return new Promise((resolve) => {
        const req = http.request('http://localhost:3000/api/tasks', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        status: '✅',
                        message: 'REST API responding correctly',
                        data: result
                    });
                } catch (e) {
                    resolve({
                        status: '❌',
                        message: 'REST API not responding correctly',
                        error: e.message
                    });
                }
            });
        });
        
        req.on('error', () => {
            resolve({
                status: '❌',
                message: 'REST API not accessible',
                error: 'Connection failed'
            });
        });
        
        req.setTimeout(5000, () => {
            resolve({
                status: '❌',
                message: 'REST API timeout',
                error: 'Request timed out'
            });
        });
        
        req.end();
    });
}

// Check WebSocket
function checkWebSocket() {
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket('ws://localhost:3001');
            
            ws.on('open', () => {
                resolve({
                    status: '✅',
                    message: 'WebSocket connection successful'
                });
                ws.close();
            });
            
            ws.on('error', (error) => {
                resolve({
                    status: '❌',
                    message: 'WebSocket connection failed',
                    error: error.message
                });
            });
            
            setTimeout(() => {
                resolve({
                    status: '❌',
                    message: 'WebSocket connection timeout',
                    error: 'Connection timed out'
                });
            }, 5000);
            
        } catch (error) {
            resolve({
                status: '❌',
                message: 'WebSocket connection error',
                error: error.message
            });
        }
    });
}

// Check extension settings
function checkSettings() {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const settingsPath = path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'settings.json');
    
    try {
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            const hasConfig = settings['aiAgent.apiUrl'] && settings['aiAgent.apiToken'];
            
            return {
                status: hasConfig ? '✅' : '⚠️',
                message: hasConfig ? 'Extension settings configured' : 'Extension settings incomplete',
                config: hasConfig ? {
                    apiUrl: settings['aiAgent.apiUrl'],
                    syncInterval: settings['aiAgent.syncInterval'],
                    autoApply: settings['aiAgent.autoApply']
                } : null
            };
        } else {
            return {
                status: '❌',
                message: 'Settings file not found',
                path: settingsPath
            };
        }
    } catch (error) {
        return {
            status: '❌',
            message: 'Error reading settings',
            error: error.message
        };
    }
}

// Check extension package
function checkExtensionPackage() {
    const fs = require('fs');
    const packagePath = './cursor-ai-agent-extension-1.0.0.vsix';
    
    if (fs.existsSync(packagePath)) {
        const stats = fs.statSync(packagePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        return {
            status: '✅',
            message: `Extension package ready (${sizeMB}MB)`,
            size: sizeMB + 'MB',
            path: packagePath
        };
    } else {
        return {
            status: '❌',
            message: 'Extension package not found',
            path: packagePath
        };
    }
}

// Main status check
async function checkStatus() {
    console.log('📦 Extension Package:');
    const packageStatus = checkExtensionPackage();
    console.log(`   ${packageStatus.status} ${packageStatus.message}`);
    if (packageStatus.size) console.log(`   Size: ${packageStatus.size}`);
    
    console.log('\n⚙️  Extension Settings:');
    const settingsStatus = checkSettings();
    console.log(`   ${settingsStatus.status} ${settingsStatus.message}`);
    if (settingsStatus.config) {
        console.log(`   API URL: ${settingsStatus.config.apiUrl}`);
        console.log(`   Sync Interval: ${settingsStatus.config.syncInterval}ms`);
        console.log(`   Auto Apply: ${settingsStatus.config.autoApply}`);
    }
    
    console.log('\n🌐 REST API:');
    const restStatus = await checkRestAPI();
    console.log(`   ${restStatus.status} ${restStatus.message}`);
    if (restStatus.data && restStatus.data.success) {
        console.log(`   Tasks available: ${restStatus.data.data.length}`);
    }
    
    console.log('\n🔌 WebSocket:');
    const wsStatus = await checkWebSocket();
    console.log(`   ${wsStatus.status} ${wsStatus.message}`);
    
    console.log('\n📋 Summary:');
    const allChecks = [packageStatus, settingsStatus, restStatus, wsStatus];
    const passed = allChecks.filter(check => check.status === '✅').length;
    const total = allChecks.length;
    
    console.log(`   ${passed}/${total} checks passed`);
    
    if (passed === total) {
        console.log('\n🎉 All systems ready! You can now install the extension.');
        console.log('   Run: node install-extension.js (if you want automatic installation)');
    } else {
        console.log('\n⚠️  Some issues detected. Check the details above.');
    }
}

checkStatus(); 