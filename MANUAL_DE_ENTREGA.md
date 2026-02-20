# MANUAL DE ENTREGA - L.A.M.A. Región Norte

## Resumen Ejecutivo
La plataforma fue desarrollada con un stack web moderno orientado a mantenibilidad y escalabilidad en entorno productivo Azure:

- **Node.js**: runtime principal para la capa backend.
- **Express.js**: framework HTTP para enrutamiento MVC, middleware y APIs.
- **Tailwind CSS**: sistema utilitario para diseño responsive y estética "Hardcore Tropical".
- **Leaflet.js**: motor de mapas interactivos (itinerario, filtros y popups multimedia).
- **Azure SQL Database**: persistencia transaccional de inscripciones, servicios y anuncios dinámicos.

## Enlaces Clave
- **Landing pública**: https://lamaregionnorte.azurewebsites.net/
- **Dashboard Admin**: https://lamaregionnorte.azurewebsites.net/admin/dashboard

## Credenciales por Defecto
> Referencia base según el archivo `.env.example`. Se recomienda cambiar inmediatamente en producción.

- **ADMIN_USERNAME**: `admin`
- **ADMIN_PASSWORD**: `your-admin-password`
- **API_KEY**: `your-api-key`

## Próximos Pasos de Mantenimiento
1. Monitorear los primeros registros reales y validar consistencia de KPIs en dashboard.
2. **Después de superar los primeros 100 inscritos**, ejecutar un **backup completo de Azure SQL Database** y documentar:
   - fecha/hora del respaldo,
   - tamaño aproximado,
   - método usado (portal, automatización o export BACPAC),
   - ubicación del respaldo y responsable.
3. Programar backups recurrentes (diarios/semanales) y prueba periódica de restauración.
4. Revisar rotación de credenciales (`ADMIN_PASSWORD` y `API_KEY`) y registrar cambios en bitácora operativa.

## Estado de Entrega
- Plataforma desplegada y operativa en Azure App Service.
- Mapa interactivo enriquecido con contenido multimedia.
- Ticker refactorizado con controles por íconos, pausa inteligente y barra de progreso.
- Base de inscripciones depurada para pruebas reales posteriores.
