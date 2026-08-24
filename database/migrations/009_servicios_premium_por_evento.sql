-- Servicios/atracciones premium opcionales por evento: el organizador de
-- cada evento puede (no es obligatorio) cargar actividades adicionales con
-- costo para que los miembros las agreguen al registrarse (ej: jet ski,
-- tour en lancha, etc.), reemplazando el catalogo global fijo anterior.
-- Mismo patron que Hoteles/DestinosTuristicos (evento_id-scoped).

IF OBJECT_ID('dbo.ServiciosPremium', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ServiciosPremium (
        id_servicio INT IDENTITY(1,1) PRIMARY KEY,
        evento_id VARCHAR(120) NOT NULL,
        nombre NVARCHAR(200) NOT NULL,
        descripcion NVARCHAR(MAX) NULL,
        precio INT NOT NULL DEFAULT 0,
        icono VARCHAR(50) NULL,
        orden INT NOT NULL DEFAULT 0,
        activo BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_ServiciosPremium_evento_id ON dbo.ServiciosPremium(evento_id);
END
GO
