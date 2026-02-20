const { getPool, sql } = require('../config/database');

class UbicacionModel {
    static async asegurarTablaMunicipios() {
        const pool = await getPool();
        await pool.request().query(`
            IF OBJECT_ID('dbo.MunicipiosColombia', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.MunicipiosColombia (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    departamento NVARCHAR(120) NOT NULL,
                    municipio NVARCHAR(160) NOT NULL,
                    departamento_normalizado NVARCHAR(120) NOT NULL,
                    municipio_normalizado NVARCHAR(160) NOT NULL,
                    nombre_completo NVARCHAR(300) NOT NULL,
                    nombre_completo_normalizado NVARCHAR(300) NOT NULL,
                    codigo_dane CHAR(5) NULL,
                    provincia NVARCHAR(120) NULL,
                    fuente NVARCHAR(60) NOT NULL CONSTRAINT DF_MunicipiosColombia_Fuente DEFAULT('colombia-cities'),
                    fecha_actualizacion DATETIME2(0) NOT NULL CONSTRAINT DF_MunicipiosColombia_Fecha DEFAULT SYSUTCDATETIME()
                );
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE object_id = OBJECT_ID('dbo.MunicipiosColombia')
                  AND name = 'UQ_MunicipiosColombia_Dep_Mun_Norm'
            )
            BEGIN
                CREATE UNIQUE INDEX UQ_MunicipiosColombia_Dep_Mun_Norm
                    ON dbo.MunicipiosColombia(departamento_normalizado, municipio_normalizado);
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE object_id = OBJECT_ID('dbo.MunicipiosColombia')
                  AND name = 'IX_MunicipiosColombia_Busqueda'
            )
            BEGIN
                CREATE INDEX IX_MunicipiosColombia_Busqueda
                    ON dbo.MunicipiosColombia(nombre_completo_normalizado)
                    INCLUDE (nombre_completo, departamento, municipio);
            END;
        `);
    }

    static async contarMunicipios() {
        const pool = await getPool();
        const resultado = await pool.request().query(`
            SELECT COUNT(1) AS total
            FROM dbo.MunicipiosColombia;
        `);
        return resultado.recordset[0]?.total || 0;
    }

    static async reemplazarMunicipios(registrosMunicipios) {
        const pool = await getPool();
        const transaccion = new sql.Transaction(pool);

        await transaccion.begin();
        try {
            await new sql.Request(transaccion).query('TRUNCATE TABLE dbo.MunicipiosColombia;');

            const tabla = new sql.Table('dbo.MunicipiosColombia');
            tabla.create = false;
            tabla.columns.add('departamento', sql.NVarChar(120), { nullable: false });
            tabla.columns.add('municipio', sql.NVarChar(160), { nullable: false });
            tabla.columns.add('departamento_normalizado', sql.NVarChar(120), { nullable: false });
            tabla.columns.add('municipio_normalizado', sql.NVarChar(160), { nullable: false });
            tabla.columns.add('nombre_completo', sql.NVarChar(300), { nullable: false });
            tabla.columns.add('nombre_completo_normalizado', sql.NVarChar(300), { nullable: false });
            tabla.columns.add('codigo_dane', sql.Char(5), { nullable: true });
            tabla.columns.add('provincia', sql.NVarChar(120), { nullable: true });
            tabla.columns.add('fuente', sql.NVarChar(60), { nullable: false });

            for (const registro of registrosMunicipios) {
                tabla.rows.add(
                    registro.departamento,
                    registro.municipio,
                    registro.departamentoNormalizado,
                    registro.municipioNormalizado,
                    registro.nombreCompleto,
                    registro.nombreCompletoNormalizado,
                    registro.codigoDane || null,
                    registro.provincia || null,
                    'colombia-cities'
                );
            }

            await transaccion.request().bulk(tabla);
            await transaccion.commit();
        } catch (error) {
            await transaccion.rollback();
            throw error;
        }
    }

    static async buscarMunicipiosPorTexto(textoNormalizado, limite) {
        const pool = await getPool();
        const resultado = await pool.request()
            .input('textoInicio', sql.NVarChar(300), `${textoNormalizado}%`)
            .input('textoContiene', sql.NVarChar(300), `%${textoNormalizado}%`)
            .input('limite', sql.Int, limite)
            .query(`
                DECLARE @limiteBusqueda INT = IIF(@limite IS NULL OR @limite < 1, 12, @limite);

                SELECT TOP (@limiteBusqueda)
                    nombre_completo,
                    municipio,
                    departamento,
                    codigo_dane
                FROM dbo.MunicipiosColombia
                WHERE nombre_completo_normalizado LIKE @textoInicio
                   OR municipio_normalizado LIKE @textoInicio
                   OR departamento_normalizado LIKE @textoInicio
                   OR nombre_completo_normalizado LIKE @textoContiene
                ORDER BY
                    CASE WHEN nombre_completo_normalizado LIKE @textoInicio THEN 0 ELSE 1 END,
                    nombre_completo ASC;
            `);

        return resultado.recordset || [];
    }
}

module.exports = UbicacionModel;
