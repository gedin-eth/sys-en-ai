const fs = require('fs');
const yaml = require('js-yaml');

// Test the OpenAPI specification
console.log('🔍 Validating OpenAPI Specification...\n');

// Read and parse the OpenAPI spec
try {
    const openapiContent = fs.readFileSync('openapi.yaml', 'utf8');
    const spec = yaml.load(openapiContent);
    
    console.log('✅ OpenAPI spec loaded successfully');
    console.log(`📋 API Title: ${spec.info.title}`);
    console.log(`🌐 Server URL: ${spec.servers[0].url}`);
    console.log(`🔐 Security: ${spec.security[0].bearerAuth ? 'Bearer Auth Required' : 'None'}\n`);
    
    // Validate required endpoints
    const requiredEndpoints = [
        'POST /api/lint',
        'POST /api/test-cases', 
        'POST /api/regression-check',
        'GET /api/tasks',
        'POST /api/tasks',
        'POST /api/apply',
        'GET /api/status'
    ];
    
    console.log('🔍 Checking Required Endpoints:');
    requiredEndpoints.forEach(endpoint => {
        const [method, path] = endpoint.split(' ');
        if (spec.paths[path] && spec.paths[path][method.toLowerCase()]) {
            console.log(`✅ ${endpoint}`);
        } else {
            console.log(`❌ ${endpoint} - MISSING`);
        }
    });
    
    // Check schemas
    console.log('\n📊 Checking Schema Definitions:');
    const requiredSchemas = [
        'LintRequest', 'LintResponse',
        'TestRequest', 'TestResponse', 
        'RegressionRequest', 'RegressionResponse',
        'Task', 'TaskCreateRequest', 'TaskListResponse',
        'ApplyRequest', 'ApplyResponse',
        'StatusResponse', 'ErrorResponse'
    ];
    
    requiredSchemas.forEach(schema => {
        if (spec.components.schemas[schema]) {
            console.log(`✅ ${schema}`);
        } else {
            console.log(`❌ ${schema} - MISSING`);
        }
    });
    
    // Check security
    console.log('\n🔐 Checking Security Configuration:');
    if (spec.components.securitySchemes.bearerAuth) {
        console.log('✅ Bearer Authentication configured');
    } else {
        console.log('❌ Bearer Authentication missing');
    }
    
    console.log('\n🎉 OpenAPI Specification Validation Complete!');
    console.log('\n📝 Sample API Calls:');
    console.log('\n1. Get Status:');
    console.log('curl -X GET https://b58cb0d0b1f7.ngrok-free.app/api/status \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN"');
    
    console.log('\n2. Create Task:');
    console.log('curl -X POST https://b58cb0d0b1f7.ngrok-free.app/api/tasks \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -d \'{"type":"bug","title":"Test Bug","priority":"high"}\'');
    
    console.log('\n3. Run Syntax Check:');
    console.log('curl -X POST https://b58cb0d0b1f7.ngrok-free.app/api/lint \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -d \'{"path":"test.js","content":"function test() {}"}\'');
    
} catch (error) {
    console.error('❌ Error validating OpenAPI spec:', error.message);
    process.exit(1);
} 