/**
 * CAPA DE DOMINIO: Modelo de datos para Inscripciones
 * Define la estructura y operaciones de la tabla Inscripciones en Azure SQL
 */

const { getPool, sql } = require('../config/database');

const TIPOS_PARTICIPANTE_PERMITIDOS = [
    'DAMA L.A.M.A.',
    'FULL COLOR MEMBER',
    'ROCKET PROSPECT',
    'PROSPECT',
    'ESPOSA (a)',
    'CONYUGUE',
    'PAREJA',
    'HIJA (o)',
    'INVITADA (O)'
];

const CAPITULOS_PERMITIDOS = [
    'Barranquilla', 'Bucaramanga', 'Cartagena', 'Cúcuta', 'Floridablanca',
    'Medellín', 'Puerto Colombia', 'Valle Aburrá', 'Zenu', 'Otros'
];

/**
 * Estructura del modelo Inscripción
 * @typedef {Object} Inscripcion
 * @property {number} id - ID autoincremental (generado por BD)
 * @property {string} tipo_participante - Tipo: 'miembro', 'simpatizante', 'prospecto'
 * @property {string} nombre_miembro - Nombre completo del participante
 * @property {string} documento - Número de documento de identidad
 * @property {string} eps - Entidad prestadora de salud
 * @property {string} contacto_emergencia - Nombre del contacto de emergencia
 * @property {string} tel_emergencia - Teléfono de emergencia
 * @property {string} capitulo - Capítulo al que pertenece
 * @property {string} cargo_directivo - Cargo directivo (si aplica)
 * @property {Date} fecha_llegada - Fecha de llegada al evento
 * @property {string} condicion_medica - Condiciones médicas especiales
 * @property {boolean} interes_jersey - Interés en adquirir jersey
 * @property {string} talla_jersey - Talla del jersey (XS, S, M, L, XL, XXL)
 * @property {boolean} asiste_acompanante - Si asiste con acompañante
 * @property {string} nombre_acompanante - Nombre del acompañante
 * @property {Date} fecha_registro - Fecha de registro (auto)
 */

/**
 * Script SQL para crear la tabla InscripcionesCampeonato
 * Ejecutar manualmente en Azure SQL Database
 */
const createTableScript = `
-- SCRIPT DE CREACIÓN DE TABLA: V CAMPEONATO DE MOTOTURISMO
-- Localización: San Andrés Islas | Organización: L.A.M.A. Región Norte

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InscripcionesCampeonato')
BEGIN
    CREATE TABLE InscripcionesCampeonato (
        -- Identificador único y fecha
        id_inscripcion INT IDENTITY(1,1) PRIMARY KEY,
        fecha_registro DATETIME DEFAULT GETDATE(),

        -- Información del Participante
        tipo_participante VARCHAR(50) NOT NULL CHECK (tipo_participante IN (
            'DAMA L.A.M.A.', 'FULL COLOR MEMBER', 'ROCKET PROSPECT', 'PROSPECT',
            'ESPOSA (a)', 'CONYUGUE', 'PAREJA', 'HIJA (o)', 'INVITADA (O)'
        )),
        nombre_completo VARCHAR(200) NOT NULL,
        documento_numero VARCHAR(30) NOT NULL UNIQUE, -- Evita inscripciones dobles
        eps VARCHAR(100) NOT NULL,

        -- Contacto de Emergencia
        emergencia_nombre VARCHAR(200) NOT NULL,
        emergencia_telefono VARCHAR(50) NOT NULL,

        -- Datos L.A.M.A.
        capitulo VARCHAR(50) NOT NULL CHECK (capitulo IN (
            'Barranquilla', 'Bucaramanga', 'Cartagena', 'Cúcuta',
            'Floridablanca', 'Medellín', 'Puerto Colombia', 'Valle Aburrá', 'Zenu', 'Otros'
        )),
        capitulo_otro VARCHAR(100) NULL, -- Se activa si el anterior es 'Otros'
        cargo_directivo VARCHAR(150) NULL, -- Ej: Presidente Capítulo, Tesorero Región, etc.

        -- Logística San Andrés
        fecha_llegada_isla DATE NOT NULL,
        condicion_medica NVARCHAR(MAX) NULL,

        -- Jersey y Opcionales
        adquiere_jersey BIT DEFAULT 0, -- 1 = Sí, 0 = No
        talla_jersey VARCHAR(10) NULL CHECK (talla_jersey IN ('S', 'M', 'L', 'XL', '2XL', '3XL')),
        asiste_con_acompanante BIT DEFAULT 0,
        nombre_acompanante VARCHAR(200) NULL,

        -- Información Financiera
        valor_base INT DEFAULT 150000,
        valor_jersey INT DEFAULT 70000,
        valor_total_pagar AS (150000 + (CASE WHEN adquiere_jersey = 1 THEN 70000 ELSE 0 END)),

        -- Estado del Proceso
        estado_validacion VARCHAR(20) DEFAULT 'Pendiente' -- Pendiente, Aprobado, Rechazado
    );
END
GO

-- Índice para optimizar búsquedas por cédula (Panel Administrativo)
CREATE INDEX IX_Participante_Cedula ON InscripcionesCampeonato(documento_numero);
GO
`;

class InscripcionModel {
    static async asegurarTablaBase() {
        const pool = await getPool();

        await pool.request().query(`
            IF OBJECT_ID('dbo.InscripcionesCampeonato', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.InscripcionesCampeonato (
                    id_inscripcion INT IDENTITY(1,1) PRIMARY KEY,
                    fecha_registro DATETIME DEFAULT GETDATE(),
                    tipo_participante VARCHAR(50) NOT NULL,
                    nombre_completo VARCHAR(200) NOT NULL,
                    documento_numero VARCHAR(30) NOT NULL UNIQUE,
                    eps VARCHAR(100) NOT NULL,
                    emergencia_nombre VARCHAR(200) NOT NULL,
                    emergencia_telefono VARCHAR(50) NOT NULL,
                    capitulo VARCHAR(50) NOT NULL,
                    capitulo_otro VARCHAR(100) NULL,
                    cargo_directivo VARCHAR(150) NULL,
                    fecha_llegada_isla DATE NOT NULL,
                    condicion_medica NVARCHAR(MAX) NULL,
                    adquiere_jersey BIT DEFAULT 0,
                    talla_jersey VARCHAR(10) NULL,
                    asiste_con_acompanante BIT DEFAULT 0,
                    nombre_acompanante VARCHAR(200) NULL,
                    valor_base INT DEFAULT 150000,
                    valor_jersey INT DEFAULT 70000,
                    valor_total_pagar AS (150000 + (CASE WHEN adquiere_jersey = 1 THEN 70000 ELSE 0 END)),
                    estado_validacion VARCHAR(20) DEFAULT 'Pendiente'
                );
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = 'IX_Participante_Cedula'
                  AND object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
            )
            BEGIN
                CREATE INDEX IX_Participante_Cedula ON dbo.InscripcionesCampeonato(documento_numero);
            END;
        `);
    }

    static normalizarTipoParticipante(valor) {
        const tipo = String(valor || '').trim();
        if (TIPOS_PARTICIPANTE_PERMITIDOS.includes(tipo)) {
            return tipo;
        }

        const texto = tipo.toLowerCase();
        if (texto.includes('dama')) return 'DAMA L.A.M.A.';
        if (texto.includes('full color')) return 'FULL COLOR MEMBER';
        if (texto.includes('rocket')) return 'ROCKET PROSPECT';
        if (texto.includes('prosp') || texto.includes('prospect')) return 'PROSPECT';
        if (texto.includes('esposa')) return 'ESPOSA (a)';
        if (texto.includes('conyuge')) return 'CONYUGUE';
        if (texto.includes('pareja')) return 'PAREJA';
        if (texto.includes('hija') || texto.includes('hijo')) return 'HIJA (o)';
        return 'INVITADA (O)';
    }

    static normalizarCapitulo(valor) {
        const capitulo = String(valor || '').trim();
        if (CAPITULOS_PERMITIDOS.includes(capitulo)) {
            return { capitulo, capitulo_otro: null };
        }

        const mapa = {
            'Barranquilla (Atlántico)': 'Barranquilla',
            'Bucaramanga (Santander)': 'Bucaramanga',
            'Cartagena (Bolívar)': 'Cartagena',
            'Cúcuta (Norte de Santander)': 'Cúcuta',
            'Floridablanca (Santander)': 'Floridablanca',
            'Medellín (Antioquia)': 'Medellín',
            'Puerto Colombia (Atlántico)': 'Puerto Colombia',
            'Valle de Aburrá (Antioquia)': 'Valle Aburrá',
            'Zenú (Sucre - Córdoba)': 'Zenu'
        };

        const normalizado = mapa[capitulo];
        if (normalizado && CAPITULOS_PERMITIDOS.includes(normalizado)) {
            return { capitulo: normalizado, capitulo_otro: null };
        }

        return { capitulo: 'Otros', capitulo_otro: capitulo ? capitulo.slice(0, 100) : null };
    }

    static async asegurarColumnasExtendidas() {
        await this.asegurarTablaBase();
        const pool = await getPool();

        await pool.request().query(`
            IF COL_LENGTH('InscripcionesCampeonato', 'evento_id') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD evento_id VARCHAR(80) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'origen_registro') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD origen_registro VARCHAR(40) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'acompanantes_json') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD acompanantes_json NVARCHAR(MAX) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'servicios_principal_json') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD servicios_principal_json NVARCHAR(MAX) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'servicios_acompanantes_json') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD servicios_acompanantes_json NVARCHAR(MAX) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'total_servicios') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD total_servicios INT NULL;
        `);

        await this.asegurarConstraintTiposParticipante(pool);
    }

    static async asegurarConstraintTiposParticipante(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            DECLARE @constraintName SYSNAME;

            SELECT TOP 1 @constraintName = cc.name
            FROM sys.check_constraints cc
            INNER JOIN sys.columns c
                ON c.object_id = cc.parent_object_id
               AND c.column_id = cc.parent_column_id
            WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
              AND c.name = 'tipo_participante';

            IF @constraintName IS NOT NULL
            BEGIN
                EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintName + ']');
            END

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'FULL COLOR MEMBER'
            WHERE tipo_participante = 'DAMA L.A.M.A. FULL COLOR MEMBER';

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'PROSPECT'
            WHERE tipo_participante = 'PROSP';

            IF NOT EXISTS (
                SELECT 1
                FROM sys.check_constraints cc
                INNER JOIN sys.columns c
                    ON c.object_id = cc.parent_object_id
                   AND c.column_id = cc.parent_column_id
                WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND c.name = 'tipo_participante'
            )
            BEGIN
                ALTER TABLE dbo.InscripcionesCampeonato
                ADD CONSTRAINT CK_InscripcionesCampeonato_tipo_participante
                CHECK (
                    tipo_participante IN (
                        'DAMA L.A.M.A.',
                        'FULL COLOR MEMBER',
                        'ROCKET PROSPECT',
                        'PROSPECT',
                        'ESPOSA (a)',
                        'CONYUGUE',
                        'PAREJA',
                        'HIJA (o)',
                        'INVITADA (O)'
                    )
                );
            END
        `);
    }

    static calcularCantidadAcompanantes(inscripcion) {
        try {
            const data = JSON.parse(inscripcion.acompanantes_json || '[]');
            if (Array.isArray(data) && data.length > 0) {
                return data.length;
            }
        } catch (error) {
        }

        return inscripcion.asiste_con_acompanante ? 1 : 0;
    }

    static calcularTotalReal(inscripcion) {
        const valorBase = Number(inscripcion.valor_base || 150000);
        const valorJersey = inscripcion.adquiere_jersey ? Number(inscripcion.valor_jersey || 70000) : 0;
        const cantidadAcompanantes = this.calcularCantidadAcompanantes(inscripcion);
        const valorAcompanantes = cantidadAcompanantes * 150000;
        const valorServicios = Number(inscripcion.total_servicios || 0);

        return valorBase + valorJersey + valorAcompanantes + valorServicios;
    }

    static normalizarInscripcionSalida(inscripcion) {
        return {
            ...inscripcion,
            valor_total_pagar: this.calcularTotalReal(inscripcion)
        };
    }

    static obtenerClaveServicio(servicio) {
        const valorBase = String(servicio?.servicio || servicio?.slug || servicio?.nombre || '').trim().toLowerCase();

        if (valorBase.includes('jet_ski') || valorBase.includes('jet ski')) return 'jet_ski';
        if (valorBase.includes('lancha')) return 'lancha_lujo';
        if (valorBase.includes('regata') || valorBase.includes('velero')) return 'regata_veleros';
        if (valorBase.includes('mula') || valorBase.includes('golf')) return 'mula_golfcart';

        return null;
    }

    static construirResumenServiciosPremium(inscripciones) {
        const acumulado = {
            jet_ski: { cantidad: 0, total: 0 },
            lancha_lujo: { cantidad: 0, total: 0 },
            regata_veleros: { cantidad: 0, total: 0 },
            mula_golfcart: { cantidad: 0, total: 0 }
        };

        const acumularServicios = (jsonServicios) => {
            if (!jsonServicios) return;
            try {
                const servicios = JSON.parse(jsonServicios);
                if (!Array.isArray(servicios)) return;

                for (const servicio of servicios) {
                    const clave = this.obtenerClaveServicio(servicio);
                    if (!clave || !acumulado[clave]) continue;
                    acumulado[clave].cantidad += 1;
                    acumulado[clave].total += Number(servicio?.precio || 0);
                }
            } catch (error) {
            }
        };

        for (const inscripcion of inscripciones) {
            acumularServicios(inscripcion.servicios_principal_json);
            acumularServicios(inscripcion.servicios_acompanantes_json);
        }

        return acumulado;
    }

    /**
     * Crea una nueva inscripción en la base de datos
     * @param {Inscripcion} inscripcionData - Datos de la inscripción
     * @returns {Promise<Object>} Resultado con el ID generado
     */
    static async create(inscripcionData) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();

            const tipoParticipante = this.normalizarTipoParticipante(inscripcionData.tipo_participante);
            const capituloNormalizado = this.normalizarCapitulo(inscripcionData.capitulo);

            // Parámetros de entrada con tipos específicos
            request.input('tipo_participante', sql.VarChar(50), tipoParticipante);
            request.input('nombre_completo', sql.VarChar(200), inscripcionData.nombre_completo);
            request.input('documento_numero', sql.VarChar(30), inscripcionData.documento_numero);
            request.input('eps', sql.VarChar(100), inscripcionData.eps);
            request.input('emergencia_nombre', sql.VarChar(200), inscripcionData.emergencia_nombre);
            request.input('emergencia_telefono', sql.VarChar(50), inscripcionData.emergencia_telefono);
            request.input('capitulo', sql.VarChar(50), capituloNormalizado.capitulo);
            request.input('capitulo_otro', sql.VarChar(100), inscripcionData.capitulo_otro || capituloNormalizado.capitulo_otro || null);
            request.input('cargo_directivo', sql.VarChar(150), inscripcionData.cargo_directivo || null);
            request.input('fecha_llegada_isla', sql.Date, new Date(inscripcionData.fecha_llegada_isla));
            request.input('condicion_medica', sql.NVarChar(sql.MAX), inscripcionData.condicion_medica || null);
            request.input('adquiere_jersey', sql.Bit, inscripcionData.adquiere_jersey ? 1 : 0);
            request.input('talla_jersey', sql.VarChar(10), inscripcionData.talla_jersey || null);
            request.input('asiste_con_acompanante', sql.Bit, inscripcionData.asiste_con_acompanante ? 1 : 0);
            request.input('nombre_acompanante', sql.VarChar(200), inscripcionData.nombre_acompanante || null);
            request.input('evento_id', sql.VarChar(80), inscripcionData.evento_id || null);
            request.input('origen_registro', sql.VarChar(40), inscripcionData.origen_registro || null);
            request.input('acompanantes_json', sql.NVarChar(sql.MAX), JSON.stringify(inscripcionData.acompanantes || []));
            request.input('servicios_principal_json', sql.NVarChar(sql.MAX), JSON.stringify(inscripcionData.servicios_principal || []));
            request.input('servicios_acompanantes_json', sql.NVarChar(sql.MAX), JSON.stringify(inscripcionData.servicios_acompanantes || []));
            request.input('total_servicios', sql.Int, Number.isFinite(inscripcionData.total_servicios) ? inscripcionData.total_servicios : null);

            const query = `
                INSERT INTO InscripcionesCampeonato (
                    tipo_participante, nombre_completo, documento_numero, eps,
                    emergencia_nombre, emergencia_telefono, capitulo, capitulo_otro,
                    cargo_directivo, fecha_llegada_isla, condicion_medica,
                    adquiere_jersey, talla_jersey, asiste_con_acompanante, nombre_acompanante,
                    evento_id, origen_registro, acompanantes_json, servicios_principal_json,
                    servicios_acompanantes_json, total_servicios
                )
                OUTPUT INSERTED.id_inscripcion, INSERTED.fecha_registro
                VALUES (
                    @tipo_participante, @nombre_completo, @documento_numero, @eps,
                    @emergencia_nombre, @emergencia_telefono, @capitulo, @capitulo_otro,
                    @cargo_directivo, @fecha_llegada_isla, @condicion_medica,
                    @adquiere_jersey, @talla_jersey, @asiste_con_acompanante, @nombre_acompanante,
                    @evento_id, @origen_registro, @acompanantes_json, @servicios_principal_json,
                    @servicios_acompanantes_json, @total_servicios
                )
            `;

            const result = await request.query(query);
            return {
                success: true,
                id: result.recordset[0].id_inscripcion,
                fecha_registro: result.recordset[0].fecha_registro
            };
        } catch (error) {
            console.error('Error en InscripcionModel.create:', error);
            throw error;
        }
    }

    /**
     * Busca una inscripción por documento
     * Útil para validar inscripciones duplicadas
     * @param {string} documento - Número de documento
     * @returns {Promise<Object|null>} Inscripción encontrada o null
     */
    static async findByDocumento(documento) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('documento', sql.VarChar(30), documento);

            const query = `
                SELECT * FROM InscripcionesCampeonato
                WHERE documento_numero = @documento
                ORDER BY fecha_registro DESC
            `;

            const result = await request.query(query);
            return result.recordset.length > 0 ? result.recordset[0] : null;
        } catch (error) {
            console.error('Error en InscripcionModel.findByDocumento:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las inscripciones
     * @returns {Promise<Array>} Lista de inscripciones
     */
    static async getAll() {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();

            const query = `
                SELECT * FROM InscripcionesCampeonato
                ORDER BY fecha_registro DESC
            `;

            const result = await request.query(query);
            return result.recordset.map((inscripcion) => this.normalizarInscripcionSalida(inscripcion));
        } catch (error) {
            console.error('Error en InscripcionModel.getAll:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de inscripciones
     * @returns {Promise<Object>} Objeto con estadísticas
     */
    static async getStats() {
        try {
            const inscripciones = await this.getAll();

            const totalInscripciones = inscripciones.length;
            const totalJerseys = inscripciones.filter((inscripcion) => inscripcion.adquiere_jersey).length;
            const totalAcompanantes = inscripciones.reduce((acumulado, inscripcion) => {
                return acumulado + this.calcularCantidadAcompanantes(inscripcion);
            }, 0);
            const totalPotencial = inscripciones.reduce((acumulado, inscripcion) => {
                return acumulado + Number(inscripcion.valor_total_pagar || 0);
            }, 0);

            const inscripcionesAprobadas = inscripciones.filter((inscripcion) => inscripcion.estado_validacion === 'Aprobado');
            const inscripcionesPendientes = inscripciones.filter((inscripcion) => inscripcion.estado_validacion === 'Pendiente');
            const inscripcionesRechazadas = inscripciones.filter((inscripcion) => inscripcion.estado_validacion === 'Rechazado');

            const totalRecaudado = inscripcionesAprobadas.reduce((acumulado, inscripcion) => {
                return acumulado + Number(inscripcion.valor_total_pagar || 0);
            }, 0);
            const montoPendiente = inscripcionesPendientes.reduce((acumulado, inscripcion) => {
                return acumulado + Number(inscripcion.valor_total_pagar || 0);
            }, 0);
            const montoRechazado = inscripcionesRechazadas.reduce((acumulado, inscripcion) => {
                return acumulado + Number(inscripcion.valor_total_pagar || 0);
            }, 0);

            const pagosConfirmados = inscripcionesAprobadas.length;
            const pagosPendientes = inscripcionesPendientes.length;
            const pagosRechazados = inscripcionesRechazadas.length;

            return {
                total_inscripciones: totalInscripciones,
                total_jerseys: totalJerseys,
                total_acompanantes: totalAcompanantes,
                total_recaudado: totalRecaudado,
                total_potencial: totalPotencial,
                monto_pendiente: montoPendiente,
                monto_rechazado: montoRechazado,
                pagos_confirmados: pagosConfirmados,
                pagos_pendientes: pagosPendientes,
                pagos_rechazados: pagosRechazados,
                servicios_premium: this.construirResumenServiciosPremium(inscripciones)
            };
        } catch (error) {
            console.error('Error en InscripcionModel.getStats:', error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de validación de una inscripción
     * @param {number} id - ID de la inscripción
     * @param {string} estado - Nuevo estado: 'Pendiente', 'Aprobado', 'Rechazado'
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async updateEstadoValidacion(id, estado) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);
            request.input('estado', sql.VarChar(20), estado);

            const query = `
                UPDATE InscripcionesCampeonato
                SET estado_validacion = @estado
                WHERE id_inscripcion = @id
            `;

            const result = await request.query(query);
            return {
                affectedRows: result.rowsAffected[0]
            };
        } catch (error) {
            console.error('Error en InscripcionModel.updateEstadoValidacion:', error);
            throw error;
        }
    }

    /**
     * Elimina una inscripción por ID
     * @param {number} id - ID de la inscripción
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async deleteById(id) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);

            const query = `
                DELETE FROM InscripcionesCampeonato
                WHERE id_inscripcion = @id
            `;

            const result = await request.query(query);
            return {
                affectedRows: result.rowsAffected[0]
            };
        } catch (error) {
            console.error('Error en InscripcionModel.deleteById:', error);
            throw error;
        }
    }
}

module.exports = {
    InscripcionModel,
    createTableScript
};
