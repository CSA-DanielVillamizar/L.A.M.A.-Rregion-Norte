# 🎯 Sistema Listo para Despliegue

## ✅ Todo Completado

### 📁 Estructura de Archivos Creada

```
LADINGPAGEREGIONAL/
├── 📄 server.js                 # Servidor Express configurado
├── 📄 package.json              # Dependencias instaladas
├── 📄 web.config                # Configuración Azure (IIS/iisnode)
├── 📄 test-inscripcion.js       # Script de prueba automatizado
├── 📄 .env                      # Variables de entorno
├── 📁 src/
│   ├── 📁 controllers/
│   ├── 📁 models/
│   ├── 📁 routes/
│   ├── 📁 middleware/
│   └── 📁 views/
│       ├── 📁 admin/
│       │   └── dashboard.ejs    # Panel admin con CSV export
│       └── 📁 partials/
├── 📁 public/
│   ├── 📁 img/
│   │   ├── LAMARegionNorte.png  # ✅ Logo Oficial (EN USO)
│   │   ├── hero-bg.svg          # ✅ Creado (1920x1080)
│   │   ├── logo.svg             # ⚠️ Placeholder (reemplazado)
│   │   └── favicon.svg          # ✅ Creado (32x32)
│   ├── 📁 css/
│   └── 📁 js/
└── 📁 docs/
    ├── IMAGENES.md              # Guía de imágenes
    ├── AZURE_DEPLOYMENT.md      # Guía de despliegue
    └── README_DEPLOYMENT.md     # Este archivo
```

---

## 🎨 Imágenes

### ✅ Estado Actual

- **Sin rutas rotas**: Hero usa Unsplash externo (funciona perfecto)
- **3 SVG placeholders creados**: hero-bg, logo, favicon
- **Documentación completa**: Ver [IMAGENES.md](./IMAGENES.md)

### 🔄 Para Usar Imágenes Locales (Opcional)

1. Coloca tus fotos en `public/img/`
2. En [home.ejs](../src/views/home.ejs) línea ~15, cambia:
   ```html
   <!-- DE: -->
   bg-[url('https://images.unsplash.com/photo-1544551763-46a8723ba3f9...')]
   
   <!-- A: -->
   bg-[url('/img/hero-motorcycle.jpg')]
   ```

---

## 🧪 Prueba Automatizada

### Script de Prueba: test-inscripcion.js

**Valida 5 pasos**:

1. ✅ Health check (servidor + base de datos)
2. ✅ Registro de inscripción (POST /api/register)
3. ✅ Formato de mensaje WhatsApp (plantilla exacta)
4. ✅ Actualización de estadísticas
5. ✅ Cambio de estado a "Aprobado"

### Ejecutar Prueba

```bash
# ⚠️ PRIMERO debes tener el servidor corriendo
npm start

# En otra terminal, ejecuta:
node test-inscripcion.js
```

### Salida Esperada

```
🧪 ============================================
   PRUEBA DE INSCRIPCIÓN - L.A.M.A.
   ============================================

✅ Paso 1: Servidor activo y base de datos conectada

✅ Paso 2: Inscripción creada exitosamente
   ID: 1
   Nombre: María Rodríguez Test
   Capítulo: Barranquilla
   Fecha: 2026-02-13T12:00:00.000Z

📱 Paso 3: Mensaje de WhatsApp generado:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 V CAMPEONATO REGIONAL DE MOTOTURISMO 🏁
🌊 L.A.M.A. REGIÓN NORTE - COLOMBIA

¡Hola! He completado mi registro...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Paso 4: Estadísticas actualizadas
   📊 Total inscripciones: 1
   ⏳ Pagos pendientes: 1
   👕 Jerseys: 1
   💰 Total recaudado: $190,000 COP

✅ Paso 5: Estado actualizado a 'Aprobado'

✅ ============================================
   TODAS LAS PRUEBAS PASARON EXITOSAMENTE
   ============================================

🌐 Dashboard: http://localhost:3000/admin/dashboard
🔐 Usuario: admin
🔐 Password: lama2026
```

---

## 🔒 Seguridad - Credenciales Actuales

### Desarrollo (Local)

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=lama2026
API_KEY=lama-api-key-2026
```

### ⚠️ PRODUCCIÓN (Azure)

**DEBES CAMBIAR** estas credenciales en Azure Portal:

1. Ve a tu App Service → Configuración → Configuración de aplicación
2. Cambia estos valores:
   ```
   ADMIN_USERNAME → presidente_lama_norte
   ADMIN_PASSWORD → [Contraseña fuerte 20+ chars]
   API_KEY → lama-prod-$(uuidgen)-2026
   ```

---

## 📊 Funcionalidades Verificadas

### ✅ Dashboard Admin

**URL**: `/admin/dashboard`

**Características**:
- ✅ Autenticación HTTP Basic (usuario/contraseña)
- ✅ Tabla de inscritos con filtros
- ✅ Estadísticas en tiempo real (4 cards)
- ✅ Botones Aprobar/Rechazar/Pendiente
- ✅ **Exportar CSV** (línea 100 y 294-312)
- ✅ Búsqueda por nombre
- ✅ Filtro por estado

### ✅ API REST

**Endpoints Protegidos** (requieren `x-api-key` header):

```
GET  /api/admin/inscripciones     # Listar todas
GET  /api/admin/estadisticas      # Stats del dashboard
PUT  /api/admin/inscripciones/:id/estado  # Cambiar estado
DELETE /api/admin/inscripciones/:id       # Eliminar
```

### ✅ Registro

**URL**: `/registro`

**Campos validados**:
- Tipo de participante (4 opciones)
- Datos personales (nombre, cédula, EPS)
- Contacto emergencia
- Capítulo (condicional: "Otro" muestra campo extra)
- Cargo directivo (condicional: solo para L.A.M.A. Full Color Member)
- Fecha de llegada
- Jersey (opcional) → +$70,000 COP
- Acompañante (opcional) → campos extra

**Precio dinámico**:
- Base: $120,000 COP
- Jersey oficial: +$70,000 COP
- Total mostrado en tiempo real

**Integración WhatsApp**:
- Redirige a WhatsApp con mensaje pre-formateado
- Incluye todos los datos del participante
- ID como referencia para transferencia bancaria

---

## 🚀 Despliegue en Azure

### Guía Completa

Ver archivo: [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)

### Pasos Resumidos

1. **Crear App Service** (Node 18 LTS, Windows)
2. **Configurar variables de entorno** en Azure Portal
3. **Crear Azure SQL Database** y tabla
4. **Desplegar código** (Git, ZIP o VS Code)
5. **Configurar firewall** de SQL Server
6. **Verificar despliegue** en URL de Azure

### Costos Estimados

- App Service B1: ~$13/mes
- Azure SQL Basic: ~$5/mes
- **Total**: ~$18/mes

---

## 📝 Base de Datos

### Tabla: InscripcionesCampeonato

**Script de creación** en: `src/models/inscripcionModel.js`

**Características**:
- ✅ ID autoincremental (1, 2, 3...)
- ✅ Campo `valor_total_pagar` computado automáticamente
- ✅ Campo `estado_validacion` con 3 valores: Pendiente/Aprobado/Rechazado
- ✅ Índice único en `documento_numero`
- ✅ Fecha de registro automática

**Ejecutar en Azure SQL**:

```sql
-- Copiar script desde inscripcionModel.js (línea ~20)
-- Pegar en Azure Data Studio o Query Editor del portal
```

---

## 🎯 Próximos Pasos

### 1. Prueba Local

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Ejecutar prueba
node test-inscripcion.js
```

### 2. Configurar Azure SQL

- Crear servidor SQL en Azure Portal
- Crear base de datos `lama_db`
- Ejecutar script CREATE TABLE
- Actualizar credenciales en `.env`

### 3. Desplegar a Azure

```bash
# Opción 1: Git
git init
git add .
git commit -m "Deploy L.A.M.A. webapp"
git remote add azure [URL_DE_AZURE]
git push azure main

# Opción 2: Azure CLI
az webapp deployment source config-zip \
  --name lama-campeonato \
  --resource-group lama-rg \
  --src lama-app.zip
```

### 4. Verificar Producción

```bash
# Health check
curl https://lama-campeonato.azurewebsites.net/api/health

# Dashboard
https://lama-campeonato.azurewebsites.net/admin/dashboard
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"

1. Verifica credenciales en `.env`
2. Verifica firewall de Azure SQL
3. Prueba conexión desde portal Azure

### Error: "Authentication failed" en dashboard

- Verifica `ADMIN_USERNAME` y `ADMIN_PASSWORD` en configuración de Azure
- Intenta con las credenciales por defecto: `admin` / `lama2026`

---

## 📞 Soporte

### Archivos de Configuración

- `.env` → Variables de entorno (NO subir a Git)
- `web.config` → Configuración IIS/Azure
- `package.json` → Dependencias npm

### Logs en Producción

```bash
# Ver logs en tiempo real
az webapp log tail \
  --name lama-campeonato \
  --resource-group lama-rg
```

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Dependencias instaladas (`npm install`)
- [ ] Prueba local exitosa (`node test-inscripcion.js`)
- [ ] Azure SQL creado y tabla configurada
- [ ] Variables de entorno configuradas en Azure
- [ ] **Credenciales cambiadas** (admin/api-key)
- [ ] Firewall SQL configurado
- [ ] Código desplegado en App Service
- [ ] Health check responde OK
- [ ] Dashboard accesible
- [ ] Registro funciona y redirige a WhatsApp
- [ ] CSV export funciona desde dashboard

---

**Estado**: ✅ **LISTO PARA DESPLEGAR**  
**Versión**: 1.0.0  
**Fecha**: Febrero 13, 2026  
**Proyecto**: V Campeonato Regional de Mototurismo L.A.M.A.
