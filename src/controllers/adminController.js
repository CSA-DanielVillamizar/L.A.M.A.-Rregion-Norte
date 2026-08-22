/**
 * CAPA DE PRESENTACIÓN: Controlador de Administración
 * Maneja las peticiones HTTP para el panel administrativo
 */

const { InscripcionModel } = require('../models/inscripcionModel');
const capitulosService = require('../services/capitulosService');
const eventService = require('../services/eventService');
const serviciosPremiumService = require('../services/serviciosPremiumService');
const QrService = require('../services/qrService');
const { CapituloModel, CARGOS_OFICIALES } = require('../models/capituloModel');
const planillaAsistenciaService = require('../services/planillaAsistenciaService');
const pdfPlanillaService = require('../services/pdfPlanillaService');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');

class AdminController {
    /**
     * Muestra el dashboard administrativo
     * GET /admin/dashboard
     */
    static async showDashboard(req, res) {
        try {
            const inscripciones = await InscripcionModel.getAll();
            const stats = await InscripcionModel.getStats();
            const capitulos = capitulosService.getAllCapitulos();

            res.render('admin/dashboard', {
                title: 'Panel de Administración - L.A.M.A.',
                inscripciones,
                stats,
                capitulos,
                user: req.user
            });
        } catch (error) {
            logger.error('Error en AdminController.showDashboard', { error });
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error al cargar el dashboard',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todas las inscripciones (API protegida)
     * GET /api/admin/inscripciones
     */
    static async getAllInscripciones(req, res) {
        try {
            const inscripciones = await InscripcionModel.getAll();

            res.json({
                success: true,
                total: inscripciones.length,
                data: inscripciones
            });
        } catch (error) {
            logger.error('Error en AdminController.getAllInscripciones', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener inscripciones',
                error: error.message
            });
        }
    }

    /**
     * Actualiza el estado de validación de una inscripción
     * PUT /api/admin/inscripciones/:id/estado
     */
    static async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado_validacion } = req.body;

            // Validar estado
            const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];
            if (!estadosValidos.includes(estado_validacion)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado'
                });
            }

            const resultado = await InscripcionModel.updateEstadoValidacion(id, estado_validacion);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
            }

            // Al aprobar el pago se emite (o se reutiliza) el QR de check-in
            let qrToken = null;
            if (estado_validacion === 'Aprobado') {
                qrToken = await InscripcionModel.asignarQrToken(id);
            }

            res.json({
                success: true,
                message: `Estado actualizado a: ${estado_validacion}`,
                data: {
                    id: parseInt(id),
                    estado_validacion,
                    qr_token: qrToken
                }
            });
        } catch (error) {
            logger.error('Error en AdminController.actualizarEstado', { error });
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado',
                error: error.message
            });
        }
    }

    /**
     * Genera (o recupera) el QR de check-in de una inscripción aprobada
     * GET /admin/inscripciones/:id/qr
     */
    static async obtenerQrInscripcion(req, res) {
        try {
            const { id } = req.params;
            const inscripcion = await InscripcionModel.getById(id);

            if (!inscripcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
            }

            if (inscripcion.estado_validacion !== 'Aprobado') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se emite QR para inscripciones con pago Aprobado'
                });
            }

            const token = await InscripcionModel.asignarQrToken(id);
            const urlValidacion = QrService.construirUrlValidacion(req, token);
            const qrDataUrl = await QrService.generarImagenQrDataUrl(urlValidacion);

            res.json({
                success: true,
                data: {
                    id_inscripcion: Number(id),
                    nombre_completo: inscripcion.nombre_completo,
                    token,
                    url_validacion: urlValidacion,
                    qr_data_url: qrDataUrl,
                    checkin_realizado: Boolean(inscripcion.checkin_realizado),
                    checkin_fecha: inscripcion.checkin_fecha || null
                }
            });
        } catch (error) {
            logger.error('Error en AdminController.obtenerQrInscripcion', { error });
            res.status(500).json({
                success: false,
                message: 'Error al generar el QR de check-in'
            });
        }
    }

    /**
     * Obtiene estadísticas del evento (API protegida)
     * GET /api/admin/estadisticas
     */
    static async getEstadisticas(req, res) {
        try {
            const stats = await InscripcionModel.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Error en AdminController.getEstadisticas', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Elimina una inscripción (solo admin)
     * DELETE /api/admin/inscripciones/:id
     */
    static async eliminarInscripcion(req, res) {
        try {
            const { id } = req.params;

            const resultado = await InscripcionModel.deleteById(id);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Inscripción eliminada exitosamente'
            });
        } catch (error) {
            logger.error('Error en AdminController.eliminarInscripcion', { error });
            res.status(500).json({
                success: false,
                message: 'Error al eliminar inscripción',
                error: error.message
            });
        }
    }

    // ========================================
    // MÉTODOS PARA GESTIÓN DE EVENTOS
    // ========================================

    /**
     * Obtiene todos los eventos
     * GET /api/admin/eventos
     */
    static async getAllEventos(req, res) {
        try {
            const eventos = await eventService.getAllEvents();

            res.json({
                success: true,
                total: eventos.length,
                data: eventos
            });
        } catch (error) {
            logger.error('Error en AdminController.getAllEventos', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener eventos',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo evento
     * POST /api/admin/eventos
     */
    static async createEvento(req, res) {
        try {
            const nuevoEvento = await eventService.createEvent(req.body);

            res.status(201).json({
                success: true,
                message: 'Evento creado exitosamente',
                data: nuevoEvento
            });
        } catch (error) {
            logger.error('Error en AdminController.createEvento', { error });
            res.status(500).json({
                success: false,
                message: 'Error al crear evento',
                error: error.message
            });
        }
    }

    /**
     * Actualiza un evento existente
     * PUT /api/admin/eventos/:id
     */
    static async updateEvento(req, res) {
        try {
            const eventoActualizado = await eventService.updateEvent(req.params.id, req.body);

            if (!eventoActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Evento actualizado exitosamente',
                data: eventoActualizado
            });
        } catch (error) {
            logger.error('Error en AdminController.updateEvento', { error });
            res.status(500).json({
                success: false,
                message: 'Error al actualizar evento',
                error: error.message
            });
        }
    }

    /**
     * Elimina un evento
     * DELETE /api/admin/eventos/:id
     */
    static async deleteEvento(req, res) {
        try {
            const eliminado = await eventService.deleteEvent(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Evento eliminado exitosamente'
            });
        } catch (error) {
            logger.error('Error en AdminController.deleteEvento', { error });
            res.status(500).json({
                success: false,
                message: 'Error al eliminar evento',
                error: error.message
            });
        }
    }

    /**
     * Reordena eventos según IDs enviados
     * PUT /api/admin/eventos/reordenar
     */
    static async reorderEventos(req, res) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || !ids.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Debes enviar un arreglo de IDs para reordenar'
                });
            }

            const eventos = await eventService.reorderEvents(ids);

            res.json({
                success: true,
                message: 'Orden de eventos actualizado exitosamente',
                total: eventos.length,
                data: eventos
            });
        } catch (error) {
            logger.error('Error en AdminController.reorderEventos', { error });
            res.status(500).json({
                success: false,
                message: 'Error al reordenar eventos',
                error: error.message
            });
        }
    }

    // ========================================
    // MÉTODOS PARA GESTIÓN DE CAPÍTULOS
    // ========================================

    /**
     * Obtiene todos los capítulos
     * GET /api/admin/capitulos
     */
    static getAllCapitulos(req, res) {
        try {
            const capitulos = capitulosService.getAllCapitulos();
            const stats = capitulosService.getEstadisticas();

            res.json({
                success: true,
                total: capitulos.length,
                stats,
                data: capitulos
            });
        } catch (error) {
            logger.error('Error en AdminController.getAllCapitulos', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener capítulos',
                error: error.message
            });
        }
    }

    /**
     * Obtiene un capítulo por ID
     * GET /api/admin/capitulos/:id
     */
    static getCapituloById(req, res) {
        try {
            const capitulo = capitulosService.getCapituloById(req.params.id);

            if (!capitulo) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
            }

            res.json({
                success: true,
                data: capitulo
            });
        } catch (error) {
            logger.error('Error en AdminController.getCapituloById', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener capítulo',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo capítulo
     * POST /api/admin/capitulos
     */
    static createCapitulo(req, res) {
        try {
            const nuevoCapitulo = capitulosService.createCapitulo(req.body);

            res.status(201).json({
                success: true,
                message: 'Capítulo creado exitosamente',
                data: nuevoCapitulo
            });
        } catch (error) {
            logger.error('Error en AdminController.createCapitulo', { error });
            res.status(500).json({
                success: false,
                message: 'Error al crear capítulo',
                error: error.message
            });
        }
    }

    /**
     * Actualiza un capítulo existente
     * PUT /api/admin/capitulos/:id
     */
    static updateCapitulo(req, res) {
        try {
            const capituloActualizado = capitulosService.updateCapitulo(req.params.id, req.body);

            if (!capituloActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Capítulo actualizado exitosamente',
                data: capituloActualizado
            });
        } catch (error) {
            logger.error('Error en AdminController.updateCapitulo', { error });
            res.status(500).json({
                success: false,
                message: 'Error al actualizar capítulo',
                error: error.message
            });
        }
    }

    /**
     * Elimina un capítulo
     * DELETE /api/admin/capitulos/:id
     */
    static deleteCapitulo(req, res) {
        try {
            const eliminado = capitulosService.deleteCapitulo(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Capítulo eliminado exitosamente'
            });
        } catch (error) {
            logger.error('Error en AdminController.deleteCapitulo', { error });
            res.status(500).json({
                success: false,
                message: 'Error al eliminar capítulo',
                error: error.message
            });
        }
    }

    /**
     * Maneja la carga de imágenes de capítulos
     * POST /api/admin/capitulos/:id/imagen
     */
    static uploadCapituloImagen(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ninguna imagen'
                });
            }

            const imagePath = `/img/capitulos/${req.file.filename}`;
            const capituloActualizado = capitulosService.updateCapitulo(req.params.id, {
                imagen: imagePath
            });

            if (!capituloActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Capítulo no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Imagen cargada exitosamente',
                data: {
                    imagen: imagePath
                }
            });
        } catch (error) {
            logger.error('Error en AdminController.uploadCapituloImagen', { error });
            res.status(500).json({
                success: false,
                message: 'Error al cargar imagen',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todos los anuncios del ticker (endpoint público)
     * GET /api/ticker
     * Sin autenticación requerida
     */
    static async getTickerPublic(req, res) {
        try {
            const tickerService = require('../services/tickerService');
            const announcements = await tickerService.getAllAnnouncements();

            res.json({
                success: true,
                total: announcements.length,
                data: announcements
            });
        } catch (error) {
            logger.error('Error en getTickerPublic', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener anuncios del ticker',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todos los anuncios del ticker (endpoint admin)
     * GET /admin/ticker
     */
    static async getAllTicker(req, res) {
        try {
            const tickerService = require('../services/tickerService');
            const announcements = await tickerService.getAllAnnouncements();

            res.json({
                success: true,
                total: announcements.length,
                data: announcements
            });
        } catch (error) {
            logger.error('Error en getAllTicker', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener anuncios del ticker',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo anuncio en el ticker
     * POST /api/admin/ticker
     */
    static async createTicker(req, res) {
        try {
            const { title, message, type, icon, color } = req.body;

            if (!title || !message || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: title, message, type'
                });
            }

            const tickerService = require('../services/tickerService');
            const announcement = await tickerService.createAnnouncement({
                title,
                message,
                type,
                icon: icon || 'info',
                color: color || '#00F5FF'
            });

            res.json({
                success: true,
                message: 'Anuncio creado exitosamente',
                data: announcement
            });
        } catch (error) {
            logger.error('Error en createTicker', { error });
            res.status(500).json({
                success: false,
                message: 'Error al crear anuncio',
                error: error.message
            });
        }
    }

    /**
     * Actualiza un anuncio del ticker
     * PUT /api/admin/ticker/:id
     */
    static async updateTicker(req, res) {
        try {
            const { id } = req.params;
            const { title, message, type, icon, color } = req.body;
            const idAnuncio = parseInt(id, 10);

            if (Number.isNaN(idAnuncio)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de anuncio inválido'
                });
            }

            const tickerService = require('../services/tickerService');
            const announcement = await tickerService.updateAnnouncement(idAnuncio, {
                title,
                message,
                type,
                icon,
                color
            });

            if (!announcement) {
                return res.status(404).json({
                    success: false,
                    message: 'Anuncio no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Anuncio actualizado exitosamente',
                data: announcement
            });
        } catch (error) {
            logger.error('Error en updateTicker', { error });
            res.status(500).json({
                success: false,
                message: 'Error al actualizar anuncio',
                error: error.message
            });
        }
    }

    /**
     * Elimina un anuncio del ticker
     * DELETE /api/admin/ticker/:id
     */
    static async deleteTicker(req, res) {
        try {
            const { id } = req.params;
            const idAnuncio = parseInt(id, 10);

            if (Number.isNaN(idAnuncio)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de anuncio inválido'
                });
            }

            const tickerService = require('../services/tickerService');
            const deleted = await tickerService.deleteAnnouncement(idAnuncio);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Anuncio no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Anuncio eliminado exitosamente'
            });
        } catch (error) {
            logger.error('Error en deleteTicker', { error });
            res.status(500).json({
                success: false,
                message: 'Error al eliminar anuncio',
                error: error.message
            });
        }
    }

    /**
     * Reordena anuncios del ticker
     * PUT /api/admin/ticker/reordenar
     */
    static async reorderTicker(req, res) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || !ids.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Debes enviar un arreglo de IDs para reordenar'
                });
            }

            const tickerService = require('../services/tickerService');
            const anuncios = await tickerService.reorderAnnouncements(ids);

            res.json({
                success: true,
                message: 'Orden de anuncios actualizado exitosamente',
                total: anuncios.length,
                data: anuncios
            });
        } catch (error) {
            logger.error('Error en reorderTicker', { error });
            res.status(500).json({
                success: false,
                message: 'Error al reordenar anuncios',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todos los servicios premium (API pública)
     * GET /api/servicios
     */
    static async getServiciosPublic(req, res) {
        try {
            const servicios = serviciosPremiumService.getAllServicios();

            res.json({
                success: true,
                data: servicios
            });
        } catch (error) {
            logger.error('Error en getServiciosPublic', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener servicios',
                error: error.message
            });
        }
    }

    /**
     * Obtiene todos los servicios premium (API protegida)
     * GET /admin/api/servicios
     */
    static async getAllServicios(req, res) {
        try {
            const servicios = serviciosPremiumService.getAllServicios();

            res.json({
                success: true,
                total: servicios.length,
                data: servicios
            });
        } catch (error) {
            logger.error('Error en getAllServicios', { error });
            res.status(500).json({
                success: false,
                message: 'Error al obtener servicios',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo servicio premium
     * POST /admin/api/servicios
     */
    static async createServicio(req, res) {
        try {
            const { nombre, descripcion, precio, disponible, categoria, limite_reservas } = req.body;

            // Validaciones
            if (!nombre || !descripcion || !precio || disponible === undefined || !categoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos'
                });
            }

            const nuevoServicio = serviciosPremiumService.createServicio({
                nombre,
                descripcion,
                precio: parseInt(precio),
                disponible: parseInt(disponible),
                categoria,
                limite_reservas: limite_reservas ? parseInt(limite_reservas) : null
            });

            res.status(201).json({
                success: true,
                message: 'Servicio creado exitosamente',
                data: nuevoServicio
            });
        } catch (error) {
            logger.error('Error en createServicio', { error });
            res.status(500).json({
                success: false,
                message: 'Error al crear servicio',
                error: error.message
            });
        }
    }

    /**
     * Actualiza un servicio premium
     * PUT /admin/api/servicios/:id
     */
    static async updateServicio(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, disponible, categoria, limite_reservas } = req.body;

            const servicioActualizado = serviciosPremiumService.updateServicio(parseInt(id), {
                nombre,
                descripcion,
                precio: precio ? parseInt(precio) : undefined,
                disponible: disponible !== undefined ? parseInt(disponible) : undefined,
                categoria,
                limite_reservas: limite_reservas ? parseInt(limite_reservas) : undefined
            });

            if (!servicioActualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Servicio actualizado exitosamente',
                data: servicioActualizado
            });
        } catch (error) {
            logger.error('Error en updateServicio', { error });
            res.status(500).json({
                success: false,
                message: 'Error al actualizar servicio',
                error: error.message
            });
        }
    }

    /**
     * Elimina un servicio premium
     * DELETE /admin/api/servicios/:id
     */
    static async deleteServicio(req, res) {
        try {
            const { id } = req.params;

            const resultado = serviciosPremiumService.deleteServicio(parseInt(id));

            if (!resultado) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Servicio eliminado exitosamente',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            logger.error('Error en deleteServicio', { error });
            res.status(500).json({
                success: false,
                message: 'Error al eliminar servicio',
                error: error.message
            });
        }
    }

    /**
     * Lista históricos de formularios PDF con filtros opcionales
     * GET /admin/pdf-formularios?documento=...&fechaDesde=...&fechaHasta=...&limite=100
     */
    static async getHistorialFormulariosPdf(req, res) {
        try {
            const { documento, fechaDesde, fechaHasta, limite } = req.query;
            const pdfRegistroStorageService = require('../services/pdfRegistroStorageService');

            const registros = await pdfRegistroStorageService.listarRegistros({
                documento,
                fechaDesde,
                fechaHasta,
                limite
            });

            const registrosEnriquecidos = registros.map((registro) => ({
                ...registro,
                tieneMatriculaMoto: Boolean(registro.nombreArchivoMatricula),
                tieneLicenciaConduccion: Boolean(registro.nombreArchivoLicencia),
                urlDescargaPdf: `/admin/pdf-formularios/${registro.idRegistroPdf}/archivo`,
                urlDescargaMatricula: `/admin/pdf-formularios/${registro.idRegistroPdf}/matricula`,
                urlDescargaLicencia: `/admin/pdf-formularios/${registro.idRegistroPdf}/licencia`
            }));

            res.json({
                success: true,
                total: registrosEnriquecidos.length,
                filtros: {
                    documento: documento || null,
                    fechaDesde: fechaDesde || null,
                    fechaHasta: fechaHasta || null,
                    limite: limite || null
                },
                data: registrosEnriquecidos
            });
        } catch (error) {
            logger.error('Error en AdminController.getHistorialFormulariosPdf', { error });
            res.status(500).json({
                success: false,
                message: 'Error al consultar el historial de formularios PDF',
                error: error.message
            });
        }
    }

    /**
     * Descarga un formulario PDF almacenado por ID de registro
     * GET /admin/pdf-formularios/:id/archivo
     */
    static async descargarFormularioPdf(req, res) {
        try {
            const idRegistroPdf = parseInt(req.params.id, 10);

            if (Number.isNaN(idRegistroPdf)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de registro PDF inválido'
                });
            }

            const pdfRegistroStorageService = require('../services/pdfRegistroStorageService');
            const registro = await pdfRegistroStorageService.obtenerRegistroPorId(idRegistroPdf);

            if (!registro) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro PDF no encontrado'
                });
            }

            const nombreArchivo = registro.nombreArchivo || `Formulario-Nacional-${idRegistroPdf}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
            res.setHeader('X-Registro-Pdf-Id', String(registro.idRegistroPdf));
            res.setHeader('X-Registro-Pdf-Documento', String(registro.documento || ''));
            return res.status(200).send(registro.contenidoPdf);
        } catch (error) {
            logger.error('Error en AdminController.descargarFormularioPdf', { error });
            res.status(500).json({
                success: false,
                message: 'Error al descargar el formulario PDF',
                error: error.message
            });
        }
    }

    /**
     * Descarga la matrícula de moto adjunta por ID de registro
     * GET /admin/pdf-formularios/:id/matricula
     */
    static async descargarMatriculaMoto(req, res) {
        return AdminController.descargarAdjuntoTransito(req, res, {
            tipoAdjunto: 'matricula',
            etiqueta: 'matrícula de moto'
        });
    }

    /**
     * Descarga la licencia de conducción adjunta por ID de registro
     * GET /admin/pdf-formularios/:id/licencia
     */
    static async descargarLicenciaConduccion(req, res) {
        return AdminController.descargarAdjuntoTransito(req, res, {
            tipoAdjunto: 'licencia',
            etiqueta: 'licencia de conducción'
        });
    }

    /**
     * Descarga adjuntos de tránsito del registro PDF
     */
    static async descargarAdjuntoTransito(req, res, { tipoAdjunto, etiqueta }) {
        try {
            const idRegistroPdf = parseInt(req.params.id, 10);

            if (Number.isNaN(idRegistroPdf)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de registro PDF inválido'
                });
            }

            const pdfRegistroStorageService = require('../services/pdfRegistroStorageService');
            const registroAdjunto = await pdfRegistroStorageService.obtenerAdjuntoPorIdYTipo(idRegistroPdf, tipoAdjunto);

            if (!registroAdjunto) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró ${etiqueta} para este registro`
                });
            }

            const nombreArchivo = registroAdjunto.nombreArchivo || `${tipoAdjunto}-${idRegistroPdf}.bin`;
            const mimeTipo = registroAdjunto.mimeTipo || 'application/octet-stream';

            res.setHeader('Content-Type', mimeTipo);
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
            res.setHeader('X-Registro-Pdf-Id', String(registroAdjunto.idRegistroPdf));
            res.setHeader('X-Registro-Pdf-Documento', String(registroAdjunto.documento || ''));
            return res.status(200).send(registroAdjunto.contenidoAdjunto);
        } catch (error) {
            logger.error('Error en AdminController.descargarAdjuntoTransito', { error });
            return res.status(500).json({
                success: false,
                message: `Error al descargar ${etiqueta}`,
                error: error.message
            });
        }
    }

    /**
     * Lista todos los capítulos con datos operativos guardados (coordenadas + oficiales)
     * GET /admin/api/capitulos
     */
    static async listarCapitulosDatos(req, res) {
        try {
            const capitulos = await CapituloModel.getAll();
            res.json({ success: true, data: capitulos });
        } catch (error) {
            logger.error('Error en AdminController.listarCapitulosDatos', { error });
            res.status(500).json({ success: false, message: 'Error al listar capítulos' });
        }
    }

    /**
     * Obtiene un capítulo con su roster de oficiales
     * GET /admin/api/capitulos/detalle?nombre=...&pais=...
     */
    static async obtenerCapituloDatos(req, res) {
        try {
            const { nombre, pais } = req.query;
            if (!nombre || !pais) {
                return res.status(400).json({ success: false, message: 'nombre y pais son obligatorios' });
            }

            const capitulo = await CapituloModel.getByNombrePais(nombre, pais);
            res.json({
                success: true,
                data: capitulo || { nombre, pais, latitud: null, longitud: null, oficiales: CARGOS_OFICIALES.map((cargo) => ({ cargo, nombre_completo: null, documento_numero: null })) }
            });
        } catch (error) {
            logger.error('Error en AdminController.obtenerCapituloDatos', { error });
            res.status(500).json({ success: false, message: 'Error al obtener el capítulo' });
        }
    }

    /**
     * Guarda (crea o actualiza) coordenadas y oficiales de un capítulo
     * POST /admin/api/capitulos
     */
    static async guardarCapituloDatos(req, res) {
        try {
            const { nombre, pais, latitud, longitud, oficiales } = req.body;
            if (!nombre || !pais) {
                return res.status(400).json({ success: false, message: 'nombre y pais son obligatorios' });
            }

            const idCapitulo = await CapituloModel.upsert({
                nombre,
                pais,
                latitud: Number.isFinite(parseFloat(latitud)) ? parseFloat(latitud) : null,
                longitud: Number.isFinite(parseFloat(longitud)) ? parseFloat(longitud) : null
            });

            if (Array.isArray(oficiales)) {
                await CapituloModel.guardarOficiales(idCapitulo, oficiales);
            }

            res.json({ success: true, message: 'Capítulo guardado correctamente', data: { id_capitulo: idCapitulo } });
        } catch (error) {
            logger.error('Error en AdminController.guardarCapituloDatos', { error });
            res.status(500).json({ success: false, message: 'Error al guardar el capítulo' });
        }
    }

    /**
     * Lista los capítulos con asistencia validada (check-in) en un evento,
     * para el panel de generación de planillas.
     * GET /admin/api/eventos/:id/capitulos-asistencia
     */
    static async listarCapitulosConAsistenciaEvento(req, res) {
        try {
            const capitulos = await planillaAsistenciaService.listarCapitulosConAsistencia(req.params.id);
            res.json({ success: true, data: capitulos });
        } catch (error) {
            logger.error('Error en AdminController.listarCapitulosConAsistenciaEvento', { error });
            res.status(500).json({ success: false, message: 'Error al listar capítulos con asistencia' });
        }
    }

    /**
     * Genera y descarga el PDF de la planilla de asistencia de un capítulo
     * en un evento.
     * GET /admin/eventos/:id/planilla/:capitulo/pdf?pais=...
     */
    static async descargarPlanillaPdf(req, res) {
        try {
            const { id: eventoId, capitulo } = req.params;
            const { pais } = req.query;

            const datos = await planillaAsistenciaService.generarDatosPlanilla({
                eventoId,
                capitulo: decodeURIComponent(capitulo),
                pais
            });
            const pdfBuffer = await pdfPlanillaService.generarPdfPlanilla(datos);

            const nombreArchivo = `Planilla-${datos.capitulo}-${eventoId}.pdf`.replace(/[^\w\-.]+/g, '_');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
            return res.status(200).send(pdfBuffer);
        } catch (error) {
            logger.error('Error en AdminController.descargarPlanillaPdf', { error });
            return res.status(500).json({
                success: false,
                message: error.message || 'Error al generar la planilla'
            });
        }
    }

}

// Configuración de Multer para carga de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/capitulos/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'capitulo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

AdminController.uploadMiddleware = upload.single('imagen');

module.exports = AdminController;
