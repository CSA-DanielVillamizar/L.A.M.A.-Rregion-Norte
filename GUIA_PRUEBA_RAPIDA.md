# 🧪 GUÍA DE PRUEBA RÁPIDA - V CAMPEONATO REGIONAL

## ⚡ INICIO RÁPIDO (5 minutos)

### 1️⃣ Levantar servidor
```bash
npm install
npm start
```
✅ Servidor corriendo en http://localhost:3000

---

## 🎯 PRUEBA 1: GRID DE SERVICIOS (HOME)

**URL:** http://localhost:3000/

**Pasos:**
1. Abre página HOME
2. Desplázate hasta sección "EXPERIENCIAS PREMIUM"
3. Verás 8 tarjetas con servicios (Traslado, Jet Ski, Lancha, etc.)

**Validar:**
- ✅ Tarjetas muestran: emoji | nombre | descripción | precio
- ✅ Grid responsive: 1 columna (móvil) → 2 (tablet) → 4 (desktop)
- ✅ Tarjetas tienen borde lamaGold (#D4AF37)
- ✅ Al pasar mouse: cambios de opacidad

**Expected:** 8 tarjetas perfectamente alineadas con Glassmorphism

---

## 🎯 PRUEBA 2: CÁLCULO DINÁMICO DE SERVICIOS (REGISTRO)

**URL:** http://localhost:3000/registro-campeonato

**Pasos:**
1. Abre página de REGISTRO CAMPEONATO
2. Desplázate hasta sección "EXPERIENCIAS PREMIUM"
3. Busca el valor inicial en el formulario (debería decir $120.000 - Jersey base)

```
Ver donde dice "Valor Total a Pagar:" → debería mostrar $120.000
```

4. **Click en tarjeta "Cupo Jet Ski"** ($400.000)
5. Observa cambios visuales:
   - Borde cambia de dorado a **turquesa neón** (#00F5FF)
   - Background brilla con color turquesa translúcido
   - Box-shadow neón alrededor

6. Desplázate hacia arriba del formulario
7. Busca "Valor Total a Pagar:" → ahora debe decir **$520.000**
   - (120.000 base + 400.000 Jet Ski)

**Click en tarjeta "Lancha de Lujo"** ($80.000)
- Valor Total → **$600.000**
- Ahora tienes 2 tarjetas con borde turquesa

**Click de nuevo en Jet Ski para deseleccionar**
- Borde vuelve a dorado
- Valor Total → **$200.000**
- (120.000 base + 80.000 Lancha)

**Validar:**
- ✅ Borde cambia: lamaGold → lamaNeon
- ✅ Background se ilumina con gradiente turquesa
- ✅ Cálculo es correcto: suma dinámicamente
- ✅ Toggle funciona: click 2x = deseleccionar

**Expected:** Cálculo perfecto y UI responsiva al toggle

---

## 🗺️ PRUEBA 3: MAPA LEAFLET (ITINERARIO)

**URL:** http://localhost:3000/itinerario

### Sección: Mapa Interactivo

**Pasos:**
1. Abre /itinerario
2. Desplázate a sección "🗺️ MAPA INTERACTIVO"
3. Verás mapa centrado en San Andrés

**Validar Mapa:**
- ✅ Mapa carga sin errores
- ✅ Centro: San Andrés (12.5847, -81.6975)
- ✅ 5 marcadores visibles:
  - 🚩 Muelle Portofino (arriba a la izquierda)
  - 🏝️ Johnny Cay (arriba a la derecha)
  - 🏨 Hotel Decameron Marazul (abajo)
  - 💨 Hoyo Soplador (derecha)
  - 🏥 Centro Médico (centro)

**Interactividad:**
4. **Click en marcador Muelle Portofino** (🚩)
   - Abre popup Glassmorphism
   - Muestra: nombre, descripción, botón "📍 Ver en Google Maps"
   - Popup tiene borde turquesa neón

5. **Click botón "📍 Ver en Google Maps"**
   - Abre Google Maps en nueva pestaña
   - Demuestra coordinadas correctas

6. **Botón Geolocalización** (arriba derecha)
   - Click → aparece marcador azul con tu ubicación
   - Mapa se centra automáticamente

### Sección: Filtros

7. **Click botón "TODOS LOS PUNTOS"** (debe estar activo - turquesa)
   - Todos los 5 marcadores visibles

8. **Click botón "CHECKPOINTS"**
   - Botón se activa (turquesa)
   - Solo muestran: Muelle, Johnny Cay, Hoyo Soplador (3 puntos)
   - Hotel y Centro Médico desaparecen (opacidad 0.3)

9. **Click botón "HOTELES"**
   - Solo visible: Hotel Decameron Marazul

10. **Click botón "EMERGENCIAS"**
    - Solo visible: Centro Médico

11. **Click "TODOS LOS PUNTOS"** de nuevo
    - Vuelven todos los 5 marcadores

**Validar:**
- ✅ Mapa renderiza sin errores
- ✅ Leaflet CDN carga correctamente
- ✅ 5 marcadores con iconos emoji
- ✅ Popups Glassmorphism funcionan
- ✅ Google Maps links correctos
- ✅ Filtros ocultan/muestran marcadores
- ✅ Geolocalización funciona

**Expected:** Mapa interactivo 100% funcional

---

## 📢 PRUEBA 4: TICKER DE URGENCIA

**URL:** http://localhost:3000/ (o cualquier página)

**Pasos:**
1. Abre HOME (/)
2. Justo debajo del header/navegación, verás el TICKER
3. Muestra anuncio: ⚠️ CIERRE INSCRIPCIONES - 30 de Agosto

**Interactividad:**
4. **Espera 6 segundos**
   - El anuncio cambia automáticamente al siguiente
   - Animación slideIn + pulse en emoji

5. **Click botón "SIGUIENTE →"**
   - Avanza al próximo anuncio manualmente
   - Rotación automática se reinicia

6. **Click botón "← ANTERIOR"**
   - Retrocede al anuncio anterior
   - Rotación automática se reinicia

7. **Verifica los 5 anuncios:**
   - ⚠️ CIERRE INSCRIPCIONES
   - 🏆 CUPOS LIMITADOS
   - ✈️ VUELOS ESPECIALES
   - 🎫 EARLY BIRD GANA
   - 🚗 TRANSPORTE INCLUIDO

**Validar:**
- ✅ Ticker visible en todas las páginas
- ✅ Rotación automática cada 6 segundos
- ✅ Botones funcionan correctamente
- ✅ Colores dinámicos por tipo
- ✅ Glassmorphism con backdrop-blur
- ✅ Animaciones suave

**Expected:** Ticker funcional y visualmente atractivo

---

## 👨‍💼 PRUEBA 5: DASHBOARD ADMIN

**URL:** http://localhost:3000/admin/login

### Acceso
1. Login con:
   - Usuario: `admin`
   - Contraseña: `admin123`

### Sección: Estadísticas Principales
2. Verás 4 tarjetas:
   - Total Inscripciones: 2
   - Pagos Confirmados: 1
   - Pagos Pendientes: 1
   - Total Recaudado: $310.000

### NUEVA Sección: Resumen de Servicios Premium
3. Verás 4 tarjetas con emoji:
   - 🏄 Jet Ski: 1 cupo | Total: $400.000
   - ⛵ Lancha de Lujo: 1 cupo | Total: $80.000
   - 🛥️ Regata Veleros: 0 cupos | Total: $0
   - 🏌️ Mula (Golf Cart): 0 cupos | Total: $0

### Tabla de Inscripciones
4. Desplázate a la tabla
5. Verifica columnas (de izquierda a derecha):
   - ID | Nombre | Documento | Tipo | Capítulo | **Servicios** | Total | Estado | Acciones

6. **Columna "Servicios":**
   - Juan Pérez: "2 servicios" (turquesa badge)
   - María García: "—" (sin servicios)

**Validar:**
- ✅ Resumen servicios muestra correctamente
- ✅ Columna "Servicios" presente en tabla
- ✅ Badges turquesa con cantidad
- ✅ JSON se parsea correctamente
- ✅ Estadísticas coinciden con datos

**Expected:** Admin muestra resumen completo de servicios

---

## 📱 PRUEBA 6: RESPONSIVIDAD

**Pasos:**
1. Abre cualquier página en Chrome
2. Presiona `F12` para abrir DevTools
3. Click en icono móvil (Toggle device toolbar) o `Ctrl+Shift+M`

**Prueba en 3 tamaños:**

### Móvil (375px)
- ✅ Grid servicios: 1 columna
- ✅ Header: Menú se oculta (hamburger)
- ✅ Mapa: responsive (no se sale)
- ✅ Ticker: texto legible

### Tablet (768px)
- ✅ Grid servicios: 2 columnas
- ✅ Mapa: se ajusta al ancho
- ✅ Dashboard tabla: scroll horizontal

### Desktop (1024px)
- ✅ Grid servicios: 4 columnas
- ✅ Mapa: ancho completo
- ✅ Dashboard: tabla completa sin scroll

**Expected:** UI perfecta en todos los breakpoints

---

## 🔗 PRUEBA 7: NAVEGACIÓN INTEGRADA

**Pasos:**
1. Abre HOME (http://localhost:3000)
2. En el **header (navegación)**, verifica enlaces:
   - INICIO → /
   - HAZTE LAMA → /registro
   - EVENTOS → /eventos
   - CAPÍTULOS → /capitulos
   - **ITINERARIO** → /itinerario ✅ NUEVO
   - CLUB → /club
   - CONTACTO → /contacto

3. Click en "ITINERARIO"
   - Navega a /itinerario correctamente
   - Mapa carga

4. En menú móvil (hamburger):
   - Click hamburger menu
   - Verifica que "ITINERARIO" aparece en lista

**Expected:** Navegación integrada correctamente

---

## 💾 PRUEBA 8: DATOS PERSISTENTES

**Pasos:**
1. Abre /registro-campeonato
2. Selecciona: Jet Ski + Lancha (2 servicios)
3. Valor Total = $600.000
4. Abre DevTools (F12)
5. Ve a pestaña "Elements" o "Inspector"
6. Busca:
   ```html
   <input id="valor_total_pagar" name="valor_total" value="600000">
   <input id="servicios-seleccionados" name="servicios_adicionales" value="[...]">
   ```

7. Verifica que `value="600000"` (no 120000)
8. JSON en `servicios_adicionales` debe contener:
   ```json
   [
     {"servicio":"jet-ski","precio":400000},
     {"servicio":"lancha-lujo","precio":80000}
   ]
   ```

**Expected:** Datos se guardan en inputs hidden correctamente

---

## 📊 CHECKLIST FINAL DE VALIDACIÓN

```
✅ Home: Grid 8 servicios visible
✅ Registro: Grid 7 servicios + toggle funcional
✅ Registro: Cálculo dinámico de total ($120k base + servicios)
✅ Itinerario: Mapa Leaflet con 5 puntos
✅ Itinerario: Filtros funcionan
✅ Itinerario: Popups con enlaces Google Maps
✅ Ticker: Rotación automática + botones
✅ Ticker: Visible en header de todas las páginas
✅ Admin: Resumen servicios premium visible
✅ Admin: Columna "Servicios" en tabla
✅ Header: Navegación integrada con /itinerario
✅ Responsive: Grid servicios en 3 breakpoints
✅ Responsive: Mapa ajusta al ancho
✅ DevTools: Inputs hidden llenan correctamente
```

---

## 🐛 TROUBLESHOOTING

### Problema: Mapa no carga en /itinerario
**Solución:** Verifica conexión a internet (Leaflet CDN)

### Problema: Servicios no cambian de color
**Solución:** Verifica que `servicios-premium.js` se cargó:
- F12 → Console → `window.ServiciosPremium` debe existir

### Problema: Ticker no rota automáticamente
**Solución:** Verifica que `ticker.js` se cargó:
- F12 → Console → `window.tickerUrgencia` debe existir

### Problema: Admin no muestra "Resumen Servicios"
**Solución:** Verifica que data.stats.servicios_premium se envía desde server-demo.js

### Problema: Inputs hidden no se llenan
**Solución:** Verifica que hiciste click en las tarjetas de servicios (deben cambiar de color)

---

## 🎉 ¡LISTO!

Si todas las pruebas pasan, el proyecto está **100% funcional**. 

Próximo paso: Integración con base de datos real y sistema de pagos.

**Notas:**
- Los datos son MOCK (demo). No se guardan en BD.
- Servicios seleccionados se guardan en JSON en inputs hidden
- Para producción: conectar a PostgreSQL/MongoDB

---

**Versión:** 1.0.0
**Última actualización:** 2026-01-15
**Tiempo estimado de prueba:** 15 minutos

