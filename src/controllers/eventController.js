/**
 * CAPA DE APLICACIÓN: Controlador de eventos
 * Gestiona la lógica relacionada con eventos y registros
 */

const eventService = require('../services/eventService');
const { InscripcionModel } = require('../models/inscripcionModel');

const MAPA_CAPITULOS = {
    'Barranquilla (Atlántico)': 'Barranquilla',
    'Bucaramanga (Santander)': 'Bucaramanga',
    'Cartagena (Bolívar)': 'Cartagena',
    'Cúcuta (Norte de Santander)': 'Cúcuta',
    'Floridablanca (Santander)': 'Floridablanca',
    'Medellín (Antioquia)': 'Medellín',
    'Puerto Colombia (Atlántico)': 'Puerto Colombia',
    'Valle de Aburrá (Antioquia)': 'Valle Aburrá',
    'Zenú (Sucre - Córdoba)': 'Zenu'
};

const TIPOS_PARTICIPANTE_VALIDOS = [
    'DAMA L.A.M.A.',
    'FULL COLOR MEMBER',
    'ROCKET PROSPECT',
    'PROSPECT',
    'ESPOSA (a)',
    'CONYUGUE',
    'PAREJA',
    'HIJA (o)',
    'INVITADA (O)'
];

function normalizarCapitulo(capitulo) {
    if (!capitulo) return 'Otros';
    return MAPA_CAPITULOS[capitulo] || capitulo;
}

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
    if (texto.includes('esposa')) return 'ESPOSA (a)';
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
        const events = await eventService.getAllEvents();
        res.render('events/list', {
            title: 'Eventos L.A.M.A.',
            events
        });
    } catch (error) {
        console.error('Error en getAllEvents:', error);
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

        res.render('events/detail', {
            title: event.nombre,
            event
        });
    } catch (error) {
        console.error('Error en getEventById:', error);
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
            emergencia_nombre,
            emergencia_telefono,
            capitulo,
            directivo,
            ambito,
            cargo,
            fecha_llegada,
            condicion_medica,
            jersey,
            talla,
            acompanante,
            acompanantes,
            servicios_principal,
            servicios_acompanantes,
            total_servicios
        } = req.body;

        if (!nombre || !documento) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios (nombre y documento)'
            });
        }

        const existente = await InscripcionModel.findByDocumento(String(documento).trim());
        if (existente) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un registro para este documento'
            });
        }

        const capituloNormalizado = normalizarCapitulo(capitulo);
        const capituloValido = ['Barranquilla', 'Bucaramanga', 'Cartagena', 'Cúcuta', 'Floridablanca', 'Medellín', 'Puerto Colombia', 'Valle Aburrá', 'Zenu'].includes(capituloNormalizado);

        const inscripcionPayload = {
            tipo_participante: normalizarTipoParticipante(req.body.categoria),
            nombre_completo: nombre,
            documento_numero: String(documento).trim(),
            eps: eps || 'No especificada',
            emergencia_nombre: emergencia_nombre || 'No especificado',
            emergencia_telefono: emergencia_telefono || 'No especificado',
            capitulo: capituloValido ? capituloNormalizado : 'Otros',
            capitulo_otro: capituloValido ? null : String(capitulo || '').slice(0, 100),
            cargo_directivo: String(directivo || '').toLowerCase() === 'sí' || String(directivo || '').toLowerCase() === 'si'
                ? [cargo, ambito].filter(Boolean).join(' - ').slice(0, 150) || 'Directivo'
                : null,
            fecha_llegada_isla: fecha_llegada || new Date().toISOString().split('T')[0],
            condicion_medica: condicion_medica || null,
            adquiere_jersey: Boolean(jersey),
            talla_jersey: talla || null,
            asiste_con_acompanante: Boolean(acompanante),
            nombre_acompanante: Array.isArray(acompanantes) && acompanantes.length > 0
                ? (acompanantes[0].nombre || 'Acompañante')
                : null,
            evento_id: eventId,
            origen_registro: 'registro-campeonato',
            acompanantes: Array.isArray(acompanantes) ? acompanantes : [],
            servicios_principal: Array.isArray(servicios_principal) ? servicios_principal : [],
            servicios_acompanantes: Array.isArray(servicios_acompanantes) ? servicios_acompanantes : [],
            total_servicios: Number.isFinite(total_servicios) ? total_servicios : Number(total_servicios || 0)
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
        console.error('Error en registerToEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el registro'
        });
    }
};
