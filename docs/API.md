# Documentación de API REST - L.A.M.A. Hardcore Tropical

## Base URL
```
http://localhost:3000/api
```

---

## Health Check

### GET /api/health
Verifica el estado del servicio y la conexión a Azure SQL Database.

**Response 200 (OK):**
```json
{
  "success": true,
  "message": "Servicio operativo",
  "database": "Conectado",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

---

## Inscripciones

### POST /api/register
Registra una nueva inscripción al evento V Campeonato Región Norte.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_participante": "miembro",
  "nombre_miembro": "Juan Carlos Rodríguez",
  "documento": "1234567890",
  "eps": "Sanitas EPS",
  "contacto_emergencia": "María Rodríguez",
  "tel_emergencia": "3001234567",
  "capitulo": "Bogotá Norte",
  "cargo_directivo": "Secretario",
  "fecha_llegada": "2026-09-12",
  "condicion_medica": "Hipertensión controlada",
  "interes_jersey": true,
  "talla_jersey": "L",
  "asiste_acompanante": true,
  "nombre_acompanante": "Ana Rodríguez"
}
```

**Campos obligatorios:**
- `tipo_participante`: "miembro", "simpatizante" o "prospecto"
- `nombre_miembro`: String (3-200 caracteres)
- `documento`: String (6-50 caracteres, alfanumérico)
- `eps`: String (3-100 caracteres)
- `contacto_emergencia`: String (3-200 caracteres)
- `tel_emergencia`: String (7-20 caracteres, formato teléfono)
- `capitulo`: String (3-100 caracteres)
- `fecha_llegada`: Date (entre 2026-09-10 y 2026-09-15)
- `interes_jersey`: Boolean
- `asiste_acompanante`: Boolean

**Campos condicionales:**
- `talla_jersey`: Requerido si `interes_jersey = true` (XS, S, M, L, XL, XXL, XXXL)
- `nombre_acompanante`: Requerido si `asiste_acompanante = true`

**Response 201 (Created):**
```json
{
  "success": true,
  "message": "Inscripción registrada exitosamente",
  "data": {
    "id": 1,
    "codigo_confirmacion": "LAMA-VN2026-000001",
    "fecha_registro": "2026-02-12T10:30:00.000Z",
    "nombre": "Juan Carlos Rodríguez",
    "capitulo": "Bogotá Norte"
  }
}
```

**Response 400 (Bad Request - Validación):**
```json
{
  "success": false,
  "message": "Errores de validación en los datos enviados",
  "errors": [
    {
      "field": "documento",
      "message": "El documento debe tener al menos 6 caracteres"
    },
    {
      "field": "talla_jersey",
      "message": "Si tiene interés en jersey, debe especificar la talla"
    }
  ]
}
```

**Response 409 (Conflict - Duplicado):**
```json
{
  "success": false,
  "message": "Ya existe una inscripción registrada con este documento",
  "codigo": "DUPLICADO"
}
```

---

### GET /api/inscripciones
Obtiene todas las inscripciones registradas.

**Response 200 (OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo_participante": "miembro",
      "nombre_miembro": "Juan Carlos Rodríguez",
      "documento": "1234567890",
      "eps": "Sanitas EPS",
      "contacto_emergencia": "María Rodríguez",
      "tel_emergencia": "3001234567",
      "capitulo": "Bogotá Norte",
      "cargo_directivo": "Secretario",
      "fecha_llegada": "2026-09-12T00:00:00.000Z",
      "condicion_medica": "Hipertensión controlada",
      "interes_jersey": true,
      "talla_jersey": "L",
      "asiste_acompanante": true,
      "nombre_acompanante": "Ana Rodríguez",
      "fecha_registro": "2026-02-12T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### GET /api/inscripciones/:documento
Busca una inscripción específica por número de documento.

**Params:**
- `documento`: Número de documento (ej: "1234567890")

**Response 200 (OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo_participante": "miembro",
    "nombre_miembro": "Juan Carlos Rodríguez",
    "documento": "1234567890",
    "eps": "Sanitas EPS",
    "contacto_emergencia": "María Rodríguez",
    "tel_emergencia": "3001234567",
    "capitulo": "Bogotá Norte",
    "cargo_directivo": "Secretario",
    "fecha_llegada": "2026-09-12T00:00:00.000Z",
    "condicion_medica": "Hipertensión controlada",
    "interes_jersey": true,
    "talla_jersey": "L",
    "asiste_acompanante": true,
    "nombre_acompanante": "Ana Rodríguez",
    "fecha_registro": "2026-02-12T10:30:00.000Z"
  }
}
```

**Response 404 (Not Found):**
```json
{
  "success": false,
  "message": "No se encontró inscripción con ese documento",
  "codigo": "NO_ENCONTRADO"
}
```

---

### GET /api/estadisticas
Obtiene estadísticas generales de las inscripciones.

**Response 200 (OK):**
```json
{
  "success": true,
  "data": {
    "total_inscripciones": 87,
    "total_miembros": 65,
    "total_simpatizantes": 15,
    "total_prospectos": 7,
    "total_jerseys": 78,
    "total_acompanantes": 23,
    "total_personas": 110,
    "porcentaje_jerseys": 90
  }
}
```

---

## Códigos de Error HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error de validación |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de duplicación |
| 500 | Internal Server Error - Error del servidor |
| 503 | Service Unavailable - Servicio no disponible |

---

## Ejemplos de Uso con cURL

### Registrar inscripción:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_participante": "miembro",
    "nombre_miembro": "Juan Carlos Rodríguez",
    "documento": "1234567890",
    "eps": "Sanitas EPS",
    "contacto_emergencia": "María Rodríguez",
    "tel_emergencia": "3001234567",
    "capitulo": "Bogotá Norte",
    "cargo_directivo": "Secretario",
    "fecha_llegada": "2026-09-12",
    "condicion_medica": "Ninguna",
    "interes_jersey": true,
    "talla_jersey": "L",
    "asiste_acompanante": false,
    "nombre_acompanante": null
  }'
```

### Verificar salud del servicio:
```bash
curl http://localhost:3000/api/health
```

### Obtener estadísticas:
```bash
curl http://localhost:3000/api/estadisticas
```

---

## Estructura de la Base de Datos

### Tabla: Inscripciones

```sql
CREATE TABLE Inscripciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_participante NVARCHAR(20) NOT NULL CHECK (tipo_participante IN ('miembro', 'simpatizante', 'prospecto')),
    nombre_miembro NVARCHAR(200) NOT NULL,
    documento NVARCHAR(50) NOT NULL,
    eps NVARCHAR(100) NOT NULL,
    contacto_emergencia NVARCHAR(200) NOT NULL,
    tel_emergencia NVARCHAR(20) NOT NULL,
    capitulo NVARCHAR(100) NOT NULL,
    cargo_directivo NVARCHAR(100),
    fecha_llegada DATE NOT NULL,
    condicion_medica NVARCHAR(MAX),
    interes_jersey BIT NOT NULL DEFAULT 0,
    talla_jersey NVARCHAR(10) CHECK (talla_jersey IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', NULL)),
    asiste_acompanante BIT NOT NULL DEFAULT 0,
    nombre_acompanante NVARCHAR(200),
    fecha_registro DATETIME2 DEFAULT GETDATE(),
    
    INDEX IX_Inscripciones_Documento (documento),
    INDEX IX_Inscripciones_Capitulo (capitulo),
    INDEX IX_Inscripciones_FechaRegistro (fecha_registro)
);
```

---

## Configuración Requerida

Asegúrate de configurar las siguientes variables de entorno en `.env`:

```env
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=lama_db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=your-secure-password
AZURE_SQL_PORT=1433
AZURE_SQL_ENCRYPT=true
```
