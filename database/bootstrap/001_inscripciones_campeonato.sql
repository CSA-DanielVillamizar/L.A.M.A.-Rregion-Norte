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
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'evento_id') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD evento_id VARCHAR(80) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'origen_registro') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD origen_registro VARCHAR(40) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'acompanantes_json') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD acompanantes_json NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'servicios_principal_json') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD servicios_principal_json NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'servicios_acompanantes_json') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD servicios_acompanantes_json NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'total_servicios') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD total_servicios INT NULL;
GO

-- Boutique / Merchandising (kit oficial: gorra, camiseta, buff, parches)
IF COL_LENGTH('dbo.InscripcionesCampeonato', 'merchandising_json') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD merchandising_json NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'total_merchandising') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD total_merchandising INT NULL;
GO

-- Check-in por QR (punto de control MTO)
IF COL_LENGTH('dbo.InscripcionesCampeonato', 'qr_token') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD qr_token VARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'checkin_realizado') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD checkin_realizado BIT NOT NULL DEFAULT 0;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'checkin_fecha') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD checkin_fecha DATETIME NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'email') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD email VARCHAR(150) NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'fecha_nacimiento') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD fecha_nacimiento DATE NULL;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'telefono_celular') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD telefono_celular VARCHAR(50) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Inscripciones_QrToken'
      AND object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
)
BEGIN
    CREATE UNIQUE INDEX UX_Inscripciones_QrToken
        ON dbo.InscripcionesCampeonato(qr_token)
        WHERE qr_token IS NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Participante_Cedula'
      AND object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
)
BEGIN
    CREATE INDEX IX_Participante_Cedula ON dbo.InscripcionesCampeonato(documento_numero);
END;
GO

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
END;
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'MIEMBRO FULL COLOR (FCM)'
WHERE tipo_participante IN ('DAMA L.A.M.A. FULL COLOR MEMBER', 'FULL COLOR MEMBER');
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'PROSPECTO (P)'
WHERE tipo_participante IN ('PROSP', 'PROSPECT', 'ROCKET PROSPECT');
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'ESPOSA (O)'
WHERE tipo_participante IN ('ESPOSA (o)', 'CONYUGUE', 'PAREJA');
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'HIJO (A) (H)'
WHERE tipo_participante = 'HIJA (o)';
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'INVITADO (A) (I)'
WHERE tipo_participante = 'INVITADA (O)';
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'DAMA L.A.M.A. - FULL COLOR (FCM)'
WHERE tipo_participante = 'DAMA L.A.M.A.';
GO

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
            'MIEMBRO RETIRADO (PTR)',
            'HIJO (A) (H)',
            'INVITADO (A) (I)',
            'ESPOSA (O)',
            'DAMA L.A.M.A. - FULL COLOR (FCM)',
            'DAMA L.A.M.A. - PROSPECTO (P)'
        )
    );
END;
GO

IF COL_LENGTH('dbo.InscripcionesCampeonato', 'tipo_vehiculo') IS NULL
    ALTER TABLE dbo.InscripcionesCampeonato ADD tipo_vehiculo VARCHAR(20) NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints cc
    INNER JOIN sys.columns c
        ON c.object_id = cc.parent_object_id
       AND c.column_id = cc.parent_column_id
    WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND c.name = 'tipo_vehiculo'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT CK_InscripcionesCampeonato_tipo_vehiculo
    CHECK (tipo_vehiculo IS NULL OR tipo_vehiculo IN ('MOTO (M)', 'CARRO (C)', 'AVIÓN (A)'));
END;
GO

-- No se agrega un CHECK de capitulo aquí: el catálogo de capítulos
-- (src/data/paisesCapitulos.js) crece con el tiempo (p. ej. Rionegro se
-- sumó después) y una lista fija en la base de datos queda desactualizada
-- en silencio, causando el mismo tipo de fallo que un CHECK de
-- estado_validacion desincronizado. La validación de capítulo/país ya la
-- hace Joi (inscripcionValidator.js) contra ese catálogo, que es la única
-- fuente de verdad.

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND name = 'CK_InscripcionesCampeonato_talla_jersey'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT CK_InscripcionesCampeonato_talla_jersey
    CHECK (talla_jersey IS NULL OR talla_jersey IN ('S', 'M', 'L', 'XL', '2XL', '3XL'));
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND name = 'CK_InscripcionesCampeonato_estado_validacion'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT CK_InscripcionesCampeonato_estado_validacion
    CHECK (estado_validacion IN ('Pendiente', 'Aprobado', 'Rechazado'));
END;
GO
