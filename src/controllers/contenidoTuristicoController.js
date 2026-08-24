/**
 * CAPA DE PRESENTACIÓN: Controlador del CMS de Alojamiento y Turismo
 * Permite editar desde el panel admin los hoteles y destinos turísticos
 * que se muestran en la página principal (antes hardcodeados en home.ejs).
 */

const ContenidoTuristicoModel = require('../models/contenidoTuristicoModel');
const eventService = require('../services/eventService');
const logger = require('../utils/logger');

exports.mostrarPanel = async (req, res) => {
    try {
        const eventos = await eventService.getAllEvents();
        const eventoIdSolicitado = req.query.evento_id;
        const eventoSeleccionado = eventos.find((e) => e.id === eventoIdSolicitado) || eventos[0] || null;
        const eventoId = eventoSeleccionado ? eventoSeleccionado.id : null;

        const [hoteles, destinos, serviciosPremium] = await Promise.all([
            eventoId ? ContenidoTuristicoModel.getHoteles({ eventoId }) : [],
            eventoId ? ContenidoTuristicoModel.getDestinos({ eventoId }) : [],
            eventoId ? ContenidoTuristicoModel.getServiciosPremium({ eventoId }) : []
        ]);

        res.render('admin/contenido-turistico', {
            title: 'Alojamiento y Turismo - Panel de Administración',
            hoteles,
            destinos,
            serviciosPremium,
            eventos,
            eventoSeleccionado
        });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.mostrarPanel', { error });
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error al cargar el contenido de alojamiento y turismo',
            error: error.message
        });
    }
};

// ---- Hoteles ----

exports.getAllHoteles = async (req, res) => {
    try {
        const hoteles = await ContenidoTuristicoModel.getHoteles({ eventoId: req.query.evento_id || null });
        res.json({ success: true, data: hoteles });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.getAllHoteles', { error });
        res.status(500).json({ success: false, message: 'Error al obtener hoteles' });
    }
};

exports.createHotel = async (req, res) => {
    try {
        if (!req.body.nombre) {
            return res.status(400).json({ success: false, message: 'El nombre del hotel es obligatorio' });
        }
        const id = await ContenidoTuristicoModel.crearHotel(req.body);
        res.status(201).json({ success: true, id_hotel: id });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.createHotel', { error });
        res.status(500).json({ success: false, message: 'Error al crear el hotel' });
    }
};

exports.updateHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existente = await ContenidoTuristicoModel.getHotelById(id);
        if (!existente) {
            return res.status(404).json({ success: false, message: 'Hotel no encontrado' });
        }
        await ContenidoTuristicoModel.actualizarHotel(id, req.body);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.updateHotel', { error });
        res.status(500).json({ success: false, message: 'Error al actualizar el hotel' });
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ContenidoTuristicoModel.eliminarHotel(id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.deleteHotel', { error });
        res.status(500).json({ success: false, message: 'Error al eliminar el hotel' });
    }
};

// ---- Destinos turísticos ----

exports.getAllDestinos = async (req, res) => {
    try {
        const destinos = await ContenidoTuristicoModel.getDestinos({ eventoId: req.query.evento_id || null });
        res.json({ success: true, data: destinos });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.getAllDestinos', { error });
        res.status(500).json({ success: false, message: 'Error al obtener destinos turísticos' });
    }
};

exports.createDestino = async (req, res) => {
    try {
        if (!req.body.nombre) {
            return res.status(400).json({ success: false, message: 'El nombre del destino es obligatorio' });
        }
        const id = await ContenidoTuristicoModel.crearDestino(req.body);
        res.status(201).json({ success: true, id_destino: id });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.createDestino', { error });
        res.status(500).json({ success: false, message: 'Error al crear el destino turístico' });
    }
};

exports.updateDestino = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existente = await ContenidoTuristicoModel.getDestinoById(id);
        if (!existente) {
            return res.status(404).json({ success: false, message: 'Destino no encontrado' });
        }
        await ContenidoTuristicoModel.actualizarDestino(id, req.body);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.updateDestino', { error });
        res.status(500).json({ success: false, message: 'Error al actualizar el destino turístico' });
    }
};

exports.deleteDestino = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ContenidoTuristicoModel.eliminarDestino(id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.deleteDestino', { error });
        res.status(500).json({ success: false, message: 'Error al eliminar el destino turístico' });
    }
};

// ---- Servicios premium (opcionales, por evento) ----

exports.getAllServiciosPremium = async (req, res) => {
    try {
        const servicios = await ContenidoTuristicoModel.getServiciosPremium({ eventoId: req.query.evento_id || null });
        res.json({ success: true, data: servicios });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.getAllServiciosPremium', { error });
        res.status(500).json({ success: false, message: 'Error al obtener servicios premium' });
    }
};

exports.createServicioPremium = async (req, res) => {
    try {
        if (!req.body.nombre) {
            return res.status(400).json({ success: false, message: 'El nombre del servicio es obligatorio' });
        }
        const id = await ContenidoTuristicoModel.crearServicioPremium(req.body);
        res.status(201).json({ success: true, id_servicio: id });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.createServicioPremium', { error });
        res.status(500).json({ success: false, message: 'Error al crear el servicio premium' });
    }
};

exports.updateServicioPremium = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existente = await ContenidoTuristicoModel.getServicioPremiumById(id);
        if (!existente) {
            return res.status(404).json({ success: false, message: 'Servicio premium no encontrado' });
        }
        await ContenidoTuristicoModel.actualizarServicioPremium(id, req.body);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.updateServicioPremium', { error });
        res.status(500).json({ success: false, message: 'Error al actualizar el servicio premium' });
    }
};

exports.deleteServicioPremium = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ContenidoTuristicoModel.eliminarServicioPremium(id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error en ContenidoTuristicoController.deleteServicioPremium', { error });
        res.status(500).json({ success: false, message: 'Error al eliminar el servicio premium' });
    }
};
