/**
 * CAPA DE DOMINIO: Servicio de inscripciones
 * Contiene la lógica de negocio para gestionar inscripciones
 */

const { InscripcionModel } = require('../models/inscripcionModel');

class InscripcionService {
    /**
     * Registra una nueva inscripción
     * Implementa reglas de negocio y validaciones adicionales
     * @param {Object} inscripcionData - Datos de la inscripción
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async registrarInscripcion(inscripcionData) {
        try {
            // Regla de negocio: Verificar si ya existe una inscripción con ese documento
            const existente = await InscripcionModel.findByDocumento(inscripcionData.documento_numero);
            
            if (existente) {
                return {
                    success: false,
                    message: 'Ya existe una inscripción registrada con este documento',
                    codigo: 'DUPLICADO'
                };
            }

            // Regla de negocio: Si no adquiere jersey, limpiar talla
            if (!inscripcionData.adquiere_jersey) {
                inscripcionData.talla_jersey = null;
            }

            // Regla de negocio: Si no asiste acompañante, limpiar nombre
            if (!inscripcionData.asiste_con_acompanante) {
                inscripcionData.nombre_acompanante = null;
            }

            // Crear la inscripción
            const resultado = await InscripcionModel.create(inscripcionData);

            // Usar el ID numérico como código de confirmación para referencia bancaria
            const codigoConfirmacion = resultado.id;

            return {
                success: true,
                message: 'Inscripción registrada exitosamente',
                data: {
                    id: resultado.id,
                    codigo_confirmacion: codigoConfirmacion,
                    fecha_registro: resultado.fecha_registro,
                    nombre: inscripcionData.nombre_completo,
                    capitulo: inscripcionData.capitulo
                }
            };
        } catch (error) {
            console.error('Error en InscripcionService.registrarInscripcion:', error);
            
            // Manejo de errores específicos de SQL
            if (error.number === 2627 || error.number === 2601) {
                return {
                    success: false,
                    message: 'Registro duplicado detectado',
                    codigo: 'SQL_DUPLICADO'
                };
            }

            return {
                success: false,
                message: 'Error al procesar la inscripción',
                codigo: 'ERROR_INTERNO',
                error: error.message
            };
        }
    }

    /**
     * Obtiene todas las inscripciones
     * @returns {Promise<Array>} Lista de inscripciones
     */
    static async obtenerTodasInscripciones() {
        try {
            const inscripciones = await InscripcionModel.getAll();
            return {
                success: true,
                data: inscripciones,
                total: inscripciones.length
            };
        } catch (error) {
            console.error('Error en InscripcionService.obtenerTodasInscripciones:', error);
            return {
                success: false,
                message: 'Error al obtener inscripciones',
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas de inscripciones
     * @returns {Promise<Object>} Estadísticas
     */
    static async obtenerEstadisticas() {
        try {
            const stats = await InscripcionModel.getStats();
            
            // Calcular métricas adicionales
            const totalPersonas = parseInt(stats.total_inscripciones) + parseInt(stats.total_acompanantes);
            
            return {
                success: true,
                data: {
                    ...stats,
                    total_personas: totalPersonas,
                    porcentaje_jerseys: stats.total_inscripciones > 0 
                        ? Math.round((stats.total_jerseys / stats.total_inscripciones) * 100) 
                        : 0
                }
            };
        } catch (error) {
            console.error('Error en InscripcionService.obtenerEstadisticas:', error);
            return {
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            };
        }
    }

    /**
     * Busca inscripción por documento
     * @param {string} documento - Número de documento
     * @returns {Promise<Object>} Inscripción encontrada
     */
    static async buscarPorDocumento(documento) {
        try {
            const inscripcion = await InscripcionModel.findByDocumento(documento);
            
            if (!inscripcion) {
                return {
                    success: false,
                    message: 'No se encontró inscripción con ese documento',
                    codigo: 'NO_ENCONTRADO'
                };
            }

            return {
                success: true,
                data: inscripcion
            };
        } catch (error) {
            console.error('Error en InscripcionService.buscarPorDocumento:', error);
            return {
                success: false,
                message: 'Error al buscar inscripción',
                error: error.message
            };
        }
    }
}

module.exports = InscripcionService;
