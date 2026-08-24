/**
 * CAPA DE DOMINIO: Modelo de contenido de Alojamiento y Turismo
 * CRUD sobre dbo.Hoteles y dbo.DestinosTuristicos, cada uno vinculado a un
 * evento_id (ver database/migrations/002_evento_id_en_contenido_turistico.sql):
 * cada evento se celebra en una sede distinta con sus propios hoteles y
 * atracciones turísticas.
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

    static async getHoteles({ eventoId = null, soloActivos = false } = {}) {
        try {
            const pool = await getPool();
            const request = pool.request();
            const condiciones = [];

            if (eventoId) {
                request.input('evento_id', sql.VarChar(120), eventoId);
                condiciones.push('evento_id = @evento_id');
            }
            if (soloActivos) {
                condiciones.push('activo = 1');
            }

            const query = `
                SELECT * FROM dbo.Hoteles
                ${condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : ''}
                ORDER BY es_sede_oficial DESC, orden ASC
            `;
            const result = await request.query(query);
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
                    evento_id, nombre, etiqueta, es_sede_oficial, icono, ubicacion, descripcion,
                    imagenes_json, tarifas_json, nota, google_maps_url,
                    whatsapp_telefono, whatsapp_mensaje, orden, activo
                )
                OUTPUT INSERTED.id_hotel
                VALUES (
                    @evento_id, @nombre, @etiqueta, @es_sede_oficial, @icono, @ubicacion, @descripcion,
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
                    evento_id = @evento_id,
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
        request.input('evento_id', sql.VarChar(120), data.evento_id || null);
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

    static async getDestinos({ eventoId = null, soloActivos = false } = {}) {
        try {
            const pool = await getPool();
            const request = pool.request();
            const condiciones = [];

            if (eventoId) {
                request.input('evento_id', sql.VarChar(120), eventoId);
                condiciones.push('evento_id = @evento_id');
            }
            if (soloActivos) {
                condiciones.push('activo = 1');
            }

            const query = `
                SELECT * FROM dbo.DestinosTuristicos
                ${condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : ''}
                ORDER BY orden ASC
            `;
            const result = await request.query(query);
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
        request.input('evento_id', sql.VarChar(120), data.evento_id || null);
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
                INSERT INTO dbo.DestinosTuristicos (evento_id, nombre, icono, color_icono, descripcion, orden, activo)
                OUTPUT INSERTED.id_destino
                VALUES (@evento_id, @nombre, @icono, @color_icono, @descripcion, @orden, @activo)
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
                    evento_id = @evento_id,
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

    static async getServiciosPremium({ eventoId = null, soloActivos = false } = {}) {
        try {
            const pool = await getPool();
            const request = pool.request();
            const condiciones = [];

            if (eventoId) {
                request.input('evento_id', sql.VarChar(120), eventoId);
                condiciones.push('evento_id = @evento_id');
            }
            if (soloActivos) {
                condiciones.push('activo = 1');
            }

            const query = `
                SELECT * FROM dbo.ServiciosPremium
                ${condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : ''}
                ORDER BY orden ASC
            `;
            const result = await request.query(query);
            return result.recordset.map((fila) => ({ ...fila, activo: Boolean(fila.activo) }));
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getServiciosPremium', { error });
            throw error;
        }
    }

    static async getServicioPremiumById(id) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM dbo.ServiciosPremium WHERE id_servicio = @id');
            return result.recordset.length > 0 ? { ...result.recordset[0], activo: Boolean(result.recordset[0].activo) } : null;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.getServicioPremiumById', { error });
            throw error;
        }
    }

    static bindServicioPremiumInputs(request, data) {
        request.input('evento_id', sql.VarChar(120), data.evento_id || null);
        request.input('nombre', sql.NVarChar(200), data.nombre);
        request.input('descripcion', sql.NVarChar(sql.MAX), data.descripcion || null);
        request.input('precio', sql.Int, Number.isFinite(Number(data.precio)) ? Number(data.precio) : 0);
        request.input('icono', sql.VarChar(50), data.icono || null);
        request.input('orden', sql.Int, Number.isFinite(data.orden) ? data.orden : 0);
        request.input('activo', sql.Bit, data.activo === false ? 0 : 1);
    }

    static async crearServicioPremium(data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            this.bindServicioPremiumInputs(request, data);

            const result = await request.query(`
                INSERT INTO dbo.ServiciosPremium (evento_id, nombre, descripcion, precio, icono, orden, activo)
                OUTPUT INSERTED.id_servicio
                VALUES (@evento_id, @nombre, @descripcion, @precio, @icono, @orden, @activo)
            `);
            return result.recordset[0].id_servicio;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.crearServicioPremium', { error });
            throw error;
        }
    }

    static async actualizarServicioPremium(id, data) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);
            this.bindServicioPremiumInputs(request, data);

            await request.query(`
                UPDATE dbo.ServiciosPremium SET
                    evento_id = @evento_id,
                    nombre = @nombre, descripcion = @descripcion, precio = @precio,
                    icono = @icono, orden = @orden, activo = @activo,
                    fecha_actualizacion = GETDATE()
                WHERE id_servicio = @id
            `);
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.actualizarServicioPremium', { error });
            throw error;
        }
    }

    static async eliminarServicioPremium(id) {
        try {
            const pool = await getPool();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM dbo.ServiciosPremium WHERE id_servicio = @id');
            return true;
        } catch (error) {
            logger.error('Error en ContenidoTuristicoModel.eliminarServicioPremium', { error });
            throw error;
        }
    }
}

module.exports = ContenidoTuristicoModel;
