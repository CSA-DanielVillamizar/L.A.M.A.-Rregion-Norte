/**
 * CAPA DE APLICACIÓN: Controlador principal
 * Maneja la lógica de las rutas principales y coordina con los servicios
 */

const mainService = require('../services/mainService');
const logger = require('../utils/logger');
const capitulosService = require('../services/capitulosService');
const eventService = require('../services/eventService');
const { formatearRangoFechas } = require('../utils/fechas');
const { PAISES_CAPITULOS } = require('../data/paisesCapitulos');
const ContenidoTuristicoModel = require('../models/contenidoTuristicoModel');

/**
 * Renderiza la página principal (Home)
 */
exports.getHome = async (req, res) => {
    try {
        const homeData = await mainService.getHomeData();
        res.render('home', {
            title: 'L.A.M.A. | Hardcore Tropical',
            ...homeData
        });
    } catch (error) {
        logger.error('Error en getHome', { error });
        res.status(500).render('error', {
            message: 'Error al cargar la página principal'
        });
    }
};

/**
 * Renderiza información del club
 */
exports.getClubInfo = (req, res) => {
    try {
        const clubData = mainService.getClubData();
        res.render('club', {
            title: 'Sobre L.A.M.A.',
            ...clubData
        });
    } catch (error) {
        logger.error('Error en getClubInfo', { error });
        res.status(500).render('error', {
            message: 'Error al cargar información del club'
        });
    }
};

/**
 * Renderiza formulario de contacto
 */
exports.getContact = (req, res) => {
    res.render('contact', {
        title: 'Contacto',
        success: false,
        error: null
    });
};

/**
 * Procesa el formulario de contacto
 */
exports.postContact = async (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        // Validación básica
        if (!nombre || !email || !mensaje) {
            return res.render('contact', {
                title: 'Contacto',
                success: false,
                error: 'Todos los campos son obligatorios'
            });
        }

        await mainService.processContact({ nombre, email, mensaje });

        res.render('contact', {
            title: 'Contacto',
            success: true,
            error: null
        });
    } catch (error) {
        logger.error('Error en postContact', { error });
        res.render('contact', {
            title: 'Contacto',
            success: false,
            error: 'Error al enviar el mensaje'
        });
    }
};

/**
 * Renderiza formulario de registro al evento
 */
exports.getRegistro = (req, res) => {
    res.render('registro', {
        title: 'Registro V Campeonato',
        precioBase: 100000,
        precioJersey: 65000
    });
};

/**
 * Renderiza el formulario de inscripción a un evento especifico. Usado
 * tanto por /registro-campeonato (alias de conveniencia al evento
 * "destacado" del momento, para no romper enlaces ya compartidos) como
 * por /eventos/:id/registro-formulario (genérico, para cualquier evento).
 */
async function renderizarFormularioEvento(evento, res) {
    if (!evento || !evento.activo) {
        return res.status(404).render('404', {
            title: 'Evento No Encontrado',
            message: 'El evento que buscas no existe o ya no está disponible para inscripciones'
        });
    }

    const serviciosPremium = await ContenidoTuristicoModel.getServiciosPremium({ eventoId: evento.id, soloActivos: true });

    res.render('registro-campeonato', {
        title: `Inscripción ${evento.nombre}`,
        event: evento,
        rangoFechas: formatearRangoFechas(evento.fecha, evento.fechaFin),
        paisesCapitulos: PAISES_CAPITULOS,
        serviciosPremium
    });
}

/**
 * Renderiza formulario de inscripción al evento actualmente destacado
 * (alias de conveniencia; mantiene funcionando los enlaces existentes a
 * /registro-campeonato).
 */
exports.getRegistroCampeonato = async (req, res) => {
    try {
        const eventos = await eventService.getAllEvents();
        const eventoDestacado = eventos.find((e) => e.destacado) || eventos[0] || null;
        await renderizarFormularioEvento(eventoDestacado, res);
    } catch (error) {
        logger.error('Error en getRegistroCampeonato', { error });
        res.status(500).render('error', {
            message: 'Error al cargar el formulario de inscripción'
        });
    }
};

/**
 * Renderiza formulario de inscripción a un evento especifico por su id.
 */
exports.getRegistroEvento = async (req, res) => {
    try {
        const evento = await eventService.getEventById(req.params.id);
        await renderizarFormularioEvento(evento, res);
    } catch (error) {
        logger.error('Error en getRegistroEvento', { error });
        res.status(500).render('error', {
            message: 'Error al cargar el formulario de inscripción'
        });
    }
};

/**
 * Renderiza el portal público "Buscar mi inscripción"
 */
exports.getMiInscripcion = (req, res) => {
    res.render('mi-inscripcion', {
        title: 'Buscar mi Inscripción'
    });
};

/**
 * Renderiza mapa interactivo del evento
 */
exports.getItinerario = (req, res) => {
    try {
        res.render('itinerario', {
            title: 'Mapa Interactivo - V Campeonato Regional'
        });
    } catch (error) {
        logger.error('Error en getItinerario', { error });
        res.status(500).render('error', {
            message: 'Error al cargar el mapa del evento'
        });
    }
};

/**
 * Renderiza página de capítulos oficiales
 */
exports.getCapitulos = (req, res) => {
    try {
        const capitulos = capitulosService.getAllCapitulos();
        const stats = capitulosService.getEstadisticas();
        const porDepartamento = capitulosService.getCapitulosPorDepartamento();

        res.render('capitulos', {
            title: 'Capítulos L.A.M.A. - Región Norte',
            capitulos,
            stats,
            porDepartamento
        });
    } catch (error) {
        logger.error('Error en getCapitulos', { error });
        res.status(500).render('error', {
            message: 'Error al cargar los capítulos'
        });
    }
};
