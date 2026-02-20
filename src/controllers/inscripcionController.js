/**
 * CAPA DE APLICACIÓN: Controlador de inscripciones
 * Maneja las peticiones HTTP y coordina con los servicios
 */

const InscripcionService = require('../services/inscripcionService');

class InscripcionController {
    /**
     * POST /api/register
     * Registra una nueva inscripción al evento
     * @param {Request} req - Objeto de petición Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async register(req, res) {
        try {
            // Los datos ya vienen validados por el middleware validateInscripcionMiddleware
            const inscripcionData = req.body;

            // Llamar al servicio de negocio
            const resultado = await InscripcionService.registrarInscripcion(inscripcionData);

            // Determinar código de estado HTTP según resultado
            if (resultado.success) {
                return res.status(201).json(resultado);
            } else {
                // Manejar códigos de error específicos
                const statusCode = resultado.codigo === 'DUPLICADO' ? 409 : 400;
                return res.status(statusCode).json(resultado);
            }
        } catch (error) {
            console.error('Error en InscripcionController.register:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor al procesar la inscripción',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/inscripciones
     * Obtiene todas las inscripciones
     * @param {Request} req - Objeto de petición Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async getAllInscripciones(req, res) {
        try {
            const resultado = await InscripcionService.obtenerTodasInscripciones();

            if (resultado.success) {
                return res.status(200).json(resultado);
            } else {
                return res.status(500).json(resultado);
            }
        } catch (error) {
            console.error('Error en InscripcionController.getAllInscripciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener inscripciones',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/estadisticas
     * Obtiene estadísticas de inscripciones
     * @param {Request} req - Objeto de petición Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async getEstadisticas(req, res) {
        try {
            const resultado = await InscripcionService.obtenerEstadisticas();

            if (resultado.success) {
                return res.status(200).json(resultado);
            } else {
                return res.status(500).json(resultado);
            }
        } catch (error) {
            console.error('Error en InscripcionController.getEstadisticas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/inscripciones/:documento
     * Busca una inscripción por documento
     * @param {Request} req - Objeto de petición Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async getByDocumento(req, res) {
        try {
            const { documento } = req.params;

            if (!documento) {
                return res.status(400).json({
                    success: false,
                    message: 'El documento es obligatorio'
                });
            }

            const resultado = await InscripcionService.buscarPorDocumento(documento);

            const statusCode = resultado.success ? 200 : 404;
            return res.status(statusCode).json(resultado);
        } catch (error) {
            console.error('Error en InscripcionController.getByDocumento:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al buscar inscripción',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * GET /api/health
     * Verifica el estado de la conexión a la base de datos
     * @param {Request} req - Objeto de petición Express
     * @param {Response} res - Objeto de respuesta Express
     */
    static async healthCheck(req, res) {
        try {
            const { isConnected } = require('../config/database');
            const connected = isConnected();

            return res.status(connected ? 200 : 503).json({
                success: connected,
                message: connected ? 'Servicio operativo' : 'Servicio no disponible',
                database: connected ? 'Conectado' : 'Desconectado',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(503).json({
                success: false,
                message: 'Error al verificar estado del servicio',
                error: error.message
            });
        }
    }
}

module.exports = InscripcionController;
