-- Soporte para planillas de asistencia automaticas: coordenadas de la sede
-- (alcaldia) de cada capitulo, coordenadas del evento, y el roster fijo de
-- oficiales de cada capitulo (para la tabla "Oficiales asistentes" de la
-- planilla LAMA).

IF OBJECT_ID('dbo.Capitulos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Capitulos (
        id_capitulo INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(150) NOT NULL,
        pais NVARCHAR(100) NOT NULL,
        latitud DECIMAL(10,7) NULL,
        longitud DECIMAL(10,7) NULL,
        fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Capitulos_nombre_pais UNIQUE (nombre, pais)
    );
END
GO

IF OBJECT_ID('dbo.CapitulosOficiales', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CapitulosOficiales (
        id_oficial INT IDENTITY(1,1) PRIMARY KEY,
        id_capitulo INT NOT NULL,
        cargo VARCHAR(60) NOT NULL,
        nombre_completo NVARCHAR(200) NULL,
        documento_numero VARCHAR(30) NULL,
        CONSTRAINT FK_CapitulosOficiales_Capitulo
            FOREIGN KEY (id_capitulo) REFERENCES dbo.Capitulos(id_capitulo)
            ON DELETE CASCADE,
        CONSTRAINT UQ_CapitulosOficiales_capitulo_cargo UNIQUE (id_capitulo, cargo),
        CONSTRAINT CK_CapitulosOficiales_cargo CHECK (
            cargo IN (
                'Oficial Regional',
                'Oficial Int/Cont/Nac/Reg',
                'Presidente',
                'Vice Presidente',
                'Tesorero',
                'Gerente Negocios',
                'Secretario',
                'Oficial de Mototurismo'
            )
        )
    );
END
GO

IF COL_LENGTH('dbo.EventosLama', 'latitud') IS NULL
    ALTER TABLE dbo.EventosLama ADD latitud DECIMAL(10,7) NULL;
GO

IF COL_LENGTH('dbo.EventosLama', 'longitud') IS NULL
    ALTER TABLE dbo.EventosLama ADD longitud DECIMAL(10,7) NULL;
GO

-- País de la sede del evento: necesario para decidir si un capítulo y el
-- evento comparten continente (distancia por carretera) o no (distancia
-- aérea) en el cálculo de la planilla de asistencia.
IF COL_LENGTH('dbo.EventosLama', 'pais') IS NULL
    ALTER TABLE dbo.EventosLama ADD pais NVARCHAR(100) NULL;
GO
