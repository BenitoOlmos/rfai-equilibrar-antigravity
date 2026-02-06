import axios from 'axios';

// Función helper para imprimir resultados
const logResult = (testName: string, success: boolean, details?: any) => {
    console.log(`[${success ? '✅ PASÓ' : '❌ FALLÓ'}] ${testName}`);
    if (!success && details) console.log('   Detalles:', JSON.stringify(details, null, 2));
};

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🛡️ Iniciando Hostile Data Testing...\n');

    // 1. Crear Usuario con Email Inválido
    try {
        await axios.post(`${BASE_URL}/users`, {
            name: 'Hacker',
            email: 'not-an-email',
            role: 'CLIENT'
        });
        logResult('Rechazar Email Inválido', false, 'El servidor aceptó un email inválido');
    } catch (error: any) {
        if (error.response?.status === 400 && error.response.data.error === 'Validation Error') {
            logResult('Rechazar Email Inválido', true);
        } else {
            logResult('Rechazar Email Inválido', false, error.response?.data || error.message);
        }
    }

    // 2. Crear Usuario con Rol Inexistente
    try {
        await axios.post(`${BASE_URL}/users`, {
            name: 'Hacker Role',
            email: 'hacker@test.com',
            role: 'SUPER_ADMIN_GOD_MODE'
        });
        logResult('Rechazar Rol Inexistente', false, 'El servidor aceptó un rol inexistente');
    } catch (error: any) {
        if (error.response?.status === 400) {
            logResult('Rechazar Rol Inexistente', true);
        } else {
            logResult('Rechazar Rol Inexistente', false, error.response?.data || error.message);
        }
    }

    // 3. Actualizar Perfil con Fecha Futura
    // Primero necesitamos un ID válido (simulado o hardcoded si no hay seed corriendo, pero usaremos un UUID válido fake para probar el rechazo de formato o lógica)
    // El endpoint valida params.userId como UUID.
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    try {
        await axios.put(`${BASE_URL}/profiles/${fakeUuid}`, {
            fechaNacimiento: '2050-01-01T00:00:00Z'
        });
        logResult('Rechazar Fecha Futura', false, 'El servidor aceptó una fecha futura');
    } catch (error: any) {
        if (error.response?.status === 400) { // Esperamos 400 por validación, no 404. Validation runs first.
            // Chequear mensaje específico si es posible, pero status 400 basta para este test de "hostile data"
            logResult('Rechazar Fecha Futura', true);
        } else {
            logResult('Rechazar Fecha Futura', false, error.response?.data || error.message);
        }
    }

    // 4. Inyección de UUID inválido en URL
    try {
        await axios.get(`${BASE_URL}/users/not-a-uuid`);
        logResult('Rechazar UUID Inválido en URL', false, 'El servidor aceptó un ID no-UUID');
    } catch (error: any) {
        if (error.response?.status === 400) {
            const isValidationError = error.response.data.error === 'Validation Error';
            logResult('Rechazar UUID Inválido en URL', isValidationError, error.response.data);
        } else {
            logResult('Rechazar UUID Inválido en URL', false, error.response?.data || error.message);
        }
    }

    // 5. Inscripción con datos corruptos (Tipos incorrectos)
    try {
        await axios.post(`${BASE_URL}/inscriptions`, {
            pacienteId: 12345, // Number en vez de UUID string
            programaId: 'uuid-valido-pero-falso',
            fechaInicio: 'ayer' // String no fecha
        });
        logResult('Rechazar Tipos Incorrectos', false, 'El servidor aceptó tipos incorrectos');
    } catch (error: any) {
        if (error.response?.status === 400) {
            logResult('Rechazar Tipos Incorrectos', true);
        } else {
            logResult('Rechazar Tipos Incorrectos', false, error.response?.data || error.message);
        }
    }
}

runTests();
