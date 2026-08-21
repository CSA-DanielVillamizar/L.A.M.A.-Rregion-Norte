/**
 * CAPA DE DOMINIO: Modelo de contenido de Alojamiento y Turismo
 * CRUD sobre dbo.Hoteles y dbo.DestinosTuristicos (ver
 * database/migrations/001_hoteles_y_destinos_turisticos.sql), editables
 * desde el panel admin en vez de vivir hardcodeados en home.ejs.
 */

const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

class ContenidoTuristicoModel {
    static normalizarHotelSalida(fila) {
        return {
            ...fila,
            es_sede_oficial: Boolean(fila.es_sede_oficial),
            activo: Boolean(fila.activo),
            imagenes: fila.imagenes_json ? JSON.parse(fila.imagenes_json) : [],
            tarifas: fila.tarifas_json ? JSON.parse(fila.tarifas_json) : []
        };
    }

    static async getHoteles({ soloActivos = false } = {}) {
        try {
            const pool = await getPool();
            const query = `
                SELECT * FROM dbo.Hoteles
                ${soloActivos ? 'WHERE activo = 1' : ''}
                ORDER BY es_sede_oficial DESC, orden ASC
            `;
            const result = await pool.request().query(query);
            return result.recordset.map((fila) => this.normalizarHotelSalida(fila));
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getHoteles', { error });
            throw error;
        }
    }

    static async getHotelById(id) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM dbo.Hoteles WHERE id_hotel = @id');
            return result.recordset.length > 0 ? this.normalizarHotelSalida(result.recordset[0]) : null;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getHotelById', { error });
            throw error;
        }
    }

    static async crearHotel(data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            this.bindHotelInputs(request, data);

            const result = await request.query(`
                INSERT INTO dbo.Hoteles (
                    nombre, etiqueta, es_sede_oficial, icono, ubicacion, descripcion,
                    imagenes_json, tarifas_json, nota, google_maps_url,
                    whatsapp_telefono, whatsapp_mensaje, orden, activo
                )
                OUTPUT INSERTED.id_hotel
                VALUES (
                    @nombre, @etiqueta, @es_sede_oficial, @icono, @ubicacion, @descripcion,
                    @imagenes_json, @tarifas_json, @nota, @google_maps_url,
                    @whatsapp_telefono, @whatsapp_mensaje, @orden, @activo
                )
            `);
            return result.recordset[0].id_hotel;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.crearHotel', { error });
            throw error;
        }
    }

    static async actualizarHotel(id, data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);
            this.bindHotelInputs(request, data);

            await request.query(`
                UPDATE dbo.Hoteles SET
                    nombre = @nombre, etiqueta = @etiqueta, es_sede_oficial = @es_sede_oficial,
                    icono = @icono, ubicacion = @ubicacion, descripcion = @descripcion,
                    imagenes_json = @imagenes_json, tarifas_json = @tarifas_json, nota = @nota,
                    google_maps_url = @google_maps_url, whatsapp_telefono = @whatsapp_telefono,
                    whatsapp_mensaje = @whatsapp_mensaje, orden = @orden, activo = @activo,
                    fecha_actualizacion = GETDATE()
                WHERE id_hotel = @id
            `);
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.actualizarHotel', { error });
            throw error;
        }
    }

    static bindHotelInputs(request, data) {
        request.input('nombre', sql.VarChar(200), data.nombre);
        request.input('etiqueta', sql.VarChar(100), data.etiqueta || null);
        request.input('es_sede_oficial', sql.Bit, data.es_sede_oficial ? 1 : 0);
        request.input('icono', sql.VarChar(50), data.icono || null);
        request.input('ubicacion', sql.VarChar(300), data.ubicacion || null);
        request.input('descripcion', sql.NVarChar(sql.MAX), data.descripcion || null);
        request.input('imagenes_json', sql.NVarChar(sql.MAX), Array.isArray(data.imagenes) && data.imagenes.length > 0 ? JSON.stringify(data.imagenes) : null);
        request.input('tarifas_json', sql.NVarChar(sql.MAX), Array.isArray(data.tarifas) && data.tarifas.length > 0 ? JSON.stringify(data.tarifas) : null);
        request.input('nota', sql.NVarChar(500), data.nota || null);
        request.input('google_maps_url', sql.VarChar(500), data.google_maps_url || null);
        request.input('whatsapp_telefono', sql.VarChar(20), data.whatsapp_telefono || null);
        request.input('whatsapp_mensaje', sql.VarChar(500), data.whatsapp_mensaje || null);
        request.input('orden', sql.Int, Number.isFinite(data.orden) ? data.orden : 0);
        request.input('activo', sql.Bit, data.activo === false ? 0 : 1);
    }

    static async eliminarHotel(id) {
        try {
            const pool = await getPool();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM dbo.Hoteles WHERE id_hotel = @id');
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.eliminarHotel', { error });
            throw error;
        }
    }

    static async getDestinos({ soloActivos = false } = {}) {
        try {
            const pool = await getPool();
            const query = `
                SELECT * FROM dbo.DestinosTuristicos
                ${soloActivos ? 'WHERE activo = 1' : ''}
                ORDER BY orden ASC
            `;
            const result = await pool.request().query(query);
            return result.recordset.map((fila) => ({ ...fila, activo: Boolean(fila.activo) }));
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getDestinos', { error });
            throw error;
        }
    }

    static async getDestinoById(id) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM dbo.DestinosTuristicos WHERE id_destino = @id');
            return result.recordset.length > 0 ? { ...result.recordset[0], activo: Boolean(result.recordset[0].activo) } : null;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getDestinoById', { error });
            throw error;
        }
    }

    static bindDestinoInputs(request, data) {
        request.input('nombre', sql.VarChar(200), data.nombre);
        request.input('icono', sql.VarChar(50), data.icono || null);
        request.input('color_icono', sql.VarChar(20), data.color_icono || 'lamaNeon');
        request.input('descripcion', sql.NVarChar(sql.MAX), data.descripcion || null);
        request.input('orden', sql.Int, Number.isFinite(data.orden) ? data.orden : 0);
        request.input('activo', sql.Bit, data.activo === false ? 0 : 1);
    }

    static async crearDestino(data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            this.bindDestinoInputs(request, data);

            const result = await request.query(`
                INSERT INTO dbo.DestinosTuristicos (nombre, icono, color_icono, descripcion, orden, activo)
                OUTPUT INSERTED.id_destino
                VALUES (@nombre, @icono, @color_icono, @descripcion, @orden, @activo)
            `);
            return result.recordset[0].id_destino;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.crearDestino', { error });
            throw error;
        }
    }

    static async actualizarDestino(id, data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);
            this.bindDestinoInputs(request, data);

            await request.query(`
                UPDATE dbo.DestinosTuristicos SET
                    nombre = @nombre, icono = @icono, color_icono = @color_icono,
                    descripcion = @descripcion, orden = @orden, activo = @activo,
                    fecha_actualizacion = GETDATE()
                WHERE id_destino = @id
            `);
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.actualizarDestino', { error });
            throw error;
        }
    }

    static async eliminarDestino(id) {
        try {
            const pool = await getPool();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM dbo.DestinosTuristicos WHERE id_destino = @id');
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.eliminarDestino', { error });
            throw error;
        }
    }
}

module.exports = ContenidoTuristicoModel;
