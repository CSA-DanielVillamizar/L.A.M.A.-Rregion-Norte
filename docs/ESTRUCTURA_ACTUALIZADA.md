# Estructura Actualizada - Base de Datos Mejorada

## Cambios Implementados

### 1. Tabla: `InscripcionesCampeonato` (Nuevo Nombre)
**Antes**: `Inscripciones`  
**Ahora**: `InscripcionesCampeonato`

### 2. Mapeo de Campos Actualizados

| Campo Anterior | Campo Nuevo | Tipo | Descripción |
|---|---|---|---|
| `id` | `id_inscripcion` | INT IDENTITY | PK autoincremental |
| `nombre_miembro` | `nombre_completo` | VARCHAR(200) | Nombre del participante |
| `documento` | `documento_numero` | VARCHAR(30) UNIQUE | Cédula (índice único) |
| `contacto_emergencia` | `emergencia_nombre` | VARCHAR(200) | Nombre contacto |
| `tel_emergencia` | `emergencia_telefono` | VARCHAR(50) | Teléfono emergencia |
| `fecha_llegada` | `fecha_llegada_isla` | DATE | Fecha llegada San Andrés |
| `interes_jersey` | `adquiere_jersey` | BIT | Booleano jersey |
| `asiste_acompanante` | `asiste_con_acompanante` | BIT | Booleano acompañante |
| `condicion_medica` | `condicion_medica` | NVARCHAR(MAX) | Texto ilimitado |

### 3. Columnas Computadas (Nuevas)

```sql
valor_base INT DEFAULT 120000
valor_jersey INT DEFAULT 70000
valor_total_pagar AS (120000 + (CASE WHEN adquiere_jersey = 1 THEN 70000 ELSE 0 END))
```

**Ventaja**: La base de datos calcula automáticamente el total a pagar.

### 4. Estado de Validación (Nuevo)

```sql
estado_validacion VARCHAR(20) DEFAULT 'Pendiente'
```

**Valores posibles**:
- `Pendiente` - Esperando comprobante de pago
- `Aprobado` - Pago confirmado
- `Rechazado` - Comprobante rechazado

### 5. Tallas de Jersey Actualizadas

**Antes**: XS, S, M, L, XL, XXL, XXXL  
**Ahora**: S, M, L, XL, 2XL, 3XL

### 6. Código de Confirmación Simplificado

**Antes**: `LAMA-VN2026-000001` (formato largo)  
**Ahora**: `1`, `2`, `3`... (ID numérico directo)

**Uso**: El usuario coloca el ID como **referencia bancaria** al hacer la transferencia.

---

## Mensaje WhatsApp Actualizado

```
V CAMPEONATO REGIONAL DE MOTOTURISMO
L.A.M.A. REGIÓN NORTE - COLOMBIA

¡Hola! He completado mi registro para el evento en San Andrés:

Participante: [Nombre Completo]
Cédula: [Documento]
Categoría: [Tipo de Participante]
Capítulo: [Capítulo]
Jersey Oficial: [Sí/No] (Talla: [Talla])
Acompañante: [Nombre o No aplica]

━━━━━━━━━━━━━━━━━━━━
TOTAL A PAGAR: $[Total] COP
━━━━━━━━━━━━━━━━━━━━

Número de Inscripción: #42
Referencia para transferencia bancaria: #42

A continuación adjunto el comprobante de transferencia.
```

---

## Archivos Actualizados

### Backend:
- `src/models/inscripcionModel.js` - CREATE TABLE + métodos CRUD
- `src/validators/inscripcionValidator.js` - Schema Joi actualizado
- `src/services/inscripcionService.js` - Lógica de negocio
- `src/controllers/inscripcionController.js` - Sin cambios necesarios

### Frontend:
- `src/views/registro.ejs` - Formulario con nuevos `name` de campos
- `construirMensajeWhatsApp()` - Nueva plantilla simplificada

---

## Siguientes Pasos

### 1. Crear la Base de Datos en Azure SQL
```bash
# Opción A: Azure Portal
1. Ir a Azure SQL Database
2. Crear nueva base de datos "lama_db"
3. Copiar Connection String
4. Ejecutar CREATE TABLE desde docs/API.md

# Opción B: Azure CLI
az sql db create \
  --resource-group lama-rg \
  --server lama-server \
  --name lama_db \
  --service-objective S0
```

### 2. Configurar Variables de Entorno
Editar `.env`:
```env
AZURE_SQL_SERVER=lama-server.database.windows.net
AZURE_SQL_DATABASE=lama_db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=tu_password_seguro
```

### 3. Ejecutar Script CREATE TABLE
Ejecutar el script `createTableScript` de `inscripcionModel.js` en Azure SQL Query Editor.

### 4. Probar la Aplicación
```bash
npm install
npm start
# Visitar: http://localhost:3000/registro
```

---

## 💡 Ventajas de la Nueva Estructura

### ✅ Seguridad Mejorada
- `documento_numero UNIQUE` evita inscripciones duplicadas automáticamente
- Error 409 Conflict si intenta duplicar cédula

### ✅ Cálculos Automáticos
- Columna computada `valor_total_pagar` 
- No necesitas calcular en código, la BD lo hace

### ✅ Referencia Bancaria Simple
- ID #1, #2, #3... fácil de escribir en transferencias móviles
- Usuario no se equivoca con códigos largos

### ✅ Tracking de Pagos
- Campo `estado_validacion` permite panel administrativo
- Filtrar por: Pendientes, Aprobados, Rechazados

### ✅ Estadísticas Mejoradas
```sql
SELECT 
    COUNT(*) as total_inscripciones,
    SUM(CASE WHEN adquiere_jersey = 1 THEN 1 ELSE 0 END) as total_jerseys,
    SUM(valor_total_pagar) as total_recaudado,
    SUM(CASE WHEN estado_validacion = 'Aprobado' THEN 1 ELSE 0 END) as pagos_confirmados
FROM InscripcionesCampeonato
```

---

## 📊 Ejemplo de Flujo Completo

1. **Usuario completa formulario** → ID #1 generado
2. **Recibe mensaje WhatsApp**: "Número de Inscripción: #1"
3. **Hace transferencia** con referencia: **1**
4. **Envía comprobante** por WhatsApp al 573106328171
5. **Admin valida pago** y actualiza `estado_validacion = 'Aprobado'`
6. **Usuario confirmado** para el evento ✅

---

## 🛡️ Validaciones Implementadas

### Joi (Backend):
- ✅ `documento_numero`: 6-30 caracteres, solo números/letras/guiones
- ✅ `nombre_completo`: 3-200 caracteres
- ✅ `fecha_llegada_isla`: Entre 10-15 Sept 2026
- ✅ `talla_jersey`: Solo si `adquiere_jersey = true`
- ✅ `nombre_acompanante`: Solo si `asiste_con_acompanante = true`

### SQL (Database):
- ✅ `documento_numero UNIQUE` - No permite duplicados
- ✅ `tipo_participante CHECK` - Solo valores válidos (8 tipos)
- ✅ `capitulo CHECK` - Solo capítulos autorizados (10 opciones)
- ✅ `talla_jersey CHECK` - Solo S, M, L, XL, 2XL, 3XL

---

**Fecha de actualización**: 12 de febrero de 2026  
**Versión**: 2.0 - Estructura Mejorada con Columnas Computadas
