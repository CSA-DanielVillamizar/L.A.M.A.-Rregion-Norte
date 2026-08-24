-- Generaliza la sección de "puntos de ruta/itinerario destacado" del
-- detalle de evento (antes hardcodeada solo para vnorte-2026 en
-- events/detail.ejs) a un campo JSON por evento, igual que
-- costos_json/recomendaciones_json/contactos_json. Cada punto es
-- { titulo, descripcion, enlace (opcional) }.

IF COL_LENGTH('dbo.EventosLama', 'puntos_ruta_json') IS NULL
    ALTER TABLE dbo.EventosLama ADD puntos_ruta_json NVARCHAR(MAX) NULL;
GO
