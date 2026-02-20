# Panel de Administración - L.A.M.A.

## Acceso al Dashboard

### URL
```
http://localhost:3000/admin/dashboard
```

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `lama2026`

IMPORTANTE: Cambia estas credenciales en producción editando `.env`

---

## Sistema de Seguridad

### 1. Autenticación Básica (Dashboard Web)
El dashboard `/admin/dashboard` usa **HTTP Basic Authentication**:
- El navegador solicitará usuario y contraseña
- Credenciales configuradas en `.env`:
  ```env
  ADMIN_USERNAME=admin
  ADMIN_PASSWORD=lama2026
  ```

### 2. API Key (Endpoints REST)
Los endpoints protegidos requieren API Key en el header:
```bash
x-api-key: lama-api-key-2026
```

Configurado en `.env`:
```env
API_KEY=lama-api-key-2026
```

---

## Funcionalidades del Dashboard

### Vista Principal
**Estadísticas en tiempo real**:
- Total de inscripciones
- Pagos confirmados (estado "Aprobado")
- Pagos pendientes (estado "Pendiente")
- Total recaudado (suma de `valor_total_pagar`)

### Tabla de Inscripciones
Columnas visibles:
- **ID**: Número de inscripción (referencia bancaria)
- **Nombre**: Nombre completo del participante
- **Documento**: Cédula o NUIP
- **Tipo**: Tipo de participante (8 categorías)
- **Capítulo**: Capítulo L.A.M.A. al que pertenece
- **Total**: Monto total a pagar (calculado automáticamente)
- **Estado**: Badge visual con color según estado
- **Acciones**: Botones para cambiar estado y ver detalles

### Filtros Disponibles
1. **Por Estado**:
   - Todos
   - Pendiente (naranja)
   - Aprobado (verde)
   - Rechazado (rojo)

2. **Por Nombre**:
   - Búsqueda en tiempo real
   - Case-insensitive

### Acciones Disponibles

#### Cambiar Estado
- **Aprobar** → Cambia a "Aprobado" (verde)
- **Rechazar** → Cambia a "Rechazado" (rojo)
- **Pendiente** → Regresa a "Pendiente" (naranja)

#### Ver Detalles
Modal con información completa:
- ID de inscripción
- Nombre completo
- Documento
- Tipo de participante
- Capítulo
- Total a pagar
- Estado actual

#### Exportar CSV
Genera archivo CSV con:
- Todas las inscripciones visibles (respetando filtros)
- Formato: `inscripciones_lama_YYYY-MM-DD.csv`
- Compatible con Excel y Google Sheets

---

## Endpoints de API Protegidos

### 1. Obtener Todas las Inscripciones
```http
GET /api/admin/inscripciones
Headers:
  x-api-key: lama-api-key-2026
```

**Response 200 OK**:
```json
{
  "success": true,
  "total": 25,
  "data": [
    {
      "id_inscripcion": 1,
      "nombre_completo": "Juan Pérez",
      "documento_numero": "1234567890",
      "tipo_participante": "DAMA L.A.M.A. FULL COLOR MEMBER",
      "capitulo": "Barranquilla",
      "valor_total_pagar": 190000,
      "estado_validacion": "Pendiente",
      "fecha_registro": "2026-02-13T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Actualizar Estado de Inscripción
```http
PUT /api/admin/inscripciones/:id/estado
Headers:
  x-api-key: lama-api-key-2026
  Content-Type: application/json

Body:
{
  "estado_validacion": "Aprobado"
}
```

**Valores válidos**: `Pendiente`, `Aprobado`, `Rechazado`

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Estado actualizado a: Aprobado",
  "data": {
    "id": 1,
    "estado_validacion": "Aprobado"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "message": "Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado"
}
```

**Response 404 Not Found**:
```json
{
  "success": false,
  "message": "Inscripción no encontrada"
}
```

---

### 3. Obtener Estadísticas
```http
GET /api/admin/estadisticas
Headers:
  x-api-key: lama-api-key-2026
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "total_inscripciones": 25,
    "total_jerseys": 18,
    "total_acompanantes": 10,
    "total_recaudado": 4680000,
    "pagos_confirmados": 15,
    "pagos_pendientes": 10
  }
}
```

---

### 4. Eliminar Inscripción
```http
DELETE /api/admin/inscripciones/:id
Headers:
  x-api-key: lama-api-key-2026
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Inscripción eliminada exitosamente"
}
```

> ⚠️ **CUIDADO**: Esta acción es irreversible. Usa con precaución.

---

## 🔒 Endpoints Públicos vs Protegidos

### ✅ Públicos (No requieren autenticación)
```http
GET  /api/health              # Estado del servicio
POST /api/register            # Registro de inscripciones
```

### 🔐 Protegidos con API Key
```http
GET    /api/inscripciones              # Listar todas
GET    /api/inscripciones/:documento   # Buscar por documento
GET    /api/estadisticas               # Estadísticas generales
GET    /api/admin/inscripciones        # Listar (admin)
GET    /api/admin/estadisticas         # Estadísticas (admin)
PUT    /api/admin/inscripciones/:id/estado  # Actualizar estado
DELETE /api/admin/inscripciones/:id    # Eliminar inscripción
```

### 🔑 Protegidos con Basic Auth
```http
GET /admin/dashboard           # Vista web del dashboard
```

---

## 🧪 Pruebas con cURL

### Aprobar Inscripción
```bash
curl -X PUT http://localhost:3000/api/admin/inscripciones/1/estado \
  -H "x-api-key: lama-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"estado_validacion":"Aprobado"}'
```

### Obtener Estadísticas
```bash
curl -X GET http://localhost:3000/api/admin/estadisticas \
  -H "x-api-key: lama-api-key-2026"
```

### Acceder al Dashboard (con Basic Auth)
```bash
curl -u admin:lama2026 http://localhost:3000/admin/dashboard
```

---

## 🚀 Flujo de Trabajo Completo

### Paso 1: Usuario se Registra
1. Completa formulario en `/registro`
2. Envía datos → `POST /api/register`
3. Recibe ID de inscripción (ej: #1)
4. **Estado inicial**: `Pendiente`

### Paso 2: Usuario Hace Pago
1. Transfiere dinero a cuenta bancaria
2. Coloca ID (#1) como referencia
3. Envía comprobante por WhatsApp al 573106328171

### Paso 3: Admin Valida Pago
1. Accede a `/admin/dashboard`
2. Busca inscripción #1 en la tabla
3. Revisa comprobante recibido por WhatsApp
4. **Si el pago es válido**: Click en "✓ Aprobar"
5. **Si el pago es inválido**: Click en "✗ Rechazar"

### Paso 4: Confirmación
- Estado actualizado en base de datos
- Dashboard se actualiza automáticamente
- Estadísticas se recalculan

---

## 📈 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - Credenciales inválidas |
| 403 | Forbidden - API Key inválida |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🔐 Mejores Prácticas de Seguridad

### En Desarrollo (Local)
✅ Usa credenciales simples como `admin:lama2026`
✅ API Key sencilla: `lama-api-key-2026`

### En Producción (Azure)
🔒 **CAMBIAR OBLIGATORIAMENTE**:
```env
ADMIN_USERNAME=presidente_lama
ADMIN_PASSWORD=Tu_Contraseña_Súper_Segura_2026!
API_KEY=lama-prod-$(uuidgen)-2026
```

🔒 **Recomendaciones adicionales**:
1. Usar Azure Key Vault para secretos
2. Implementar HTTPS (SSL/TLS)
3. Agregar rate limiting (límite de peticiones)
4. Logs de auditoría para cambios de estado
5. Autenticación de dos factores (2FA)

---

## 🎨 Colores del Sistema de Estados

| Estado | Color | Clase CSS | Hex |
|--------|-------|-----------|-----|
| Pendiente | 🟠 Naranja | `badge-pendiente` | #FFA500 |
| Aprobado | 🟢 Verde | `badge-aprobado` | #00FF00 |
| Rechazado | 🔴 Rojo | `badge-rechazado` | #FF0000 |

---

## 📱 Responsividad

El dashboard es completamente responsive:
- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Scroll horizontal en la tabla
- **Mobile**: Vista optimizada con scroll

---

## 🐛 Troubleshooting

### Error 401: Unauthorized
**Causa**: Credenciales incorrectas  
**Solución**: Verifica usuario/contraseña en `.env`

### Error 403: Forbidden
**Causa**: API Key inválida  
**Solución**: Verifica header `x-api-key` en la petición

### No se actualiza el estado
**Causa**: Falta API Key en el fetch  
**Solución**: Verifica que el script incluye el header correctamente

### Dashboard no carga inscripciones
**Causa**: Error de conexión a Azure SQL  
**Solución**: Verifica credenciales de BD en `.env`

---

**Fecha de creación**: 13 de febrero de 2026  
**Versión**: 1.0 - Sistema de Administración Completo
