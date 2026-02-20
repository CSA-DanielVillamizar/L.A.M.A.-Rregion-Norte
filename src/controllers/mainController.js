/**
 * CAPA DE APLICACIÓN: Controlador principal
 * Maneja la lógica de las rutas principales y coordina con los servicios
 */

const mainService = require('../services/mainService');
const capitulosService = require('../services/capitulosService');

/**
 * Renderiza la página principal (Home)
 */
exports.getHome = (req, res) => {
    try {
        const homeData = mainService.getHomeData();
        res.render('home', {
            title: 'L.A.M.A. | Hardcore Tropical',
            ...homeData
        });
    } catch (error) {
        console.error('Error en getHome:', error);
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
        console.error('Error en getClubInfo:', error);
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
        console.error('Error en postContact:', error);
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
        precioBase: 150000,
        precioJersey: 70000
    });
};

/**
 * Renderiza formulario de inscripción al V Campeonato Regional
 */
exports.getRegistroCampeonato = (req, res) => {
    res.render('registro-campeonato', {
        title: 'Inscripción V Campeonato Regional'
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
        console.error('Error en getItinerario:', error);
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
        console.error('Error en getCapitulos:', error);
        res.status(500).render('error', {
            message: 'Error al cargar los capítulos'
        });
    }
};
