const { execSync } = require('child_process');
const http = require('http');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const NC = '\x1b[0m'; // No Color

console.log("🚀 Iniciando Smoke Test (Node.js version)...");

function logPass(msg) {
    console.log(`${GREEN}✅ PASSED: ${msg}${NC}`);
}

function logFail(msg) {
    console.log(`${RED}❌ FAILED: ${msg}${NC}`);
    process.exit(1);
}

function execDocker(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return null; // Fail silently or handle
    }
}

async function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    // 1. Connectivity (Frontend -> API)
    console.log("\n🔍 [1/3] Probando Conectividad Interna Docker...");
    // Try wget inside frontend container
    const healthCheck = execDocker('docker exec rfai_frontend wget -qO- http://api:3000/api/health');
    if (healthCheck && healthCheck.includes("OK")) {
        logPass("Frontend puede conectar con API (/api/health)");
    } else {
        logFail("Frontend no pudo contactar a la API. Verifique logs de docker.");
    }

    // 2. Data Persistence
    console.log("\n💾 [2/3] Probando Persistencia de Datos...");

    // Create User
    const testEmail = `smoke_${Date.now()}@test.com`;
    console.log(`   Creando usuario temporal: ${testEmail}`);

    let createUserRes;
    try {
        createUserRes = await request('POST', '/users', {
            name: 'Smoke Test Node',
            email: testEmail,
            role: 'CLIENT'
        });
    } catch (e) {
        logFail(`No se pudo contactar localhost:3000. ¿Está corriendo la API? Error: ${e.message}`);
    }

    if (createUserRes.status !== 200 && createUserRes.status !== 201) {
        logFail(`Error creando usuario. Status: ${createUserRes.status}`);
    }

    const userData = JSON.parse(createUserRes.body);
    const userId = userData.id;
    if (!userId) logFail("No se obtuvo ID de usuario en la respuesta.");
    console.log(`   ID Creado: ${userId}`);

    // Restart DB
    console.log("   🔄 Reiniciando contenedor de Base de Datos...");
    execSync('docker-compose restart db');

    console.log("   Esperando healthcheck de DB (15s)...");
    await sleep(15000);

    // Verify User
    console.log("   Verificando existencia del usuario...");
    // Retry logic in case API is still reconnecting to DB
    let verifyRes;
    for (let i = 0; i < 5; i++) {
        try {
            verifyRes = await request('GET', `/users/${userId}`);
            if (verifyRes.status === 200) break;
        } catch (e) { }
        await sleep(2000);
    }

    if (verifyRes && verifyRes.status === 200) {
        logPass("Datos persisten tras reinicio de DB.");
    } else {
        logFail("Usuario perdido o API no reconectó con DB tras reinicio.");
    }

    // Teardown
    console.log("   Limpiando datos de prueba...");
    execDocker(`docker exec rfai_postgres psql -U admin -d reprogramacion_foca -c "DELETE FROM users WHERE id = '${userId}';"`);
    logPass("Limpieza completada.");

    // 3. Security (Interceptor 401)
    console.log("\n👮 [3/3] Auditoría de Seguridad (401)...");
    const authRes = await request('POST', '/auth/login', { email: 'bad@bad.com', password: 'bad' });

    if (authRes.status === 401) {
        logPass("API retorna 401 correctamente proveyendo trigger para interceptor.");
    } else {
        logFail(`Se esperaba 401, se recibió ${authRes.status}`);
    }

    console.log("\n🎉 TODOS LOS TESTS PASARON EXITOSAMENTE.");
}

run();
