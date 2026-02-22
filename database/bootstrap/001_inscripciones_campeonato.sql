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
SET tipo_participante = 'FULL COLOR MEMBER'
WHERE tipo_participante = 'DAMA L.A.M.A. FULL COLOR MEMBER';
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'PROSPECT'
WHERE tipo_participante = 'PROSP';
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
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND name = 'CK_InscripcionesCampeonato_capitulo'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT CK_InscripcionesCampeonato_capitulo
    CHECK (
        capitulo IN (
            'Barranquilla',
            'Bucaramanga',
            'Cartagena',
            'Cúcuta',
            'Floridablanca',
            'Medellín',
            'Puerto Colombia',
            'Valle Aburrá',
            'Zenu',
            'Otros'
        )
    );
END;
GO

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
