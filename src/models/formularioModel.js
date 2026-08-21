/**
 * CAPA DE DOMINIO: Modelo de formularios web
 * Gestiona persistencia del formulario de contacto en Azure SQL
 */

const { getPool, sql } = require('../config/database');

class FormularioModel {
    static async asegurarTablas() {
        const pool = await getPool();

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
}

module.exports = FormularioModel;
