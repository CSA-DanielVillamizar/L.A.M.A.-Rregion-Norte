-- Corrección: la abreviatura oficial de "Miembro Retirado" en la plantilla
-- LAMA de planillas de asistencia es "RTR", no "PTR" (typo introducido en la
-- migración 006). Renombra el valor existente y actualiza el CHECK
-- constraint para que coincida con la nomenclatura oficial.

DECLARE @constraintTipoParticipanteRtr SYSNAME;
SELECT TOP 1 @constraintTipoParticipanteRtr = cc.name
FROM sys.check_constraints cc
INNER JOIN sys.columns c
    ON c.object_id = cc.parent_object_id AND c.column_id = cc.parent_column_id
WHERE cc.parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
  AND c.name = 'tipo_participante';

IF @constraintTipoParticipanteRtr IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.InscripcionesCampeonato DROP CONSTRAINT [' + @constraintTipoParticipanteRtr + ']');
END
GO

UPDATE dbo.InscripcionesCampeonato
SET tipo_participante = 'MIEMBRO RETIRADO (RTR)'
WHERE tipo_participante = 'MIEMBRO RETIRADO (PTR)';
GO

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
GO
