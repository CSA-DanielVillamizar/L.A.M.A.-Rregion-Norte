-- documento_numero tenia un UNIQUE simple a nivel de columna, heredado
-- de cuando solo existia un evento posible. Con soporte multi-evento,
-- la misma persona debe poder registrarse en distintos eventos con el
-- mismo documento - el UNIQUE ahora es compuesto (documento_numero,
-- evento_id).

IF EXISTS (
    SELECT 1 FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic
        ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
    INNER JOIN sys.columns c
        ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE kc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND c.name = 'documento_numero'
      -- Solo si es un UNIQUE de una sola columna (evita tocar el nuevo
      -- constraint compuesto si esta migracion ya corrio antes).
      AND (SELECT COUNT(*) FROM sys.index_columns ic2
           WHERE ic2.object_id = kc.parent_object_id AND ic2.index_id = kc.unique_index_id) = 1
)
BEGIN
    DECLARE @constraintDocumento SYSNAME;

    SELECT TOP 1 @constraintDocumento = kc.name
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic
        ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
    INNER JOIN sys.columns c
        ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE kc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND c.name = 'documento_numero'
      AND (SELECT COUNT(*) FROM sys.index_columns ic2
           WHERE ic2.object_id = kc.parent_object_id AND ic2.index_id = kc.unique_index_id) = 1;

    IF @constraintDocumento IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintDocumento + ']');
    END
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND name = 'UQ_InscripcionesCampeonato_documento_evento'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT UQ_InscripcionesCampeonato_documento_evento UNIQUE (documento_numero, evento_id);
END
GO
