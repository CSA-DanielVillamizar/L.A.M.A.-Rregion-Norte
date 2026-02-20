/**
 * Servicio de Gestión del Ticker de Urgencia
 * Maneja la configuración de anuncios dinámicos del campeonato
 */

const { getPool, sql } = require('../config/database');

class TickerService {
    constructor() {
        this.tablaAsegurada = false;
    }

    getAnunciosSemilla() {
        return [
            {
                title: 'CUPOS LIMITADOS',
                message: 'Solo 150 cupos disponibles - Quedan 12 lugares',
                type: 'critical',
                icon: 'ticket',
                color: '#00F5FF'
            },
            {
                title: 'CIERRE INSCRIPCIONES',
                message: '30 de Agosto - Última oportunidad para registrarse',
                type: 'warning',
                icon: 'calendar',
                color: '#FFD700'
            },
            {
                title: 'EARLY BIRD GANA',
                message: 'Inscribete antes del 20 de Agosto y obtén 1 premio sorpresa',
                type: 'success',
                icon: 'success',
                color: '#00FF00'
            }
        ];
    }

    normalizarColor(colorHex) {
        if (typeof colorHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(colorHex)) {
            return colorHex.toUpperCase();
        }
        return '#00F5FF';
    }

    async asegurarTablaTicker() {
        if (this.tablaAsegurada) {
            return;
        }

        const pool = await getPool();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TickerAnuncios')
            BEGIN
                CREATE TABLE TickerAnuncios (
                    id_anuncio INT IDENTITY(1,1) PRIMARY KEY,
                    title NVARCHAR(140) NOT NULL,
                    message NVARCHAR(500) NOT NULL,
                    type VARCHAR(30) NOT NULL,
                    icon VARCHAR(40) NOT NULL,
                    color VARCHAR(7) NOT NULL,
                    orden_visual INT NOT NULL DEFAULT 1,
                    activo BIT NOT NULL DEFAULT 1,
                    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
                    fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE()
                );
            END
        `);

        const conteo = await pool.request().query(`
            SELECT COUNT(1) AS total
            FROM TickerAnuncios
            WHERE activo = 1
        `);

        const totalActivos = conteo.recordset[0]?.total || 0;
        if (totalActivos === 0) {
            const anunciosSemilla = this.getAnunciosSemilla();

            for (let indice = 0; indice < anunciosSemilla.length; indice += 1) {
                const anuncio = anunciosSemilla[indice];
                const request = pool.request();
                request.input('title', sql.NVarChar(140), anuncio.title);
                request.input('message', sql.NVarChar(500), anuncio.message);
                request.input('type', sql.VarChar(30), anuncio.type);
                request.input('icon', sql.VarChar(40), anuncio.icon);
                request.input('color', sql.VarChar(7), this.normalizarColor(anuncio.color));
                request.input('orden_visual', sql.Int, indice + 1);

                await request.query(`
                    INSERT INTO TickerAnuncios (title, message, type, icon, color, orden_visual, activo)
                    VALUES (@title, @message, @type, @icon, @color, @orden_visual, 1)
                `);
            }
        }

        this.tablaAsegurada = true;
    }

    /**
     * Obtiene todos los anuncios del ticker
     * @returns {Array} Array de anuncios
     */
    async getAllAnnouncements() {
        await this.asegurarTablaTicker();

        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT
                id_anuncio AS id,
                title,
                message,
                type,
                icon,
                color,
                orden_visual AS ordenVisual,
                activo
            FROM TickerAnuncios
            WHERE activo = 1
            ORDER BY orden_visual ASC, id_anuncio ASC
        `);

        return result.recordset;
    }

    /**
     * Obtiene un anuncio por ID
     * @param {number} id - ID del anuncio
     * @returns {Object} Anuncio encontrado
     */
    async getAnnouncementById(id) {
        await this.asegurarTablaTicker();

        const pool = await getPool();
        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query(`
            SELECT TOP 1
                id_anuncio AS id,
                title,
                message,
                type,
                icon,
                color,
                orden_visual AS ordenVisual,
                activo
            FROM TickerAnuncios
            WHERE id_anuncio = @id
        `);

        return result.recordset.length ? result.recordset[0] : null;
    }

    /**
     * Crea un nuevo anuncio
     * @param {Object} announcement - Objeto con datos del anuncio
     * @returns {Object} Anuncio creado con ID
     */
    async createAnnouncement(announcement) {
        await this.asegurarTablaTicker();

        const pool = await getPool();
        const request = pool.request();
        request.input('title', sql.NVarChar(140), announcement.title);
        request.input('message', sql.NVarChar(500), announcement.message);
        request.input('type', sql.VarChar(30), announcement.type);
        request.input('icon', sql.VarChar(40), announcement.icon || 'info');
        request.input('color', sql.VarChar(7), this.normalizarColor(announcement.color));

        const result = await request.query(`
            INSERT INTO TickerAnuncios (title, message, type, icon, color, orden_visual, activo)
            OUTPUT
                INSERTED.id_anuncio AS id,
                INSERTED.title,
                INSERTED.message,
                INSERTED.type,
                INSERTED.icon,
                INSERTED.color,
                INSERTED.orden_visual AS ordenVisual,
                INSERTED.activo
            VALUES (
                @title,
                @message,
                @type,
                @icon,
                @color,
                ISNULL((SELECT MAX(orden_visual) + 1 FROM TickerAnuncios WHERE activo = 1), 1),
                1
            )
        `);

        return result.recordset[0];
    }

    /**
     * Actualiza un anuncio existente
     * @param {number} id - ID del anuncio
     * @param {Object} updates - Datos a actualizar
     * @returns {Object} Anuncio actualizado
     */
    async updateAnnouncement(id, updates) {
        await this.asegurarTablaTicker();

        const pool = await getPool();
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('title', sql.NVarChar(140), updates.title);
        request.input('message', sql.NVarChar(500), updates.message);
        request.input('type', sql.VarChar(30), updates.type);
        request.input('icon', sql.VarChar(40), updates.icon || 'info');
        request.input('color', sql.VarChar(7), this.normalizarColor(updates.color));

        const result = await request.query(`
            UPDATE TickerAnuncios
            SET
                title = @title,
                message = @message,
                type = @type,
                icon = @icon,
                color = @color,
                fecha_actualizacion = GETDATE()
            OUTPUT
                INSERTED.id_anuncio AS id,
                INSERTED.title,
                INSERTED.message,
                INSERTED.type,
                INSERTED.icon,
                INSERTED.color,
                INSERTED.orden_visual AS ordenVisual,
                INSERTED.activo
            WHERE id_anuncio = @id AND activo = 1
        `);

        return result.recordset.length ? result.recordset[0] : null;
    }

    /**
     * Elimina un anuncio
     * @param {number} id - ID del anuncio
     * @returns {boolean} True si fue eliminado
     */
    async deleteAnnouncement(id) {
        await this.asegurarTablaTicker();

        const pool = await getPool();
        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query(`
            DELETE FROM TickerAnuncios
            WHERE id_anuncio = @id
        `);

        return result.rowsAffected[0] > 0;
    }

    async reorderAnnouncements(idsOrdenados) {
        await this.asegurarTablaTicker();

        const idsValidos = Array.isArray(idsOrdenados)
            ? idsOrdenados
                .map((id) => parseInt(id, 10))
                .filter((id) => Number.isInteger(id) && id > 0)
            : [];

        if (!idsValidos.length) {
            return [];
        }

        const pool = await getPool();
        for (let indice = 0; indice < idsValidos.length; indice += 1) {
            const request = pool.request();
            request.input('id_anuncio', sql.Int, idsValidos[indice]);
            request.input('orden_visual', sql.Int, indice + 1);

            await request.query(`
                UPDATE TickerAnuncios
                SET orden_visual = @orden_visual,
                    fecha_actualizacion = GETDATE()
                WHERE id_anuncio = @id_anuncio AND activo = 1
            `);
        }

        return this.getAllAnnouncements();
    }
}

module.exports = new TickerService();
