/**
 * CAPA DE DOMINIO: Modelo de datos para Inscripciones
 * Define la estructura y operaciones de la tabla Inscripciones en Azure SQL
 */

const crypto = require('crypto');
const { getPool, sql } = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

const TIPOS_PARTICIPANTE_PERMITIDOS = [
    'MIEMBRO FULL COLOR (FCM)',
    'PROSPECTO (P)',
    'ASOCIADO (A) (ASC)',
    'MIEMBRO HONORARIO (HNR)',
    'MIEMBRO RETIRADO (RTR)',
    'HIJO (A) (H)',
    'INVITADO (A) (I)',
    'ESPOSA (O)',
    'DAMA L.A.M.A. - FULL COLOR (FCM)',
    'DAMA L.A.M.A. - PROSPECTO (P)'
];

const TIPOS_VEHICULO_PERMITIDOS = ['MOTO (M)', 'CARRO (C)', 'AVIÓN (A)'];

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
 * @property {string} talla_jersey - Talla del jersey (S, M, L, XL, 2XL)
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
            'MIEMBRO FULL COLOR (FCM)', 'PROSPECTO (P)', 'ASOCIADO (A) (ASC)',
            'MIEMBRO HONORARIO (HNR)', 'MIEMBRO RETIRADO (RTR)', 'HIJO (A) (H)',
            'INVITADO (A) (I)', 'ESPOSA (O)', 'DAMA L.A.M.A. - FULL COLOR (FCM)',
            'DAMA L.A.M.A. - PROSPECTO (P)'
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
        valor_base INT DEFAULT 100000,
        valor_jersey INT DEFAULT 65000,
        valor_total_pagar AS (100000 + (CASE WHEN adquiere_jersey = 1 THEN 65000 ELSE 0 END)),

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
                    valor_base INT DEFAULT 100000,
                    valor_jersey INT DEFAULT 65000,
                    valor_total_pagar AS (100000 + (CASE WHEN adquiere_jersey = 1 THEN 65000 ELSE 0 END)),
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

        await this.asegurarValorBaseActualizado(pool);
        await this.asegurarValorJerseyActualizado(pool);
    }

    /**
     * El valor base de inscripción bajó de $150.000 a $100.000. Para una tabla
     * ya existente (creada antes de este cambio) el DEFAULT de valor_base y la
     * fórmula del computado valor_total_pagar quedan con el valor viejo hasta
     * que se corrigen explícitamente aquí.
     */
    static async asegurarValorBaseActualizado(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.default_constraints
                WHERE name = 'DF_InscripcionesCampeonato_valor_base'
                  AND parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
            )
            BEGIN
                DECLARE @constraintValorBase SYSNAME;

                SELECT TOP 1 @constraintValorBase = dc.name
                FROM sys.default_constraints dc
                INNER JOIN sys.columns c
                    ON c.object_id = dc.parent_object_id
                   AND c.column_id = dc.parent_column_id
                WHERE dc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND c.name = 'valor_base';

                IF @constraintValorBase IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintValorBase + ']');
                END

                ALTER TABLE dbo.InscripcionesCampeonato
                ADD CONSTRAINT DF_InscripcionesCampeonato_valor_base DEFAULT 100000 FOR valor_base;
            END

            IF NOT EXISTS (
                SELECT 1 FROM sys.computed_columns cc
                WHERE cc.object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND cc.name = 'valor_total_pagar'
                  AND cc.definition LIKE '%100000%'
            )
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                      AND name = 'valor_total_pagar'
                )
                BEGIN
                    ALTER TABLE dbo.InscripcionesCampeonato DROP COLUMN valor_total_pagar;
                END

                ALTER TABLE dbo.InscripcionesCampeonato
                ADD valor_total_pagar AS (100000 + (CASE WHEN adquiere_jersey = 1 THEN 70000 ELSE 0 END));
            END
        `);
    }

    /**
     * La Camiseta Oficial bajó de $70.000 a $65.000. Para una tabla ya
     * existente (creada antes de este cambio) el DEFAULT de valor_jersey y la
     * fórmula del computado valor_total_pagar quedan con el valor viejo hasta
     * que se corrigen explícitamente aquí.
     */
    static async asegurarValorJerseyActualizado(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.default_constraints
                WHERE name = 'DF_InscripcionesCampeonato_valor_jersey'
                  AND parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
            )
            BEGIN
                DECLARE @constraintValorJersey SYSNAME;

                SELECT TOP 1 @constraintValorJersey = dc.name
                FROM sys.default_constraints dc
                INNER JOIN sys.columns c
                    ON c.object_id = dc.parent_object_id
                   AND c.column_id = dc.parent_column_id
                WHERE dc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND c.name = 'valor_jersey';

                IF @constraintValorJersey IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintValorJersey + ']');
                END

                ALTER TABLE dbo.InscripcionesCampeonato
                ADD CONSTRAINT DF_InscripcionesCampeonato_valor_jersey DEFAULT 65000 FOR valor_jersey;
            END

            IF NOT EXISTS (
                SELECT 1 FROM sys.computed_columns cc
                WHERE cc.object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND cc.name = 'valor_total_pagar'
                  AND cc.definition LIKE '%65000%'
            )
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                      AND name = 'valor_total_pagar'
                )
                BEGIN
                    ALTER TABLE dbo.InscripcionesCampeonato DROP COLUMN valor_total_pagar;
                END

                ALTER TABLE dbo.InscripcionesCampeonato
                ADD valor_total_pagar AS (100000 + (CASE WHEN adquiere_jersey = 1 THEN 65000 ELSE 0 END));
            END
        `);
    }

    static normalizarTipoParticipante(valor) {
        const tipo = String(valor || '').trim();
        if (TIPOS_PARTICIPANTE_PERMITIDOS.includes(tipo)) {
            return tipo;
        }

        const texto = tipo.toLowerCase();
        const esDama = texto.includes('dama');
        const esProspecto = texto.includes('prospect') || texto.includes('prosp') || texto.includes('(p)');

        if (esDama) {
            return esProspecto ? 'DAMA L.A.M.A. - PROSPECTO (P)' : 'DAMA L.A.M.A. - FULL COLOR (FCM)';
        }
        if (texto.includes('full color') || texto.includes('fcm')) return 'MIEMBRO FULL COLOR (FCM)';
        if (texto.includes('honorari') || texto.includes('hnr')) return 'MIEMBRO HONORARIO (HNR)';
        if (texto.includes('retirad') || texto.includes('rtr')) return 'MIEMBRO RETIRADO (RTR)';
        if (texto.includes('asociad') || texto.includes('asc')) return 'ASOCIADO (A) (ASC)';
        if (esProspecto) return 'PROSPECTO (P)';
        if (texto.includes('esposa') || texto.includes('conyug') || texto.includes('pareja')) return 'ESPOSA (O)';
        if (texto.includes('hij')) return 'HIJO (A) (H)';
        return 'INVITADO (A) (I)';
    }

    static normalizarTipoVehiculo(valor) {
        if (!valor) return null;
        const tipo = String(valor).trim();
        if (TIPOS_VEHICULO_PERMITIDOS.includes(tipo)) {
            return tipo;
        }

        const texto = tipo.toLowerCase();
        if (texto.includes('moto') || texto === 'm') return 'MOTO (M)';
        if (texto.includes('carro') || texto.includes('auto') || texto === 'c') return 'CARRO (C)';
        if (texto.includes('avi') || texto === 'a') return 'AVIÓN (A)';
        return null;
    }

    /**
     * El capítulo ya no está restringido a los 9 capítulos de Colombia: se valida
     * contra el diccionario global País -> Capítulo en la capa de controlador
     * (ver src/data/paisesCapitulos.js). Aquí solo se normaliza el texto recibido.
     */
    static normalizarCapitulo(valor) {
        const capitulo = String(valor || '').trim();
        return { capitulo: capitulo.slice(0, 100), capitulo_otro: null };
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

            IF COL_LENGTH('InscripcionesCampeonato', 'pais') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD pais VARCHAR(100) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'comprobante_nombre_archivo') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD comprobante_nombre_archivo NVARCHAR(260) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'comprobante_mime') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD comprobante_mime NVARCHAR(120) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'comprobante_tamano_bytes') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD comprobante_tamano_bytes INT NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'comprobante_contenido') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD comprobante_contenido VARBINARY(MAX) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'merchandising_json') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD merchandising_json NVARCHAR(MAX) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'total_merchandising') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD total_merchandising INT NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'qr_token') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD qr_token VARCHAR(64) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'checkin_realizado') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD checkin_realizado BIT NOT NULL DEFAULT 0;

            IF COL_LENGTH('InscripcionesCampeonato', 'checkin_fecha') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD checkin_fecha DATETIME NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'email') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD email VARCHAR(150) NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'fecha_nacimiento') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD fecha_nacimiento DATE NULL;

            IF COL_LENGTH('InscripcionesCampeonato', 'telefono_celular') IS NULL
                ALTER TABLE InscripcionesCampeonato ADD telefono_celular VARCHAR(50) NULL;
        `);

        await this.asegurarConstraintTiposParticipante(pool);
        await this.asegurarColumnaCapituloGlobal(pool);
        await this.asegurarColumnaEstadoValidacionAmpliada(pool);
        await this.asegurarIndiceQrToken(pool);
    }

    /**
     * Índice único filtrado: garantiza unicidad del token QR sin bloquear
     * los registros que todavía no tienen QR asignado (qr_token NULL).
     */
    static async asegurarIndiceQrToken(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes
                WHERE name = 'UX_Inscripciones_QrToken'
                  AND object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
            )
            BEGIN
                CREATE UNIQUE INDEX UX_Inscripciones_QrToken
                    ON dbo.InscripcionesCampeonato(qr_token)
                    WHERE qr_token IS NOT NULL;
            END
        `);
    }

    /**
     * El capítulo dejó de estar restringido a los 9 capítulos de Colombia:
     * ahora acepta cualquier capítulo del diccionario global País -> Capítulo.
     * Se elimina el CHECK constraint heredado y se amplía la longitud de la columna.
     */
    static async asegurarColumnaCapituloGlobal(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            DECLARE @constraintNameCapitulo SYSNAME;

            SELECT TOP 1 @constraintNameCapitulo = cc.name
            FROM sys.check_constraints cc
            INNER JOIN sys.columns c
                ON c.object_id = cc.parent_object_id
               AND c.column_id = cc.parent_column_id
            WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
              AND c.name = 'capitulo';

            IF @constraintNameCapitulo IS NOT NULL
            BEGIN
                EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintNameCapitulo + ']');
            END

            IF EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND name = 'capitulo'
                  AND max_length < 100
            )
            BEGIN
                ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN capitulo VARCHAR(100) NOT NULL;
            END
        `);
    }

    /**
     * Amplía estado_validacion a VARCHAR(40) (histórico: un estado anterior
     * más descriptivo lo necesitaba). El estado por defecto actual es
     * 'Pendiente', el único junto con 'Aprobado'/'Rechazado' que permite el
     * CHECK CK_InscripcionesCampeonato_estado_validacion.
     */
    static async asegurarColumnaEstadoValidacionAmpliada(poolParam = null) {
        const pool = poolParam || await getPool();

        await pool.request().query(`
            IF EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
                  AND name = 'estado_validacion'
                  AND max_length < 40
            )
            BEGIN
                ALTER TABLE dbo.InscripcionesCampeonato ALTER COLUMN estado_validacion VARCHAR(40) NOT NULL;
            END
        `);
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
            SET tipo_participante = 'MIEMBRO FULL COLOR (FCM)'
            WHERE tipo_participante IN ('DAMA L.A.M.A. FULL COLOR MEMBER', 'FULL COLOR MEMBER');

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'PROSPECTO (P)'
            WHERE tipo_participante IN ('PROSP', 'PROSPECT', 'ROCKET PROSPECT');

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'ESPOSA (O)'
            WHERE tipo_participante IN ('ESPOSA (o)', 'CONYUGUE', 'PAREJA');

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'HIJO (A) (H)'
            WHERE tipo_participante = 'HIJA (o)';

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'INVITADO (A) (I)'
            WHERE tipo_participante = 'INVITADA (O)';

            UPDATE InscripcionesCampeonato
            SET tipo_participante = 'DAMA L.A.M.A. - FULL COLOR (FCM)'
            WHERE tipo_participante = 'DAMA L.A.M.A.';

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
                        'MIEMBRO FULL COLOR (FCM)',
                        'PROSPECTO (P)',
                        'ASOCIADO (A) (ASC)',
                        'MIEMBRO HONORARIO (HNR)',
                        'MIEMBRO RETIRADO (RTR)',
                        'HIJO (A) (H)',
                        'INVITADO (A) (I)',
                        'ESPOSA (O)',
                        'DAMA L.A.M.A. - FULL COLOR (FCM)',
                        'DAMA L.A.M.A. - PROSPECTO (P)'
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
        const valorBase = Number(inscripcion.valor_base || 100000);
        const valorJersey = inscripcion.adquiere_jersey ? Number(inscripcion.valor_jersey || 65000) : 0;
        const cantidadAcompanantes = this.calcularCantidadAcompanantes(inscripcion);
        const valorAcompanantes = cantidadAcompanantes * 100000;
        const valorServicios = Number(inscripcion.total_servicios || 0);
        const valorMerchandising = Number(inscripcion.total_merchandising || 0);

        return valorBase + valorJersey + valorAcompanantes + valorServicios + valorMerchandising;
    }

    static normalizarInscripcionSalida(inscripcion) {
        return {
            ...inscripcion,
            eps: decrypt(inscripcion.eps),
            emergencia_nombre: decrypt(inscripcion.emergencia_nombre),
            emergencia_telefono: decrypt(inscripcion.emergencia_telefono),
            condicion_medica: decrypt(inscripcion.condicion_medica),
            telefono_celular: decrypt(inscripcion.telefono_celular),
            valor_total_pagar: this.calcularTotalReal(inscripcion)
        };
    }

    /**
     * Construye el conteo de unidades de boutique/merchandising a preparar
     * (kit de bienvenida): útil para el empaque físico previo al evento.
     */
    static construirResumenMerchandising(inscripciones) {
        const resumen = {};

        for (const inscripcion of inscripciones) {
            if (!inscripcion.merchandising_json) continue;

            let items = [];
            try {
                items = JSON.parse(inscripcion.merchandising_json);
            } catch (error) {
                continue;
            }

            if (!Array.isArray(items)) continue;

            for (const item of items) {
                const clave = String(item?.item || item?.nombre || '').trim();
                if (!clave) continue;

                const talla = item?.talla ? String(item.talla).trim() : null;
                const llaveResumen = talla ? `${clave} (${talla})` : clave;
                const cantidad = Number(item?.cantidad) > 0 ? Number(item.cantidad) : 1;
                const total = Number(item?.precio_total ?? (item?.precio || 0) * cantidad);

                if (!resumen[llaveResumen]) {
                    resumen[llaveResumen] = { cantidad: 0, total: 0 };
                }

                resumen[llaveResumen].cantidad += cantidad;
                resumen[llaveResumen].total += total;
            }
        }

        return resumen;
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
            const tipoVehiculo = this.normalizarTipoVehiculo(inscripcionData.tipo_vehiculo);
            const capituloNormalizado = this.normalizarCapitulo(inscripcionData.capitulo);

            // Parámetros de entrada con tipos específicos
            request.input('tipo_participante', sql.VarChar(50), tipoParticipante);
            request.input('tipo_vehiculo', sql.VarChar(20), tipoVehiculo);
            request.input('nombre_completo', sql.VarChar(200), inscripcionData.nombre_completo);
            request.input('documento_numero', sql.VarChar(30), inscripcionData.documento_numero);
            request.input('eps', sql.VarChar(500), encrypt(inscripcionData.eps));
            request.input('emergencia_nombre', sql.VarChar(500), encrypt(inscripcionData.emergencia_nombre));
            request.input('emergencia_telefono', sql.VarChar(500), encrypt(inscripcionData.emergencia_telefono));
            request.input('capitulo', sql.VarChar(50), capituloNormalizado.capitulo);
            request.input('capitulo_otro', sql.VarChar(100), inscripcionData.capitulo_otro || capituloNormalizado.capitulo_otro || null);
            request.input('cargo_directivo', sql.VarChar(150), inscripcionData.cargo_directivo || null);
            request.input('fecha_llegada_isla', sql.Date, new Date(inscripcionData.fecha_llegada_isla));
            request.input('condicion_medica', sql.NVarChar(sql.MAX), encrypt(inscripcionData.condicion_medica || null));
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
            request.input('merchandising_json', sql.NVarChar(sql.MAX), JSON.stringify(inscripcionData.merchandising || []));
            request.input('total_merchandising', sql.Int, Number.isFinite(inscripcionData.total_merchandising) ? inscripcionData.total_merchandising : 0);
            request.input('pais', sql.VarChar(100), inscripcionData.pais || null);
            request.input('estado_validacion', sql.VarChar(40), inscripcionData.estado_validacion || 'Pendiente');
            request.input('comprobante_nombre_archivo', sql.NVarChar(260), inscripcionData.comprobante_nombre_archivo || null);
            request.input('comprobante_mime', sql.NVarChar(120), inscripcionData.comprobante_mime || null);
            request.input('comprobante_tamano_bytes', sql.Int, Number.isFinite(inscripcionData.comprobante_tamano_bytes) ? inscripcionData.comprobante_tamano_bytes : null);
            request.input('comprobante_contenido', sql.VarBinary(sql.MAX), inscripcionData.comprobante_contenido || null);
            request.input('email', sql.VarChar(150), inscripcionData.email || null);
            request.input('fecha_nacimiento', sql.Date, inscripcionData.fecha_nacimiento ? new Date(inscripcionData.fecha_nacimiento) : null);
            request.input('telefono_celular', sql.VarChar(500), encrypt(inscripcionData.telefono_celular || null));

            const query = `
                INSERT INTO InscripcionesCampeonato (
                    tipo_participante, tipo_vehiculo, nombre_completo, documento_numero, eps,
                    emergencia_nombre, emergencia_telefono, capitulo, capitulo_otro,
                    cargo_directivo, fecha_llegada_isla, condicion_medica,
                    adquiere_jersey, talla_jersey, asiste_con_acompanante, nombre_acompanante,
                    evento_id, origen_registro, acompanantes_json, servicios_principal_json,
                    servicios_acompanantes_json, total_servicios, merchandising_json, total_merchandising,
                    pais, estado_validacion,
                    comprobante_nombre_archivo, comprobante_mime, comprobante_tamano_bytes,
                    comprobante_contenido, email, fecha_nacimiento, telefono_celular
                )
                OUTPUT INSERTED.id_inscripcion, INSERTED.fecha_registro
                VALUES (
                    @tipo_participante, @tipo_vehiculo, @nombre_completo, @documento_numero, @eps,
                    @emergencia_nombre, @emergencia_telefono, @capitulo, @capitulo_otro,
                    @cargo_directivo, @fecha_llegada_isla, @condicion_medica,
                    @adquiere_jersey, @talla_jersey, @asiste_con_acompanante, @nombre_acompanante,
                    @evento_id, @origen_registro, @acompanantes_json, @servicios_principal_json,
                    @servicios_acompanantes_json, @total_servicios, @merchandising_json, @total_merchandising,
                    @pais, @estado_validacion,
                    @comprobante_nombre_archivo, @comprobante_mime, @comprobante_tamano_bytes,
                    @comprobante_contenido, @email, @fecha_nacimiento, @telefono_celular
                )
            `;

            const result = await request.query(query);
            return {
                success: true,
                id: result.recordset[0].id_inscripcion,
                fecha_registro: result.recordset[0].fecha_registro
            };
        } catch (error) {
            logger.error('Error en InscripcionModel.create', { error });
            throw error;
        }
    }

    /**
     * Busca una inscripción por documento
     * Útil para validar inscripciones duplicadas
     * @param {string} documento - Número de documento
     * @returns {Promise<Object|null>} Inscripción encontrada o null
     */
    static async findByDocumento(documento, eventoId = null) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('documento', sql.VarChar(30), documento);

            let query = `
                SELECT * FROM InscripcionesCampeonato
                WHERE documento_numero = @documento
            `;
            if (eventoId) {
                request.input('evento_id', sql.VarChar(120), eventoId);
                query += ' AND evento_id = @evento_id';
            }
            query += ' ORDER BY fecha_registro DESC';

            const result = await request.query(query);
            return result.recordset.length > 0
                ? this.normalizarInscripcionSalida(result.recordset[0])
                : null;
        } catch (error) {
            logger.error('Error en InscripcionModel.findByDocumento', { error });
            throw error;
        }
    }

    /**
     * Busca una inscripción para el portal público "Buscar mi inscripción"
     * por documento O por email (decisión de producto: priorizar UX de un
     * solo campo sobre exigir ambos como segundo factor). Devuelve un DTO
     * reducido: nunca expone comprobante_contenido (el binario del archivo)
     * ni datos de contacto de emergencia.
     * @param {string} identificador - Documento o email del socio
     * @returns {Promise<Object|null>}
     */
    static async buscarPorIdentificador(identificador) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('identificador', sql.VarChar(150), String(identificador).trim().toLowerCase());

            const result = await request.query(`
                SELECT TOP 1
                    id_inscripcion, nombre_completo, documento_numero, tipo_participante, capitulo,
                    capitulo_otro, fecha_registro, estado_validacion, adquiere_jersey,
                    talla_jersey, asiste_con_acompanante, nombre_acompanante,
                    servicios_principal_json, total_servicios,
                    merchandising_json, total_merchandising, valor_base, valor_jersey,
                    comprobante_nombre_archivo, checkin_realizado, checkin_fecha
                FROM InscripcionesCampeonato
                WHERE LOWER(LTRIM(RTRIM(documento_numero))) = @identificador
                   OR LOWER(LTRIM(RTRIM(email))) = @identificador
                ORDER BY fecha_registro DESC
            `);

            if (result.recordset.length === 0) return null;

            const inscripcion = result.recordset[0];
            return {
                ...this.normalizarInscripcionSalida(inscripcion),
                tiene_comprobante: Boolean(inscripcion.comprobante_nombre_archivo)
            };
        } catch (error) {
            logger.error('Error en InscripcionModel.buscarPorIdentificador', { error });
            throw error;
        }
    }

    /**
     * Adjunta o reemplaza el comprobante de pago de una inscripción ya
     * existente. Pensado para el flujo de "pre-inscripción sin pago": el
     * socio llena el formulario primero y sube el comprobante despues,
     * sin volver a diligenciar sus datos. Usa el mismo criterio de
     * documento-o-email que buscarPorIdentificador.
     * @param {string} identificador - Documento o email del socio
     * @param {{nombreArchivo:string, mime:string, tamanoBytes:number, contenido:Buffer}} archivo
     * @returns {Promise<Object|null>} Inscripción actualizada o null si no existe
     */
    static async actualizarComprobante(identificador, archivo) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('identificador', sql.VarChar(150), String(identificador).trim().toLowerCase());
            request.input('comprobante_nombre_archivo', sql.NVarChar(260), archivo.nombreArchivo || null);
            request.input('comprobante_mime', sql.NVarChar(120), archivo.mime || null);
            request.input('comprobante_tamano_bytes', sql.Int, Number.isFinite(archivo.tamanoBytes) ? archivo.tamanoBytes : null);
            request.input('comprobante_contenido', sql.VarBinary(sql.MAX), archivo.contenido || null);

            const result = await request.query(`
                UPDATE InscripcionesCampeonato
                SET comprobante_nombre_archivo = @comprobante_nombre_archivo,
                    comprobante_mime = @comprobante_mime,
                    comprobante_tamano_bytes = @comprobante_tamano_bytes,
                    comprobante_contenido = @comprobante_contenido
                OUTPUT INSERTED.id_inscripcion
                WHERE LOWER(LTRIM(RTRIM(documento_numero))) = @identificador
                   OR LOWER(LTRIM(RTRIM(email))) = @identificador
            `);

            return result.recordset.length > 0 ? result.recordset[0] : null;
        } catch (error) {
            logger.error('Error en InscripcionModel.actualizarComprobante', { error });
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
            logger.error('Error en InscripcionModel.getAll', { error });
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
                merchandising: this.construirResumenMerchandising(inscripciones)
            };
        } catch (error) {
            logger.error('Error en InscripcionModel.getStats', { error });
            throw error;
        }
    }

    /**
     * Obtiene una inscripción por su ID
     * @param {number} id - ID de la inscripción
     * @returns {Promise<Object|null>} Inscripción encontrada o null
     */
    static async getById(id) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const request = pool.request();
            request.input('id', sql.Int, id);

            const result = await request.query(`
                SELECT * FROM InscripcionesCampeonato WHERE id_inscripcion = @id
            `);

            return result.recordset.length > 0
                ? this.normalizarInscripcionSalida(result.recordset[0])
                : null;
        } catch (error) {
            logger.error('Error en InscripcionModel.getById', { error });
            throw error;
        }
    }

    /**
     * Genera un token opaco de alta entropía para el QR de check-in
     * @returns {string}
     */
    static generarTokenQr() {
        return crypto.randomBytes(24).toString('hex');
    }

    /**
     * Asegura que una inscripción tenga un token QR asignado (idempotente).
     * Se invoca al aprobar el pago de una inscripción.
     * @param {number} id - ID de la inscripción
     * @returns {Promise<string|null>} Token QR (existente o recién generado)
     */
    static async asignarQrToken(id) {
        await this.asegurarColumnasExtendidas();
        const pool = await getPool();

        const actual = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT qr_token FROM InscripcionesCampeonato WHERE id_inscripcion = @id');

        if (actual.recordset.length === 0) {
            return null;
        }

        if (actual.recordset[0].qr_token) {
            return actual.recordset[0].qr_token;
        }

        for (let intento = 0; intento < 5; intento += 1) {
            const token = this.generarTokenQr();
            try {
                await pool.request()
                    .input('id', sql.Int, id)
                    .input('token', sql.VarChar(64), token)
                    .query('UPDATE InscripcionesCampeonato SET qr_token = @token WHERE id_inscripcion = @id');
                return token;
            } catch (error) {
                if (intento === 4) throw error;
            }
        }

        return null;
    }

    /**
     * Busca una inscripción por su token QR (punto de control MTO)
     * @param {string} token
     * @returns {Promise<Object|null>}
     */
    static async obtenerPorQrToken(token) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('token', sql.VarChar(64), token);

            const result = await request.query(`
                SELECT * FROM InscripcionesCampeonato WHERE qr_token = @token
            `);

            return result.recordset.length > 0
                ? this.normalizarInscripcionSalida(result.recordset[0])
                : null;
        } catch (error) {
            logger.error('Error en InscripcionModel.obtenerPorQrToken', { error });
            throw error;
        }
    }

    /**
     * Marca el check-in de un participante en el punto de control (idempotente:
     * solo aplica si el pago está Aprobado y aún no se había marcado check-in).
     * @param {string} token
     * @returns {Promise<Object|null>} Datos del check-in confirmado o null si no aplicó
     */
    static async confirmarCheckin(token) {
        try {
            const pool = await getPool();
            const request = pool.request();
            request.input('token', sql.VarChar(64), token);

            const result = await request.query(`
                UPDATE InscripcionesCampeonato
                SET checkin_realizado = 1, checkin_fecha = GETDATE()
                OUTPUT INSERTED.id_inscripcion, INSERTED.nombre_completo, INSERTED.checkin_fecha
                WHERE qr_token = @token
                  AND estado_validacion = 'Aprobado'
                  AND checkin_realizado = 0
            `);

            return result.recordset.length > 0 ? result.recordset[0] : null;
        } catch (error) {
            logger.error('Error en InscripcionModel.confirmarCheckin', { error });
            throw error;
        }
    }

    /**
     * Inscripciones con asistencia validada (check-in confirmado por el MTO)
     * para un evento, usadas para armar las planillas de asistencia. Se
     * agrupan por capítulo del lado del servicio, no aquí, para poder
     * generar de una vez el listado de capítulos con asistentes.
     * @param {string} eventoId
     * @returns {Promise<Array>}
     */
    static async obtenerCheckinValidadoPorEvento(eventoId) {
        try {
            await this.asegurarColumnasExtendidas();
            const pool = await getPool();
            const result = await pool.request()
                .input('evento_id', sql.VarChar(80), eventoId)
                .query(`
                    SELECT
                        id_inscripcion, nombre_completo, documento_numero, tipo_participante,
                        tipo_vehiculo, pais, capitulo, capitulo_otro, asiste_con_acompanante,
                        cargo_directivo, checkin_realizado, checkin_fecha
                    FROM InscripcionesCampeonato
                    WHERE evento_id = @evento_id AND checkin_realizado = 1
                    ORDER BY capitulo ASC, nombre_completo ASC
                `);
            return result.recordset;
        } catch (error) {
            logger.error('Error en InscripcionModel.obtenerCheckinValidadoPorEvento', { error });
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
            logger.error('Error en InscripcionModel.updateEstadoValidacion', { error });
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
            logger.error('Error en InscripcionModel.deleteById', { error });
            throw error;
        }
    }
}

module.exports = {
    InscripcionModel,
    createTableScript
};
