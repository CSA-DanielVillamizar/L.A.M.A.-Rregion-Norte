-- La tabla EventosLama tenia 14 eventos "semilla" (Rally Nacional,
-- aniversarios de capitulos, etc.) del sistema original, sin flujo de
-- registro real (solo vnorte-2026 tiene formulario propio). Antes se
-- ocultaban con un filtro hardcodeado en el controller
-- (getAllEvents devolvia solo 'vnorte-2026'); ahora que el listado
-- publico respeta el flag `activo` de la BD (para soportar eventos
-- reales futuros), se marcan esos 14 como inactivos para no
-- exponerlos rotos al publico. No se borran: siguen disponibles en el
-- admin por si se quieren reactivar/reutilizar mas adelante.
--
-- Tambien se corrige `destacado`: quedaba en 1 para 6 eventos a la vez
-- (dato del seed original, nunca curado); solo vnorte-2026 deberia
-- controlar la home por ahora.

UPDATE dbo.EventosLama
SET activo = 0
WHERE id_evento <> 'vnorte-2026';
GO

UPDATE dbo.EventosLama
SET destacado = 0
WHERE id_evento <> 'vnorte-2026';
GO

UPDATE dbo.EventosLama
SET destacado = 1
WHERE id_evento = 'vnorte-2026';
GO
