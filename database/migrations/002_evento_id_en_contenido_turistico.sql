-- Soporte multi-evento: hasta ahora Hoteles y DestinosTuristicos eran
-- globales (compartidos por todos los eventos). Cada evento se celebra en
-- una sede distinta con sus propios hoteles y atracciones turísticas, así
-- que se agrega evento_id para que cada evento tenga su propio contenido.
-- Las filas existentes (Coveñas) se asignan a 'vnorte-2026' para no
-- perder nada.

IF COL_LENGTH('dbo.Hoteles', 'evento_id') IS NULL
BEGIN
    ALTER TABLE dbo.Hoteles ADD evento_id VARCHAR(120) NULL;
END
GO

UPDATE dbo.Hoteles SET evento_id = 'vnorte-2026' WHERE evento_id IS NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.Hoteles') AND name = 'IX_Hoteles_evento_id'
)
BEGIN
    CREATE INDEX IX_Hoteles_evento_id ON dbo.Hoteles(evento_id);
END
GO

IF COL_LENGTH('dbo.DestinosTuristicos', 'evento_id') IS NULL
BEGIN
    ALTER TABLE dbo.DestinosTuristicos ADD evento_id VARCHAR(120) NULL;
END
GO

UPDATE dbo.DestinosTuristicos SET evento_id = 'vnorte-2026' WHERE evento_id IS NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.DestinosTuristicos') AND name = 'IX_DestinosTuristicos_evento_id'
)
BEGIN
    CREATE INDEX IX_DestinosTuristicos_evento_id ON dbo.DestinosTuristicos(evento_id);
END
GO
