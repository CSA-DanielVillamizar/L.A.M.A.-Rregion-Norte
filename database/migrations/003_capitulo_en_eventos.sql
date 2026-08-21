-- Cada evento se organiza desde un capitulo especifico (p. ej. el V
-- Campeonato lo organiza Region Norte, un futuro evento lo organizaria
-- Zenu). Se guarda el nombre del capitulo como VARCHAR, igual que ya se
-- hace en InscripcionesCampeonato.capitulo, para no introducir un join
-- nuevo contra un catalogo que hoy vive en codigo (capitulosService.js).

IF COL_LENGTH('dbo.EventosLama', 'capitulo') IS NULL
BEGIN
    ALTER TABLE dbo.EventosLama ADD capitulo VARCHAR(100) NULL;
END
GO
