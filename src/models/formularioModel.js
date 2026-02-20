/**
 * CAPA DE DOMINIO: Modelo de formularios web
 * Gestiona persistencia de contacto y registro de campeonato en Azure SQL
 */

const { getPool, sql } = require('../config/database');

class FormularioModel {
    static async asegurarTablas() {
        const pool = await getPool();

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RegistrosCampeonatoWeb')
            BEGIN
                CREATE TABLE RegistrosCampeonatoWeb (
                    id_registro INT IDENTITY(1,1) PRIMARY KEY,
                    evento_id VARCHAR(80) NOT NULL,
                    categoria VARCHAR(120) NULL,
                    nombre_completo VARCHAR(200) NOT NULL,
                    documento_numero VARCHAR(40) NOT NULL,
                    eps VARCHAR(120) NULL,
                    emergencia_nombre VARCHAR(200) NULL,
                    emergencia_telefono VARCHAR(60) NULL,
                    capitulo VARCHAR(120) NULL,
                    directivo VARCHAR(30) NULL,
                    ambito VARCHAR(120) NULL,
                    cargo VARCHAR(150) NULL,
                    fecha_llegada DATE NULL,
                    condicion_medica NVARCHAR(MAX) NULL,
                    jersey BIT NOT NULL DEFAULT 0,
                    talla VARCHAR(10) NULL,
                    acompana BIT NOT NULL DEFAULT 0,
                    acompanantes_json NVARCHAR(MAX) NULL,
                    servicios_principal_json NVARCHAR(MAX) NULL,
                    servicios_acompanantes_json NVARCHAR(MAX) NULL,
                    total_servicios INT NULL,
                    payload_json NVARCHAR(MAX) NULL,
                    fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE()
                );

                CREATE UNIQUE INDEX UX_RegistrosCampeonatoWeb_EventoDocumento
                ON RegistrosCampeonatoWeb(evento_id, documento_numero);
            END
        `);

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContactosWeb')
            BEGIN
                CREATE TABLE ContactosWeb (
                    id_contacto INT IDENTITY(1,1) PRIMARY KEY,
                    nombre VARCHAR(200) NOT NULL,
                    email VARCHAR(200) NOT NULL,
                    mensaje NVARCHAR(MAX) NOT NULL,
                    origen VARCHAR(80) NOT NULL DEFAULT 'contacto_web',
                    fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE()
                );
            END
        `);
    }

    static async crearRegistroCampeonato(data) {
        await this.asegurarTablas();

        const pool = await getPool();
        const request = pool.request();

        request.input('evento_id', sql.VarChar(80), data.evento_id);
        request.input('categoria', sql.VarChar(120), data.categoria || null);
        request.input('nombre_completo', sql.VarChar(200), data.nombre || null);
        request.input('documento_numero', sql.VarChar(40), data.documento || null);
        request.input('eps', sql.VarChar(120), data.eps || null);
        request.input('emergencia_nombre', sql.VarChar(200), data.emergencia_nombre || null);
        request.input('emergencia_telefono', sql.VarChar(60), data.emergencia_telefono || null);
        request.input('capitulo', sql.VarChar(120), data.capitulo || null);
        request.input('directivo', sql.VarChar(30), data.directivo || null);
        request.input('ambito', sql.VarChar(120), data.ambito || null);
        request.input('cargo', sql.VarChar(150), data.cargo || null);
        request.input('fecha_llegada', sql.Date, data.fecha_llegada ? new Date(data.fecha_llegada) : null);
        request.input('condicion_medica', sql.NVarChar(sql.MAX), data.condicion_medica || null);
        request.input('jersey', sql.Bit, data.jersey ? 1 : 0);
        request.input('talla', sql.VarChar(10), data.talla || null);
        request.input('acompana', sql.Bit, data.acompanante ? 1 : 0);
        request.input('acompanantes_json', sql.NVarChar(sql.MAX), JSON.stringify(data.acompanantes || []));
        request.input('servicios_principal_json', sql.NVarChar(sql.MAX), JSON.stringify(data.servicios_principal || []));
        request.input('servicios_acompanantes_json', sql.NVarChar(sql.MAX), JSON.stringify(data.servicios_acompanantes || []));
        request.input('total_servicios', sql.Int, Number.isFinite(data.total_servicios) ? data.total_servicios : null);
        request.input('payload_json', sql.NVarChar(sql.MAX), JSON.stringify(data));

        const result = await request.query(`
            INSERT INTO RegistrosCampeonatoWeb (
                evento_id, categoria, nombre_completo, documento_numero, eps,
                emergencia_nombre, emergencia_telefono, capitulo, directivo, ambito,
                cargo, fecha_llegada, condicion_medica, jersey, talla, acompana,
                acompanantes_json, servicios_principal_json, servicios_acompanantes_json,
                total_servicios, payload_json
            )
            OUTPUT INSERTED.id_registro, INSERTED.fecha_registro
            VALUES (
                @evento_id, @categoria, @nombre_completo, @documento_numero, @eps,
                @emergencia_nombre, @emergencia_telefono, @capitulo, @directivo, @ambito,
                @cargo, @fecha_llegada, @condicion_medica, @jersey, @talla, @acompana,
                @acompanantes_json, @servicios_principal_json, @servicios_acompanantes_json,
                @total_servicios, @payload_json
            )
        `);

        return result.recordset[0];
    }

    static async buscarRegistroCampeonatoPorDocumento(eventoId, documento) {
        await this.asegurarTablas();

        const pool = await getPool();
        const request = pool.request();
        request.input('evento_id', sql.VarChar(80), eventoId);
        request.input('documento_numero', sql.VarChar(40), documento);

        const result = await request.query(`
            SELECT TOP 1 id_registro, documento_numero, evento_id, fecha_registro
            FROM RegistrosCampeonatoWeb
            WHERE evento_id = @evento_id AND documento_numero = @documento_numero
            ORDER BY fecha_registro DESC
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async crearContacto(data) {
        await this.asegurarTablas();

        const pool = await getPool();
        const request = pool.request();
        request.input('nombre', sql.VarChar(200), data.nombre);
        request.input('email', sql.VarChar(200), data.email);
        request.input('mensaje', sql.NVarChar(sql.MAX), data.mensaje);
        request.input('origen', sql.VarChar(80), data.origen || 'contacto_web');

        const result = await request.query(`
            INSERT INTO ContactosWeb (nombre, email, mensaje, origen)
            OUTPUT INSERTED.id_contacto, INSERTED.fecha_registro
            VALUES (@nombre, @email, @mensaje, @origen)
        `);

        return result.recordset[0];
    }

    static async listarRegistrosCampeonato(eventoId = null) {
        await this.asegurarTablas();

        const pool = await getPool();
        const request = pool.request();

        let query = `
            SELECT
                id_registro,
                evento_id,
                categoria,
                nombre_completo,
                documento_numero,
                eps,
                emergencia_nombre,
                emergencia_telefono,
                capitulo,
                directivo,
                ambito,
                cargo,
                fecha_llegada,
                condicion_medica,
                jersey,
                talla,
                acompana,
                acompanantes_json,
                total_servicios,
                fecha_registro
            FROM RegistrosCampeonatoWeb
        `;

        if (eventoId) {
            request.input('evento_id', sql.VarChar(80), eventoId);
            query += ' WHERE evento_id = @evento_id';
        }

        query += ' ORDER BY fecha_registro DESC';

        const result = await request.query(query);
        return result.recordset;
    }
}

module.exports = FormularioModel;
