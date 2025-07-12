const { exec } = require('child_process');
const ngrok = require('ngrok');
const fs = require('fs');

(async () => {
  try {
    console.log('Starting local server...');
    const serverProcess = exec('npm run start-server');

    serverProcess.stdout.on('data', data => process.stdout.write(data));
    serverProcess.stderr.on('data', data => process.stderr.write(data));

    console.log('Starting ngrok tunnel...');
    const url = await ngrok.connect(3000);
    console.log(`\n🌐 ngrok public URL: ${url}\n`);

    const openapiPath = './openapi.yaml';
    const content = fs.readFileSync(openapiPath, 'utf8');

    const updatedContent = content.replace(
      /servers:\s*- url: .*/,
      `servers:\n  - url: ${url}`
    );

    fs.writeFileSync(openapiPath, updatedContent, 'utf8');
    console.log('✅ openapi.yaml updated with public URL');
  } catch (error) {
    console.error('❌ Error during startup:', error);
    process.exit(1);
  }
})();