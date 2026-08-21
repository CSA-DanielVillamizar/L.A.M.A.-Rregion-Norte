/**
 * CAPA DE APLICACIÓN: Controlador de eventos
 * Gestiona la lógica relacionada con eventos y registros
 */

const eventService = require('../services/eventService');
const { InscripcionModel } = require('../models/inscripcionModel');
const ContenidoTuristicoModel = require('../models/contenidoTuristicoModel');
const multer = require('multer');
const { esParPaisCapituloValido } = require('../data/paisesCapitulos');
const { validateInscripcion } = require('../validators/inscripcionValidator');
const logger = require('../utils/logger');

const COMPROBANTE_MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

const comprobanteUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (COMPROBANTE_MIME_PERMITIDOS.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Formato de comprobante no permitido. Usa PDF, JPG o PNG.'));
    }
});

// Middleware de subida del comprobante de pago (almacenado en memoria y persistido en Azure SQL)
exports.uploadComprobanteMiddleware = comprobanteUpload.single('comprobante');

/**
 * Parsea de forma segura un campo JSON recibido como texto (multipart/form-data
 * serializa todos los campos como string, incluyendo arreglos/objetos).
 */
function parsearArregloJsonSeguro(valor) {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];
    try {
        const parsed = JSON.parse(valor);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function parsearBooleanoFormData(valor) {
    return String(valor).trim().toLowerCase() === 'true';
}

const TIPOS_PARTICIPANTE_VALIDOS = [
    'DAMA L.A.M.A.',
    'FULL COLOR MEMBER',
    'ROCKET PROSPECT',
    'PROSPECT',
    'ESPOSA (o)',
    'CONYUGUE',
    'PAREJA',
    'HIJA (o)',
    'INVITADA (O)'
];

function normalizarTipoParticipante(categoria) {
    const categoriaNormalizada = String(categoria || '').trim();
    if (TIPOS_PARTICIPANTE_VALIDOS.includes(categoriaNormalizada)) {
        return categoriaNormalizada;
    }

    const texto = categoriaNormalizada.toLowerCase();
    if (texto.includes('dama')) return 'DAMA L.A.M.A.';
    if (texto.includes('full color')) return 'FULL COLOR MEMBER';
    if (texto.includes('rocket')) return 'ROCKET PROSPECT';
    if (texto.includes('prospect') || texto.includes('prosp')) return 'PROSPECT';
    if (texto.includes('esposa')) return 'ESPOSA (o)';
    if (texto.includes('conyuge')) return 'CONYUGUE';
    if (texto.includes('pareja')) return 'PAREJA';
    if (texto.includes('hija') || texto.includes('hijo')) return 'HIJA (o)';
    return 'INVITADA (O)';
}

/**
 * Obtiene todos los eventos disponibles
 */
exports.getAllEvents = async (req, res) => {
    try {
        // eventService.getAllEvents() ya filtra por activo = 1; el admin
        // controla qué eventos son públicos marcándolos como inactivos.
        const events = await eventService.getAllEvents();
        res.render('events/list', {
            title: 'Eventos L.A.M.A.',
            events
        });
    } catch (error) {
        logger.error('Error en getAllEvents', { error });
        res.status(500).render('error', {
            message: 'Error al cargar eventos'
        });
    }
};

/**
 * Obtiene detalle de un evento específico
 */
exports.getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await eventService.getEventById(eventId);

        if (!event) {
            return res.status(404).render('404', {
                title: 'Evento No Encontrado',
                message: 'El evento que buscas no existe'
            });
        }

        const [hoteles, destinosTuristicos] = await Promise.all([
            ContenidoTuristicoModel.getHoteles({ eventoId: eventId, soloActivos: true }),
            ContenidoTuristicoModel.getDestinos({ eventoId: eventId, soloActivos: true })
        ]);

        res.render('events/detail', {
            title: event.nombre,
            event,
            hoteles,
            destinosTuristicos
        });
    } catch (error) {
        logger.error('Error en getEventById', { error });
        res.status(500).render('error', {
            message: 'Error al cargar el evento'
        });
    }
};

/**
 * Procesa el registro a un evento
 */
exports.registerToEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const evento = await eventService.getEventById(eventId);

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        if (evento.lleno) {
            return res.status(400).json({
                success: false,
                message: 'Evento lleno. No hay cupos disponibles'
            });
        }

        const {
            nombre,
            documento,
            eps,
            pais,
            capitulo,
            directivo,
            ambito,
            cargo,
            fecha_llegada,
            condicion_medica,
            jersey,
            talla,
            acompanante,
            emergencia_nombre,
            emergencia_telefono,
            email,
            fecha_nacimiento
        } = req.body;

        const paisNormalizado = String(pais || '').trim();
        const capituloNormalizado = String(capitulo || '').trim();
        const acompanantes = parsearArregloJsonSeguro(req.body.acompanantes);

        const { error: errorValidacion } = validateInscripcion({
            categoria: req.body.categoria,
            nombre,
            documento,
            eps,
            email,
            fecha_nacimiento,
            emergencia_nombre,
            emergencia_telefono,
            pais: paisNormalizado,
            capitulo: capituloNormalizado,
            directivo,
            ambito,
            cargo,
            fecha_llegada,
            condicion_medica,
            jersey: parsearBooleanoFormData(jersey),
            talla,
            acompanante: parsearBooleanoFormData(acompanante),
            acompanantes
        });

        if (errorValidacion) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación en los datos enviados',
                errors: errorValidacion.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        const existente = await InscripcionModel.findByDocumento(String(documento).trim());
        if (existente) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un registro para este documento'
            });
        }

        const serviciosPrincipal = parsearArregloJsonSeguro(req.body.servicios_principal);
        const serviciosAcompanantes = parsearArregloJsonSeguro(req.body.servicios_acompanantes);
        const totalServicios = Number(req.body.total_servicios || 0);
        const merchandising = parsearArregloJsonSeguro(req.body.merchandising);
        const totalMerchandising = Number(req.body.total_merchandising || 0);

        const inscripcionPayload = {
            tipo_participante: normalizarTipoParticipante(req.body.categoria),
            nombre_completo: nombre,
            documento_numero: String(documento).trim(),
            eps: eps || 'No especificada',
            emergencia_nombre: emergencia_nombre || 'No especificado',
            emergencia_telefono: emergencia_telefono || 'No especificado',
            email: String(email).trim(),
            fecha_nacimiento,
            pais: paisNormalizado,
            capitulo: capituloNormalizado,
            cargo_directivo: String(directivo || '').toLowerCase() === 'sí' || String(directivo || '').toLowerCase() === 'si'
                ? [cargo, ambito].filter(Boolean).join(' - ').slice(0, 150) || 'Directivo'
                : null,
            fecha_llegada_isla: fecha_llegada || new Date().toISOString().split('T')[0],
            condicion_medica: condicion_medica || null,
            adquiere_jersey: parsearBooleanoFormData(jersey),
            talla_jersey: talla || null,
            asiste_con_acompanante: parsearBooleanoFormData(acompanante),
            nombre_acompanante: acompanantes.length > 0 ? (acompanantes[0].nombre || 'Acompañante') : null,
            evento_id: eventId,
            origen_registro: 'registro-campeonato',
            acompanantes,
            servicios_principal: serviciosPrincipal,
            servicios_acompanantes: serviciosAcompanantes,
            total_servicios: Number.isFinite(totalServicios) ? totalServicios : 0,
            merchandising,
            total_merchandising: Number.isFinite(totalMerchandising) ? totalMerchandising : 0,
            estado_validacion: 'Pendiente',
            comprobante_nombre_archivo: req.file ? req.file.originalname : null,
            comprobante_mime: req.file ? req.file.mimetype : null,
            comprobante_tamano_bytes: req.file ? req.file.size : null,
            comprobante_contenido: req.file ? req.file.buffer : null
        };

        const result = await InscripcionModel.create(inscripcionPayload);

        await eventService.registerParticipant(eventId, {
            nombre,
            documento,
            capitulo: capituloNormalizado
        });

        res.json({
            success: true,
            message: 'Registro exitoso',
            data: {
                id_registro: result.id,
                fecha_registro: result.fecha_registro
            }
        });
    } catch (error) {
        logger.error('Error en registerToEvent', { error });
        res.status(500).json({
            success: false,
            message: 'Error al procesar el registro'
        });
    }
};
