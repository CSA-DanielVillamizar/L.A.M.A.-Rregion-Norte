-- Actualiza el catálogo de categorías de participante a la nomenclatura
-- oficial L.A.M.A. (FCM, P, ASC, HNR, PTR, H, I), consolida ESPOSA/CONYUGUE/
-- PAREJA en una sola opción, retira ROCKET PROSPECT y separa DAMA L.A.M.A.
-- en sus dos variantes (Full Color / Prospecto). También agrega el nuevo
-- campo tipo_vehiculo (Moto/Carro/Avión) con el que llegó el participante.

-- 1) Quitar el CHECK constraint viejo ANTES de tocar los datos: si se
-- actualizan los valores mientras el constraint viejo sigue activo, el
-- propio UPDATE hacia el valor nuevo lo viola (el valor nuevo no está en
-- la lista vieja) y falla.
DECLARE @constraintTipoParticipante SYSNAME;
SELECT TOP 1 @constraintTipoParticipante = cc.name
FROM sys.check_constraints cc
INNER JOIN sys.columns c
    ON c.object_id = cc.parent_object_id AND c.column_id = cc.parent_column_id
WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
  AND c.name = 'tipo_participante';

IF @constraintTipoParticipante IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintTipoParticipante + ']');
END
GO

-- 2) Migrar datos existentes a los nuevos valores
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'MIEMBRO FULL COLOR (FCM)' WHERE tipo_participante = 'FULL COLOR MEMBER';
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'PROSPECTO (P)' WHERE tipo_participante IN ('PROSPECT', 'ROCKET PROSPECT');
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'ESPOSA (O)' WHERE tipo_participante IN ('ESPOSA (o)', 'CONYUGUE', 'PAREJA');
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'HIJO (A) (H)' WHERE tipo_participante = 'HIJA (o)';
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'INVITADO (A) (I)' WHERE tipo_participante = 'INVITADA (O)';
UPDATE dbo.InscripcionesCampeonato SET tipo_participante = 'DAMA L.A.M.A. - FULL COLOR (FCM)' WHERE tipo_participante = 'DAMA L.A.M.A.';
GO

-- 3) Agregar el nuevo CHECK constraint con el catálogo actualizado
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
GO

-- 4) Nuevo campo: tipo de vehículo con el que asiste el participante
IF COL_LENGTH('dbo.InscripcionesCampeonato', 'tipo_vehiculo') IS NULL
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato ADD tipo_vehiculo VARCHAR(20) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints cc
    INNER JOIN sys.columns c
        ON c.object_id = cc.parent_object_id AND c.column_id = cc.parent_column_id
    WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
      AND c.name = 'tipo_vehiculo'
)
BEGIN
    ALTER TABLE dbo.InscripcionesCampeonato
    ADD CONSTRAINT CK_InscripcionesCampeonato_tipo_vehiculo
    CHECK (tipo_vehiculo IS NULL OR tipo_vehiculo IN ('MOTO (M)', 'CARRO (C)', 'AVIÓN (A)'));
END
GO
