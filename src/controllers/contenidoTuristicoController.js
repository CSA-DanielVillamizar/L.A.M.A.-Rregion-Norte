/**
 * CAPA DE PRESENTACIÓN: Controlador del CMS de Alojamiento y Turismo
 * Permite editar desde el panel admin los hoteles y destinos turísticos
 * que se muestran en la página principal (antes hardcodeados en home.ejs).
 */

const ContenidoTuristicoModel = require('../models/contenidoTuristicoModel');
const logger = require('../utils/logger');

exports.mostrarPanel = async (req, res) => {
    try {
        const [hoteles, destinos] = await Promise.all([
            ContenidoTuristicoModel.getHoteles(),
            ContenidoTuristicoModel.getDestinos()
        ]);

        res.render('admin/contenido-turistico', {
            title: 'Alojamiento y Turismo - Panel de Administración',
            hoteles,
            destinos
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
        const hoteles = await ContenidoTuristicoModel.getHoteles();
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
        const destinos = await ContenidoTuristicoModel.getDestinos();
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
