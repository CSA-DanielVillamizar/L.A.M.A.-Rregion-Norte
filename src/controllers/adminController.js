/**
 * CAPA DE PRESENTACIÓN: Controlador de Administración
 * Maneja las peticiones HTTP para el panel administrativo
 */

const { InscripcionModel } = require('../models/inscripcionModel');
const capitulosService = require('../services/capitulosService');
const eventService = require('../services/eventService');
const serviciosPremiumService = require('../services/serviciosPremiumService');
const RegistroCampeonatoSyncService = require('../services/registroCampeonatoSyncService');
const multer = require('multer');
const path = require('path');

class AdminController {
    /**
     * Muestra el dashboard administrativo
     * GET /admin/dashboard
     */
    static async showDashboard(req, res) {
        try {
            await RegistroCampeonatoSyncService.sincronizarRegistrosCampeonatoAInscripciones('vnorte-2026');
            const inscripciones = await InscripcionModel.getAll();
            const stats = await InscripcionModel.getStats();

            res.render('admin/dashboard', {
                title: 'Panel de Administración - L.A.M.A.',
                inscripciones,
                stats,
                user: req.user,
                apiKey: process.env.API_KEY || ''
            });
        } catch (error) {
            console.error('Error en AdminController.showDashboard:', error);
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
            await RegistroCampeonatoSyncService.sincronizarRegistrosCampeonatoAInscripciones('vnorte-2026');
            const inscripciones = await InscripcionModel.getAll();

            res.json({
                success: true,
                total: inscripciones.length,
                data: inscripciones
            });
        } catch (error) {
            console.error('Error en AdminController.getAllInscripciones:', error);
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

            res.json({
                success: true,
                message: `Estado actualizado a: ${estado_validacion}`,
                data: {
                    id: parseInt(id),
                    estado_validacion
                }
            });
        } catch (error) {
            console.error('Error en AdminController.actualizarEstado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado',
                error: error.message
            });
        }
    }

    /**
     * Obtiene estadísticas del evento (API protegida)
     * GET /api/admin/estadisticas
     */
    static async getEstadisticas(req, res) {
        try {
            await RegistroCampeonatoSyncService.sincronizarRegistrosCampeonatoAInscripciones('vnorte-2026');
            const stats = await InscripcionModel.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error en AdminController.getEstadisticas:', error);
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
            console.error('Error en AdminController.eliminarInscripcion:', error);
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
            console.error('Error en AdminController.getAllEventos:', error);
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
            console.error('Error en AdminController.createEvento:', error);
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
            console.error('Error en AdminController.updateEvento:', error);
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
            console.error('Error en AdminController.deleteEvento:', error);
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
            console.error('Error en AdminController.reorderEventos:', error);
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
            console.error('Error en AdminController.getAllCapitulos:', error);
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
            console.error('Error en AdminController.getCapituloById:', error);
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
            console.error('Error en AdminController.createCapitulo:', error);
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
            console.error('Error en AdminController.updateCapitulo:', error);
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
            console.error('Error en AdminController.deleteCapitulo:', error);
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
            console.error('Error en AdminController.uploadCapituloImagen:', error);
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
            console.error('Error en getTickerPublic:', error);
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
            console.error('Error en getAllTicker:', error);
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
            console.error('Error en createTicker:', error);
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
            console.error('Error en updateTicker:', error);
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
            console.error('Error en deleteTicker:', error);
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
            console.error('Error en reorderTicker:', error);
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
            console.error('Error en getServiciosPublic:', error);
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
            console.error('Error en getAllServicios:', error);
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
            console.error('Error en createServicio:', error);
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
            console.error('Error en updateServicio:', error);
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
            console.error('Error en deleteServicio:', error);
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
            console.error('Error en AdminController.getHistorialFormulariosPdf:', error);
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
            console.error('Error en AdminController.descargarFormularioPdf:', error);
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
            console.error('Error en AdminController.descargarAdjuntoTransito:', error);
            return res.status(500).json({
                success: false,
                message: `Error al descargar ${etiqueta}`,
                error: error.message
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
