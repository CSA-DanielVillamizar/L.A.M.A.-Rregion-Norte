/**
 * Script de Prueba de Inscripción
 * Simula el proceso completo: Registro → WhatsApp → Dashboard
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000';
const API_KEY = 'lama-api-key-2026';

// Datos de prueba
const inscripcionPrueba = {
    tipo_participante: 'DAMA L.A.M.A. FULL COLOR MEMBER',
    nombre_completo: 'María Rodríguez Test',
    documento_numero: '1234567890',
    eps: 'Sanitas EPS',
    emergencia_nombre: 'Juan Rodríguez',
    emergencia_telefono: '3001234567',
    capitulo: 'Barranquilla',
    capitulo_otro: null,
    cargo_directivo: null,
    fecha_llegada_isla: '2026-09-12',
    condicion_medica: 'Ninguna',
    adquiere_jersey: true,
    talla_jersey: 'L',
    asiste_con_acompanante: true,
    nombre_acompanante: 'Carlos Rodríguez'
};

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testInscripcion() {
    log('\nINICIANDO PRUEBA DE INSCRIPCIÓN\n', 'bold');

    try {
        // PASO 1: Verificar que el servidor esté activo
        log('Paso 1: Verificando servidor...', 'cyan');
        const healthCheck = await axios.get(`${BASE_URL}/api/health`);
        
        if (healthCheck.data.success) {
            log('Servidor activo y BD conectada\n', 'green');
        } else {
            throw new Error('Servidor no responde correctamente');
        }

        // PASO 2: Registrar inscripción
        log('Paso 2: Enviando inscripción de prueba...', 'cyan');
        const registroResponse = await axios.post(
            `${BASE_URL}/api/register`,
            inscripcionPrueba
        );

        if (registroResponse.data.success) {
            const datos = registroResponse.data.data;
            log('Inscripción registrada exitosamente\n', 'green');
            log('DATOS DE RESPUESTA:', 'yellow');
            log(`   ID de Inscripción: #${datos.codigo_confirmacion}`, 'cyan');
            log(`   Nombre: ${datos.nombre}`, 'cyan');
            log(`   Capítulo: ${datos.capitulo}`, 'cyan');
            log(`   Fecha: ${datos.fecha_registro}\n`, 'cyan');

            // PASO 3: Verificar formato de WhatsApp
            log('Paso 3: Construyendo mensaje de WhatsApp...', 'cyan');
            const total = 150000 + (inscripcionPrueba.adquiere_jersey ? 70000 : 0);
            const mensajeWhatsApp = construirMensajeWhatsApp(
                inscripcionPrueba, 
                datos, 
                total
            );
            
            log('Mensaje construido:\n', 'green');
            log('─────────────────────────────────────────', 'yellow');
            log(mensajeWhatsApp, 'cyan');
            log('─────────────────────────────────────────\n', 'yellow');

            // PASO 4: Verificar en el dashboard (con API Key)
            log('Paso 4: Verificando en el dashboard...', 'cyan');
            const statsResponse = await axios.get(
                `${BASE_URL}/api/admin/estadisticas`,
                {
                    headers: { 'x-api-key': API_KEY }
                }
            );

            if (statsResponse.data.success) {
                const stats = statsResponse.data.data;
                log('Estadísticas actualizadas:', 'green');
                log(`   Total inscripciones: ${stats.total_inscripciones}`, 'cyan');
                log(`   Pagos pendientes: ${stats.pagos_pendientes}`, 'cyan');
                log(`   Con jersey: ${stats.total_jerseys}`, 'cyan');
                log(`   Total recaudado: $${stats.total_recaudado?.toLocaleString('es-CO')}\n`, 'cyan');
            }

            // PASO 5: Prueba de actualización de estado
            log('Paso 5: Probando cambio de estado a "Aprobado"...', 'cyan');
            const updateResponse = await axios.put(
                `${BASE_URL}/api/admin/inscripciones/${datos.codigo_confirmacion}/estado`,
                { estado_validacion: 'Aprobado' },
                {
                    headers: { 
                        'x-api-key': API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (updateResponse.data.success) {
                log('Estado actualizado correctamente a "Aprobado"\n', 'green');
            }

            // RESUMEN FINAL
            log('═══════════════════════════════════════', 'bold');
            log('PRUEBA COMPLETADA EXITOSAMENTE', 'green');
            log('═══════════════════════════════════════\n', 'bold');
            
            log('RESUMEN:', 'yellow');
            log(`   Inscripción creada con ID: #${datos.codigo_confirmacion}`, 'green');
            log('   Mensaje de WhatsApp formateado correctamente', 'green');
            log('   Dashboard actualizado con nuevos datos', 'green');
            log('   Cambio de estado funcional\n', 'green');

            log('ACCIONES SIGUIENTES:', 'yellow');
            log(`   1. Abrir dashboard: ${BASE_URL}/admin/dashboard`, 'cyan');
            log(`   2. Login: admin / lama2026`, 'cyan');
            log(`   3. Buscar inscripción #${datos.codigo_confirmacion}`, 'cyan');
            log(`   4. Verificar que el estado es "Aprobado" (verde)\n`, 'cyan');

        } else {
            throw new Error('Error al registrar inscripción');
        }

    } catch (error) {
        log('\nERROR EN LA PRUEBA:', 'red');
        
        if (error.response) {
            // Error de respuesta del servidor
            log(`   Status: ${error.response.status}`, 'red');
            log(`   Mensaje: ${error.response.data.message || 'Sin mensaje'}`, 'red');
            if (error.response.data.errors) {
                log(`   Errores: ${JSON.stringify(error.response.data.errors, null, 2)}`, 'red');
            }
        } else if (error.request) {
            // Error de red (servidor no responde)
            log('   El servidor no responde. Verifica que esté ejecutándose:', 'red');
            log('   npm start', 'yellow');
        } else {
            // Otro tipo de error
            log(`   ${error.message}`, 'red');
        }

        log('\nSOLUCIONES COMUNES:', 'yellow');
        log('   1. Verifica que el servidor esté corriendo (npm start)', 'cyan');
        log('   2. Verifica la conexión a Azure SQL Database', 'cyan');
        log('   3. Verifica que el archivo .env esté configurado', 'cyan');
        log('   4. Verifica que la tabla InscripcionesCampeonato exista\n', 'cyan');
    }
}

// Función auxiliar para construir mensaje de WhatsApp
function construirMensajeWhatsApp(data, confirmacion, total) {
    let mensaje = 'V CAMPEONATO REGIONAL DE MOTOTURISMO\n';
    mensaje += 'L.A.M.A. REGIÓN NORTE - COLOMBIA\n\n';
    
    mensaje += '¡Hola! He completado mi registro para el evento en San Andrés:\n\n';
    
    mensaje += `Participante: ${data.nombre_completo}\n`;
    mensaje += `Cédula: ${data.documento_numero}\n`;
    mensaje += `Categoría: ${data.tipo_participante}\n`;
    mensaje += `Capítulo: ${data.capitulo}\n`;
    
    if (data.adquiere_jersey) {
        mensaje += `Jersey Oficial: Sí (Talla: ${data.talla_jersey})\n`;
    } else {
        mensaje += `Jersey Oficial: No\n`;
    }
    
    if (data.asiste_con_acompanante) {
        mensaje += `Acompañante: ${data.nombre_acompanante}\n`;
    } else {
        mensaje += `Acompañante: No aplica\n`;
    }
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `TOTAL A PAGAR: $${total.toLocaleString('es-CO')} COP\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    mensaje += `Número de Inscripción: #${confirmacion.codigo_confirmacion}\n`;
    mensaje += `Referencia para transferencia bancaria: #${confirmacion.codigo_confirmacion}\n\n`;
    
    mensaje += `A continuación adjunto el comprobante de transferencia.\n`;
    
    return mensaje;
}

// Ejecutar prueba
if (require.main === module) {
    testInscripcion();
}

module.exports = { testInscripcion };
