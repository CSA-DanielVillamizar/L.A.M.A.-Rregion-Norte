# 📋 ESPECIFICACIONES TÉCNICAS FINAL - V CAMPEONATO REGIONAL

## 1. ARQUITECTURA DEL PROYECTO

### Stack Tecnológico
- **Backend:** Node.js + Express.js v4.18.2
- **Sesiones:** express-session v1.18.0
- **Templating:** EJS v3.1.9
- **Frontend:** Tailwind CSS CDN + JavaScript Vanilla
- **Mapas:** Leaflet.js v1.9.4 + Marker Cluster
- **Servidor:** server-demo.js (Puerto 3000)

### Colores Corporativos
- **lamaBlack:** #0A0A0A (Fondo principal)
- **lamaDark:** #1A1A1A (Componentes secundarios)
- **lamaGold:** #D4AF37 (Acentos y bordes)
- **lamaNeon:** #00F5FF (Acentos neon/turquesa)
- **lamaBone:** #F5F5DC (Texto claro)

### Fuentes
- **Headings:** Bebas Neue (tracking: 0.05em)
- **Body:** Montserrat (weights: 400, 600, 700, 800)
- **Accent:** Rock Salt (cursive)

---

## 2. PÁGINAS IMPLEMENTADAS

### 2.1 HOME (/)
**Ubicación:** `src/views/home.ejs`

**Estructura:**
```
1. Navigation (sticky) con logo y menú
2. Hero Section (video background)
3. Features Section (4 características)
4. Stats Section (200+ miembros, 11 eventos, 9 capítulos)
5. EXPERIENCIAS PREMIUM Grid (8 tarjetas glassmorphism)
6. CTA Button (REGISTRO OFICIAL → /registro-campeonato)
7. Footer
```

**Servicios Premium en Home (8 tarjetas):**
1. 🚕 Traslado Aeropuerto: $40.000
2. 🏄 Cupo Jet Ski: $400.000
3. ⛵ Lancha de Lujo/Pontón: $80.000
4. 🛥️ Regata de Veleros: $100.000
5. 🏌️ Mula (Golf Cart): $250.000
6. 🚐 Cupo en Chiva: $50.000
7. 🐴 Tour Burro: $140.000
8. 👕 Jersey Oficial (base): $120.000

**Interactividad:**
- Grid responsivo: 1 columna (móvil) → 2 (tablet) → 4 (desktop)
- Cada tarjeta tiene: emoji, nombre, descripción, precio
- Atributos data: `data-service`, `data-price`
- Clase JavaScript: `ServiciosPremium` (toggles, cálculo dinámico)

---

### 2.2 REGISTRO CAMPEONATO (/registro-campeonato)
**Ubicación:** `src/views/registro-campeonato.ejs`

**Secciones del Formulario:**
1. Tipo de Participante (radio buttons)
2. Datos Personales (nombre, doc, email, teléfono)
3. Contacto de Emergencia
4. Pertenencia L.A.M.A. (capítulo, años)
5. Logística (ciudad origen, transporte)
6. Mercadeo (jersey checkbox)
7. **EXPERIENCIAS PREMIUM** (Grid de 7 servicios, sin Jersey base)
8. Acompañante (opcional)

**Campos Hidden (JavaScript):**
```html
<input id="servicios-seleccionados" name="servicios_adicionales" value="[]">
<input id="valor_total_pagar" name="valor_total" value="120000">
```

**Funcionalidad:**
- Al hacer click en tarjeta de servicio:
  - Borde cambia: `border-lamaGold/50` → `#00f5d4`
  - Background: `rgba(0, 245, 212, 0.1)`
  - Box-shadow neón
  - Se agrega a Set de servicios activos
  - `#valor_total_pagar` se actualiza dinámicamente

---

### 2.3 ITINERARIO (/itinerario) **NUEVO**
**Ubicación:** `src/views/itinerario.ejs`

**Estructura:**
```
1. Hero Section ("RUTA DEL V CAMPEONATO")
2. Mapa Leaflet.js (altura 600px, bordes neón)
3. Controles de Filtro (Todos, Checkpoints, Hoteles, Emergencias)
4. Lista de Checkpoints (grid 3 columnas)
5. Itinerario Detallado (4 etapas del evento)
6. Footer
```

**Mapa Leaflet:**
- **Centro:** San Andrés (12.5847, -81.6975)
- **Zoom inicial:** 13
- **Capa base:** Stadia Maps Alidade Smooth Dark (Dark Mode)
- **Clustering:** Marcadores agrupados si hay muchos puntos juntos

**Puntos de Interés (GeoJSON):**
1. Muelle Portofino (12.5847, -81.6975) - Salida 🚩
2. Johnny Cay (12.5950, -81.7089) - Punto intermedio 🏝️
3. Hotel Decameron Marazul (12.5516, -81.7122) - Alojamiento 🏨
4. Hoyo Soplador (12.5631, -81.7203) - Atracción 💨
5. Centro Médico (12.5800, -81.7100) - Emergencia 🏥

**Popups Glassmorphism:**
- Fondo: `rgba(18, 17, 10, 0.95)`
- Backdrop blur: 10px
- Borde: 2px solid #00F5FF
- Botón "📍 Ver en Google Maps"

**Funcionalidad:**
- Click en filtro → resalta/desactiva marcadores
- Botón geolocalización → muestra posición actual
- Popup con información y enlace a Google Maps

---

### 2.4 DASHBOARD ADMIN (/admin/dashboard)
**Ubicación:** `src/views/admin/dashboard.ejs`

**Secciones:**
1. **Estadísticas principales** (4 tarjetas):
   - Total Inscripciones
   - Pagos Confirmados
   - Pagos Pendientes
   - Total Recaudado

2. **NUEVO: Resumen de Servicios Premium** (4 tarjetas):
   - 🏄 Jet Ski (cantidad, total)
   - ⛵ Lancha de Lujo (cantidad, total)
   - 🛥️ Regata Veleros (cantidad, total)
   - 🏌️ Mula (cantidad, total)

3. **Tabla de Inscripciones** (8 columnas):
   - ID | Nombre | Documento | Tipo | Capítulo | **Servicios** | Total | Estado | Acciones
   - Columna "Servicios": Muestra cantidad (ej: "2 servicios")
   - Acciones: Aprobar, Rechazar, Ver Detalles

4. **Gestión de Eventos** (tab secundario)

**Datos Mock (Demo):**
```javascript
inscripciones: [
    {
        id_inscripcion: 1,
        nombre_completo: 'Juan Pérez',
        servicios_adicionales: '[{"servicio":"jet-ski","precio":400000}...]',
        valor_total_pagar: 190000,
        estado_validacion: 'Pendiente'
    },
    // ...
],
stats: {
    servicios_premium: {
        jet_ski: { cantidad: 1, total: 400000 },
        lancha_lujo: { cantidad: 1, total: 80000 },
        // ...
    }
}
```

---

## 3. TICKER DE URGENCIA **NUEVO**

**Ubicación:** `public/js/ticker.js`

**Ubicación visual:** Debajo del Header, arriba del contenido principal

**Anuncios incluidos:**
1. ⚠️ CIERRE INSCRIPCIONES (30 de Agosto)
2. 🏆 CUPOS LIMITADOS (12 lugares disponibles)
3. ✈️ VUELOS ESPECIALES (40% descuento)
4. 🎫 EARLY BIRD GANA (2 servicios gratis)
5. 🚗 TRANSPORTE INCLUIDO (100% cubierto)

**Funcionalidad:**
- Rotación automática cada 6 segundos
- Botones: ANTERIOR ← | SIGUIENTE →
- Animación: `slideIn` + `pulse` de emoji
- Glassmorphism con gradiente
- Colores dinámicos por tipo de anuncio

**Clase JavaScript:**
```javascript
class TickerUrgencia {
    constructor()
    render()
    next() / previous()
    startAutoRotate() / stopAutoRotate()
    addAnnouncement(announcement)
}
```

---

## 4. SERVICIOS PREMIUM - FUNCIONALIDAD COMPLETA

**Archivo JavaScript:** `public/js/servicios-premium.js`

**Clase ServiciosPremium:**
```javascript
constructor() {
    this.servicios = new Set()      // Servicios activos
    this.precioBase = 120000        // Jersey Oficial
    this.init()
}

methods:
  - init()                          // Inicializa event listeners
  - toggleServicio(card, event)     // Toggle visual + suma
  - actualizarTotal()               // Recalcula #valor_total_pagar
  - actualizarFormulario()          // Guarda JSON en input hidden
  - obtenerResumen()                // Devuelve objeto con servicios
  - generarTextosWhatsApp()         // Desglose para envío por WhatsApp
```

**Flujo de datos:**
```
1. Usuario click en card → toggleServicio()
2. Borde: #D4AF37 → #00F5FF
3. Background: rgba(0, 245, 212, 0.1)
4. Box-shadow neón
5. Servicio agregado a Set
6. actualizarTotal():
   - suma = precioBase (120000) + sum(servicios seleccionados)
   - #valor_total_pagar = suma
7. actualizarFormulario():
   - #servicios-seleccionados = JSON stringified

8. Al enviar formulario:
   POST /registro-campeonato
   {
       nombre: "...",
       servicios_adicionales: '[...]',
       valor_total: 120000+X
   }
```

---

## 5. ROUTES (server-demo.js)

### Públicas (GET)
- `/` → home.ejs
- `/registro` → registration page
- `/registro-campeonato` → full registration form
- `/eventos` → list of events
- `/eventos/:id` → event details
- `/capitulos` → chapters page (9 chapters)
- `/club` → about LAMA
- `/contacto` → contact form
- `/itinerario` → race route map **NUEVO**

### Admin (requieren autenticación)
- `GET /admin/login` → login page
- `POST /admin/login` → authenticate
- `GET /admin/logout` → clear session
- `GET /admin/dashboard` → stats + inscriptions + **servicios premium**

### API
- `GET /api/health` → server status
- `POST /api/register` → register participant
- `GET /api/check-documento/:doc` → verify document
- `GET /admin/api/eventos` → list events
- `POST /admin/api/eventos` → create event

---

## 6. ESTRUCTURA DE CARPETAS

```
LADINGPAGEREGIONAL/
├── public/
│   ├── js/
│   │   ├── servicios-premium.js       ✅ Toggle de servicios
│   │   └── ticker.js                   ✅ Anuncios rotatorios
│   ├── img/
│   │   └── LAMARegionNorte.png
│   └── css/
├── src/
│   ├── views/
│   │   ├── home.ejs                   ✅ Grid servicios (8)
│   │   ├── registro-campeonato.ejs    ✅ Grid servicios (7) + hidden fields
│   │   ├── itinerario.ejs             ✅ Mapa Leaflet
│   │   ├── capitulos.ejs
│   │   ├── club.ejs
│   │   ├── contact.ejs
│   │   ├── admin/
│   │   │   ├── login.ejs
│   │   │   └── dashboard.ejs          ✅ Resumen servicios
│   │   └── partials/
│   │       ├── header.ejs             ✅ + Itinerario nav + Ticker
│   │       └── footer.ejs
│   └── controllers/
├── server-demo.js                     ✅ + /itinerario route
├── .env
├── package.json
└── README.md
```

---

## 7. FLUJOS DE USUARIO

### Flujo 1: Explorar Servicios (Home)
```
Usuario abre / (home)
    ↓
Ve EXPERIENCIAS PREMIUM grid (8 servicios)
    ↓
Click en tarjeta (ej: Jet Ski)
    ↓
Borde cambia a neón, background brilla
    ↓
Página es informativa (no calcula total aquí)
    ↓
Click en "REGISTRO OFICIAL"
    ↓
Redirige a /registro-campeonato
```

### Flujo 2: Inscribirse con Servicios (Registro)
```
Usuario abre /registro-campeonato
    ↓
Completa datos personales
    ↓
Llega a EXPERIENCIAS PREMIUM
    ↓
Click en Jet Ski + Lancha (2 servicios)
    ↓
#valor_total_pagar: 120000 → 600000 (120k base + 400k + 80k)
    ↓
Completa resto del formulario
    ↓
Envía formulario (POST)
    ↓
Backend recibe:
   servicios_adicionales: '[...]'
   valor_total: 600000
```

### Flujo 3: Admin Revisa Inscripciones
```
Admin abre /admin/dashboard
    ↓
Ve estadísticas principales
    ↓
Ve RESUMEN SERVICIOS PREMIUM:
   - 🏄 Jet Ski: 3 cupos, $1.200.000 total
   - ⛵ Lancha: 2 cupos, $160.000 total
    ↓
Ve tabla con columna "Servicios"
    ↓
Click en inscripción con "2 servicios"
    ↓
Puede Aprobar/Rechazar/Ver Detalles
```

### Flujo 4: Explorar Itinerario (Mapa)
```
Usuario abre /itinerario
    ↓
Ve mapa Leaflet centrado en San Andrés
    ↓
5 marcadores: Muelle, Johnny Cay, Hotel, Hoyo Soplador, Centro Médico
    ↓
Click en marcador → popup Glassmorphism
    ↓
Botón "📍 Ver en Google Maps"
    ↓
Se abre Google Maps en nueva pestaña
    ↓
Puede usar filtros: Checkpoints, Hoteles, Emergencias
    ↓
Botón "Mi ubicación" → geolocalización
```

---

## 8. VALIDACIONES Y SEGURIDAD

### Frontend (JavaScript)
- ✅ Validación de servicios duplicados (Set)
- ✅ Cálculo dinámico sin errores
- ✅ Almacenamiento en inputs hidden
- ✅ Generación de mensajes WhatsApp

### Backend (Express)
- ✅ Autenticación de admin (express-session)
- ✅ Verificación de documento único
- ✅ Validación de teléfono (próximo)
- ✅ Manejo de errores con try/catch
- ✅ Protección de rutas admin

### Base de Datos (Futuro)
- [ ] Tabla: inscripciones (con campo servicios_adicionales JSON)
- [ ] Tabla: servicios_premium (catálogo)
- [ ] Foreign keys: inscripción → servicios
- [ ] Índices: documento (UNIQUE), capítulo

---

## 9. PENDIENTE PARA PRÓXIMAS VERSIONES

### Prioridad ALTA
- [ ] Integración base de datos real (PostgreSQL/MongoDB)
- [ ] Exportación CSV mejorada con desglose de servicios
- [ ] Validación de teléfono con máscara (+57)
- [ ] Correo de confirmación automático

### Prioridad MEDIA
- [ ] Interacción: Hover "Mula" en grid → resalta ruta en mapa
- [ ] Página de éxito post-inscripción con resumen QR
- [ ] Dashboard: Gráficos de ingresos por servicio
- [ ] API: Webhook para pagos Stripe/PayPal

### Prioridad BAJA
- [ ] Mobilidad: Menú móvil ampliado (hamburger menu animado)
- [ ] I18n: Soporte multiidioma (EN/ES/PT)
- [ ] Dark/Light Mode toggle
- [ ] Historico de cambios en admin

---

## 10. TESTING CHECKLIST

**Frontend:**
- [ ] Home: Grid responsive en 3 breakpoints
- [ ] Registro: Cálculo dinámico correcto (base + servicios)
- [ ] Registro: Inputs hidden llenan correctamente
- [ ] Itinerario: Mapa carga y centrado en San Andrés
- [ ] Itinerario: Filtros ocultan/muestran marcadores
- [ ] Ticker: Rotación automática y botones funcionan
- [ ] Header: Menú tiene enlace a /itinerario

**Backend:**
- [ ] GET /itinerario → renderiza itinerario.ejs
- [ ] POST /registro-campeonato → guarda servicios_adicionales
- [ ] GET /admin/dashboard → muestra resumen servicios
- [ ] Admin: Columna Servicios muestra cantidad correcta

---

## 11. NOTAS TÉCNICAS

### Glassmorphism CSS
```css
background: rgba(26, 25, 25, 0.4);
backdrop-filter: blur(10px);
border: 2px solid #D4AF37;
box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
```

### Dark Mode Leaflet
```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
```

### Animaciones Tailwind
```
fadeInUp, pulse, slideIn, bounce
```

---

**Versión:** 1.0.0
**Última actualización:** 2026-01-15
**Estado:** ✅ PRIORIDAD 1 y 2 COMPLETADAS

