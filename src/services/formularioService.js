/**
 * CAPA DE DOMINIO: Servicio de formularios
 * Orquesta persistencia de contacto y registro de campeonato
 */

const FormularioModel = require('../models/formularioModel');

class FormularioService {
    static async registrarCampeonato(eventoId, data) {
        try {
            const existente = await FormularioModel.buscarRegistroCampeonatoPorDocumento(eventoId, data.documento);
            if (existente) {
                return {
                    success: false,
                    codigo: 'DUPLICADO',
                    message: 'Ya existe un registro para este documento en este evento'
                };
            }

            const creado = await FormularioModel.crearRegistroCampeonato({
                ...data,
                evento_id: eventoId
            });

            return {
                success: true,
                message: 'Registro exitoso',
                data: creado
            };
        } catch (error) {
            console.error('Error en FormularioService.registrarCampeonato:', error.message);
            return {
                success: false,
                codigo: 'ERROR_INTERNO',
                message: 'Error al guardar registro de campeonato'
            };
        }
    }

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

    static async existeDocumentoCampeonato(eventoId, documento) {
        try {
            const registro = await FormularioModel.buscarRegistroCampeonatoPorDocumento(eventoId, documento);
            return Boolean(registro);
        } catch (error) {
            console.error('Error en FormularioService.existeDocumentoCampeonato:', error.message);
            return false;
        }
    }
}

module.exports = FormularioService;
