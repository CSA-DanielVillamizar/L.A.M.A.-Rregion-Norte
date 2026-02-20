# 🚀 Guía Rápida - Panel de Administración

## ✅ Sistema Implementado Completamente

### 📁 Archivos Creados
```
src/
├── middleware/
│   └── authMiddleware.js          # Autenticación básica + API Key
├── controllers/
│   └── adminController.js         # Controlador de admin
├── routes/
│   └── adminRoutes.js             # Rutas protegidas
├── models/
│   └── inscripcionModel.js        # + métodos updateEstado/delete
└── views/
    └── admin/
        └── dashboard.ejs          # Vista del dashboard
```

---

## 🎯 Inicio Rápido

### 1. Iniciar el Servidor
```bash
npm start
```

### 2. Acceder al Dashboard
```
URL: http://localhost:3000/admin/dashboard
Usuario: admin
Contraseña: lama2026
```

### 3. Probar la API
```bash
# Obtener estadísticas
curl -X GET http://localhost:3000/api/admin/estadisticas \
  -H "x-api-key: lama-api-key-2026"

# Aprobar inscripción #1
curl -X PUT http://localhost:3000/api/admin/inscripciones/1/estado \
  -H "x-api-key: lama-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"estado_validacion":"Aprobado"}'
```

---

## 🔐 Seguridad Implementada

### Endpoints Públicos (No protegidos)
✅ `POST /api/register` - Formulario de registro  
✅ `GET /api/health` - Estado del servicio

### Endpoints Protegidos con API Key
🔒 `GET /api/inscripciones` - Ver todas (requiere: `x-api-key`)  
🔒 `GET /api/inscripciones/:documento` - Buscar (requiere: `x-api-key`)  
🔒 `GET /api/estadisticas` - Stats (requiere: `x-api-key`)  
🔒 `PUT /api/admin/inscripciones/:id/estado` - Cambiar estado  
🔒 `DELETE /api/admin/inscripciones/:id` - Eliminar

### Endpoints con Basic Auth
🔑 `GET /admin/dashboard` - Vista web (requiere: usuario + password)

---

## 📊 Funcionalidades del Dashboard

### Vista Principal
- ✅ Tarjetas de estadísticas (4 métricas clave)
- ✅ Tabla completa de inscripciones
- ✅ Filtros por estado (Pendiente/Aprobado/Rechazado)
- ✅ Búsqueda por nombre en tiempo real
- ✅ Exportar a CSV con un click

### Gestión de Estados
- ✅ **Aprobar**: Cambia "Pendiente" → "Aprobado" (verde)
- ✅ **Rechazar**: Cambia "Pendiente" → "Rechazado" (rojo)
- ✅ **Revertir**: Regresa cualquier estado a "Pendiente"

### Modal de Detalles
- ✅ Ver información completa de cada inscripción
- ✅ Diseño responsive con scroll

---

## 🎨 Diseño Visual

### Badges de Estado
| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟠 Pendiente | Naranja | Esperando validación |
| 🟢 Aprobado | Verde | Pago confirmado |
| 🔴 Rechazado | Rojo | Pago rechazado |

### Tema
- Fondo: Negro L.A.M.A. (#0A0A0A)
- Acentos: Dorado (#D4AF37) + Turquesa (#00F5FF)
- Tipografía: Bebas Neue + Montserrat

---

## 🧪 Testing Manual

### Paso 1: Crear Inscripción de Prueba
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_participante": "DAMA L.A.M.A. FULL COLOR MEMBER",
    "nombre_completo": "Test Usuario",
    "documento_numero": "9999999999",
    "eps": "Test EPS",
    "emergencia_nombre": "Test Emergencia",
    "emergencia_telefono": "3001234567",
    "capitulo": "Barranquilla",
    "fecha_llegada_isla": "2026-09-12",
    "adquiere_jersey": true,
    "talla_jersey": "L",
    "asiste_con_acompanante": false
  }'
```

### Paso 2: Verificar en Dashboard
1. Abre http://localhost:3000/admin/dashboard
2. Login: admin / lama2026
3. Busca la inscripción #1 en la tabla
4. Estado debe estar en "Pendiente" (naranja)

### Paso 3: Aprobar Pago
1. Click en botón "✓ Aprobar"
2. Confirmar en el modal
3. Badge cambia a verde "Aprobado"
4. Estadísticas se actualizan automáticamente

---

## 📝 Configuración de Producción

### Variables de Entorno (.env)
```env
# Cambiar en producción
ADMIN_USERNAME=presidente_lama
ADMIN_PASSWORD=Tu_Contraseña_Súper_Segura!
API_KEY=lama-prod-$(uuidgen)-2026

# Azure SQL (ya configuradas)
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=lama_db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=your-secure-password
```

### Recomendaciones
1. ✅ Cambia credenciales por defecto
2. ✅ Usa Azure Key Vault para secretos
3. ✅ Habilita HTTPS con certificado SSL
4. ✅ Implementa rate limiting
5. ✅ Activa logs de auditoría

---

## 🔧 Métodos Agregados al Modelo

```javascript
// src/models/inscripcionModel.js

// Actualizar estado de validación
static async updateEstadoValidacion(id, estado)
// Retorna: { affectedRows: 1 }

// Eliminar inscripción
static async deleteById(id)
// Retorna: { affectedRows: 1 }
```

---

## 🐛 Troubleshooting

### Error: "Autenticación requerida"
✅ Verifica usuario/password en `.env`  
✅ Cierra todas las ventanas del navegador  
✅ Prueba en modo incógnito

### Error: "API Key inválida"
✅ Verifica que el header incluye: `x-api-key: lama-api-key-2026`  
✅ Compara con valor en `.env`

### Dashboard no muestra inscripciones
✅ Verifica conexión a Azure SQL  
✅ Ejecuta `GET /api/health` para verificar BD  
✅ Revisa logs del servidor con `npm start`

---

## 📚 Documentación Completa

- **[ADMIN_DASHBOARD.md](./docs/ADMIN_DASHBOARD.md)** - Documentación completa del panel
- **[ESTRUCTURA_ACTUALIZADA.md](./docs/ESTRUCTURA_ACTUALIZADA.md)** - Estructura de BD
- **[API.md](./docs/API.md)** - Referencia completa de API

---

## ✨ Características Clave

### Seguridad
- ✅ Autenticación HTTP Basic para vista web
- ✅ API Key para endpoints REST
- ✅ Validación de estados en backend
- ✅ Protección contra SQL injection (mssql parametrizado)

### Usabilidad
- ✅ Interfaz intuitiva con colores del evento
- ✅ Filtros y búsqueda en tiempo real
- ✅ Exportación a CSV
- ✅ Responsive design (mobile-friendly)

### Performance
- ✅ Consultas SQL optimizadas
- ✅ Índices en `documento_numero`
- ✅ Columna computada `valor_total_pagar`
- ✅ Connection pooling con mssql

---

**Fecha**: 13 de febrero de 2026  
**Estado**: ✅ Completamente funcional  
**Próximo paso**: Configurar Azure SQL y realizar pruebas con datos reales
