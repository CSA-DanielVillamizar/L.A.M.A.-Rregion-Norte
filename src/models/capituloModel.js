/**
 * CAPA DE DOMINIO: Modelo de datos operativos de Capítulos
 * CRUD sobre dbo.Capitulos y dbo.CapitulosOficiales (ver migración 007).
 * Distinto del catálogo en memoria de src/services/capitulosService.js
 * (contenido de marketing de la página pública /capitulos, solo Colombia):
 * esta tabla guarda las coordenadas de la sede de cada capítulo (para el
 * cálculo de distancia de las planillas de asistencia) y el roster fijo de
 * oficiales, y cubre el catálogo internacional completo de
 * src/data/paisesCapitulos.js.
 */

const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

const CARGOS_OFICIALES = [
    'Oficial Regional',
    'Oficial Int/Cont/Nac/Reg',
    'Presidente',
    'Vice Presidente',
    'Tesorero',
    'Gerente Negocios',
    'Secretario',
    'Oficial de Mototurismo'
];

class CapituloModel {
    static normalizarSalida(fila) {
        return {
            id_capitulo: fila.id_capitulo,
            nombre: fila.nombre,
            pais: fila.pais,
            latitud: fila.latitud !== null && fila.latitud !== undefined ? Number(fila.latitud) : null,
            longitud: fila.longitud !== null && fila.longitud !== undefined ? Number(fila.longitud) : null
        };
    }

    static async getAll() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                SELECT id_capitulo, nombre, pais, latitud, longitud
                FROM dbo.Capitulos
                ORDER BY pais ASC, nombre ASC
            `);
            return result.recordset.map((fila) => this.normalizarSalida(fila));
        } catch (error) {
            logger.error('Error en CapituloModel.getAll', { error });
            throw error;
        }
    }

    static async getOficiales(idCapitulo) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id_capitulo', sql.Int, idCapitulo)
                .query(`
                    SELECT id_oficial, cargo, nombre_completo, documento_numero
                    FROM dbo.CapitulosOficiales
                    WHERE id_capitulo = @id_capitulo
                `);

            const porCargo = new Map(result.recordset.map((fila) => [fila.cargo, fila]));
            return CARGOS_OFICIALES.map((cargo) => ({
                cargo,
                nombre_completo: porCargo.get(cargo)?.nombre_completo || null,
                documento_numero: porCargo.get(cargo)?.documento_numero || null
            }));
        } catch (error) {
            logger.error('Error en CapituloModel.getOficiales', { error });
            throw error;
        }
    }

    static async getById(id) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id_capitulo, nombre, pais, latitud, longitud FROM dbo.Capitulos WHERE id_capitulo = @id');

            if (result.recordset.length === 0) return null;

            const capitulo = this.normalizarSalida(result.recordset[0]);
            capitulo.oficiales = await this.getOficiales(id);
            return capitulo;
        } catch (error) {
            logger.error('Error en CapituloModel.getById', { error });
            throw error;
        }
    }

    static async getByNombrePais(nombre, pais) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('nombre', sql.NVarChar(150), nombre)
                .input('pais', sql.NVarChar(100), pais)
                .query('SELECT id_capitulo, nombre, pais, latitud, longitud FROM dbo.Capitulos WHERE nombre = @nombre AND pais = @pais');

            if (result.recordset.length === 0) return null;

            const capitulo = this.normalizarSalida(result.recordset[0]);
            capitulo.oficiales = await this.getOficiales(capitulo.id_capitulo);
            return capitulo;
        } catch (error) {
            logger.error('Error en CapituloModel.getByNombrePais', { error });
            throw error;
        }
    }

    static async upsert({ nombre, pais, latitud, longitud }) {
        try {
            const pool = await getPool();
            const existente = await pool.request()
                .input('nombre', sql.NVarChar(150), nombre)
                .input('pais', sql.NVarChar(100), pais)
                .query('SELECT id_capitulo FROM dbo.Capitulos WHERE nombre = @nombre AND pais = @pais');

            if (existente.recordset.length > 0) {
                const id = existente.recordset[0].id_capitulo;
                await pool.request()
                    .input('id', sql.Int, id)
                    .input('latitud', sql.Decimal(10, 7), latitud ?? null)
                    .input('longitud', sql.Decimal(10, 7), longitud ?? null)
                    .query(`
                        UPDATE dbo.Capitulos
                        SET latitud = @latitud, longitud = @longitud, fecha_actualizacion = GETDATE()
                        WHERE id_capitulo = @id
                    `);
                return id;
            }

            const result = await pool.request()
                .input('nombre', sql.NVarChar(150), nombre)
                .input('pais', sql.NVarChar(100), pais)
                .input('latitud', sql.Decimal(10, 7), latitud ?? null)
                .input('longitud', sql.Decimal(10, 7), longitud ?? null)
                .query(`
                    INSERT INTO dbo.Capitulos (nombre, pais, latitud, longitud)
                    OUTPUT INSERTED.id_capitulo
                    VALUES (@nombre, @pais, @latitud, @longitud)
                `);
            return result.recordset[0].id_capitulo;
        } catch (error) {
            logger.error('Error en CapituloModel.upsert', { error });
            throw error;
        }
    }

    /**
     * Reemplaza el roster de oficiales de un capítulo. Recibe únicamente los
     * cargos que se quieren asignar (los demás se dejan vacíos/eliminados).
     */
    static async guardarOficiales(idCapitulo, oficiales) {
        try {
            const pool = await getPool();
            await pool.request()
                .input('id_capitulo', sql.Int, idCapitulo)
                .query('DELETE FROM dbo.CapitulosOficiales WHERE id_capitulo = @id_capitulo');

            for (const oficial of oficiales) {
                if (!CARGOS_OFICIALES.includes(oficial.cargo)) continue;
                if (!oficial.nombre_completo && !oficial.documento_numero) continue;

                await pool.request()
                    .input('id_capitulo', sql.Int, idCapitulo)
                    .input('cargo', sql.VarChar(60), oficial.cargo)
                    .input('nombre_completo', sql.NVarChar(200), oficial.nombre_completo || null)
                    .input('documento_numero', sql.VarChar(30), oficial.documento_numero || null)
                    .query(`
                        INSERT INTO dbo.CapitulosOficiales (id_capitulo, cargo, nombre_completo, documento_numero)
                        VALUES (@id_capitulo, @cargo, @nombre_completo, @documento_numero)
                    `);
            }

            return true;
        } catch (error) {
            logger.error('Error en CapituloModel.guardarOficiales', { error });
            throw error;
        }
    }

    static async eliminar(id) {
        try {
            const pool = await getPool();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM dbo.Capitulos WHERE id_capitulo = @id');
            return true;
        } catch (error) {
            logger.error('Error en CapituloModel.eliminar', { error });
            throw error;
        }
    }
}

module.exports = { CapituloModel, CARGOS_OFICIALES };
