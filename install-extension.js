const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Installing AI Agent Extension...\n');

// Check if vsce is installed
function checkVSCE() {
    try {
        execSync('vsce --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

// Install vsce if not available
function installVSCE() {
    console.log('📦 Installing VSCE (VS Code Extension Manager)...');
    try {
        execSync('npm install -g @vscode/vsce', { stdio: 'inherit' });
        console.log('✅ VSCE installed successfully');
        return true;
    } catch (error) {
        console.log('❌ Failed to install VSCE:', error.message);
        return false;
    }
}

// Get VS Code/Cursor installation path
function getVSCodePath() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    if (platform === 'darwin') {
        // macOS
        const paths = [
            '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
            '/Applications/Cursor.app/Contents/Resources/app/bin/code',
            path.join(homeDir, 'Applications', 'Visual Studio Code.app', 'Contents', 'Resources', 'app', 'bin', 'code'),
            path.join(homeDir, 'Applications', 'Cursor.app', 'Contents', 'Resources', 'app', 'bin', 'code')
        ];
        
        for (const p of paths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
    }
    
    return null;
}

// Install extension using vsce
function installExtension() {
    const vsixPath = './cursor-ai-agent-extension-1.0.0.vsix';
    
    if (!fs.existsSync(vsixPath)) {
        console.log('❌ Extension package not found:', vsixPath);
        return false;
    }
    
    console.log('📦 Installing extension package...');
    
    try {
        // Use vsce to install
        execSync(`vsce install ${vsixPath}`, { stdio: 'inherit' });
        console.log('✅ Extension installed successfully!');
        return true;
    } catch (error) {
        console.log('❌ Failed to install extension:', error.message);
        return false;
    }
}

// Alternative installation using code CLI
function installWithCodeCLI() {
    const codePath = getVSCodePath();
    const vsixPath = path.resolve('./cursor-ai-agent-extension-1.0.0.vsix');
    
    if (!codePath) {
        console.log('❌ VS Code/Cursor not found in standard locations');
        return false;
    }
    
    console.log('📦 Installing extension using VS Code CLI...');
    
    try {
        execSync(`"${codePath}" --install-extension "${vsixPath}"`, { stdio: 'inherit' });
        console.log('✅ Extension installed successfully!');
        return true;
    } catch (error) {
        console.log('❌ Failed to install extension:', error.message);
        return false;
    }
}

// Main installation process
async function main() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if vsce is available
    if (!checkVSCE()) {
        console.log('⚠️  VSCE not found, attempting to install...');
        if (!installVSCE()) {
            console.log('⚠️  VSCE installation failed, trying alternative method...');
            return installWithCodeCLI();
        }
    }
    
    // Try vsce installation first
    if (installExtension()) {
        return true;
    }
    
    // Fallback to code CLI
    console.log('🔄 Trying alternative installation method...');
    return installWithCodeCLI();
}

// Run installation
main().then(success => {
    if (success) {
        console.log('\n🎉 Installation completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Restart VS Code/Cursor');
        console.log('   2. Look for the 🤖 AI Agent icon in the sidebar');
        console.log('   3. Try commands: Cmd+Shift+P → "AI Agent: Sync Tasks"');
        console.log('\n🌐 API Server is running on:');
        console.log('   REST API: http://localhost:3000');
        console.log('   WebSocket: ws://localhost:3001');
    } else {
        console.log('\n❌ Installation failed. Please install manually:');
        console.log('   1. Open VS Code/Cursor');
        console.log('   2. Go to Extensions (Cmd+Shift+X)');
        console.log('   3. Click "..." → "Install from VSIX..."');
        console.log('   4. Select: cursor-ai-agent-extension-1.0.0.vsix');
    }
}).catch(error => {
    console.log('❌ Installation error:', error.message);
}); 