/**
 * CAPA DE APLICACIÓN: Controlador del portal público "Buscar mi inscripción"
 * Permite a un socio consultar el estado de su registro y adjuntar el
 * comprobante de pago más tarde, sin volver a diligenciar el formulario.
 */

const multer = require('multer');
const { InscripcionModel } = require('../models/inscripcionModel');
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

exports.uploadComprobanteMiddleware = comprobanteUpload.single('comprobante');

/**
 * Busca una inscripción validando documento + email. Devuelve el mismo
 * mensaje de "no encontrada" tanto si el documento no existe como si el
 * email no coincide, para no revelar cuál de los dos datos falló.
 */
exports.buscarInscripcion = async (req, res) => {
    try {
        const { documento, email } = req.body;

        if (!documento || String(documento).trim().length < 3 || !email || !String(email).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Documento y correo electrónico son obligatorios'
            });
        }

        const inscripcion = await InscripcionModel.buscarConVerificacion(documento, email);

        if (!inscripcion) {
            return res.status(404).json({
                success: false,
                message: 'No encontramos una inscripción con ese documento y correo electrónico'
            });
        }

        return res.status(200).json({
            success: true,
            inscripcion
        });
    } catch (error) {
        logger.error('Error en consultaInscripcionController.buscarInscripcion', { error });
        return res.status(500).json({
            success: false,
            message: 'No fue posible consultar la inscripción'
        });
    }
};

/**
 * Adjunta el comprobante de pago a una inscripción ya existente, tras
 * revalidar documento + email (el mismo segundo factor que la búsqueda).
 */
exports.subirComprobante = async (req, res) => {
    try {
        const { documento, email } = req.body;

        if (!documento || !email) {
            return res.status(400).json({
                success: false,
                message: 'Documento y correo electrónico son obligatorios'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Adjunta un archivo (PDF, JPG o PNG)'
            });
        }

        const actualizada = await InscripcionModel.actualizarComprobante(documento, email, {
            nombreArchivo: req.file.originalname,
            mime: req.file.mimetype,
            tamanoBytes: req.file.size,
            contenido: req.file.buffer
        });

        if (!actualizada) {
            return res.status(404).json({
                success: false,
                message: 'No encontramos una inscripción con ese documento y correo electrónico'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Comprobante adjuntado correctamente'
        });
    } catch (error) {
        logger.error('Error en consultaInscripcionController.subirComprobante', { error });
        return res.status(500).json({
            success: false,
            message: error.message && error.message.includes('Formato de comprobante')
                ? error.message
                : 'No fue posible adjuntar el comprobante'
        });
    }
};
