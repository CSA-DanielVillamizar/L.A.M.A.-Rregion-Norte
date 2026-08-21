/**
 * CAPA DE DOMINIO: Servicio de formularios
 * Orquesta persistencia del formulario de contacto
 */

const FormularioModel = require('../models/formularioModel');

class FormularioService {
    static async registrarContacto(data) {
        try {
            const creado = await FormularioModel.crearContacto(data);
            return {
                success: true,
                data: creado
            };
        } catch (error) {
            console.error('Error en FormularioService.registrarContacto:', error.message);
            return {
                success: false,
                message: 'Error al guardar el contacto'
            };
        }
    }
}

module.exports = FormularioService;
