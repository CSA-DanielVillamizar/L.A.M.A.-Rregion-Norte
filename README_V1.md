# 🏍️ V CAMPEONATO REGIONAL L.A.M.A. - v1.0.0

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-production-brightgreen)

**Landing page + Sistema de Registro** completo para el V Campeonato Regional de L.A.M.A.

---

## ✨ Características Principales

- ✅ **Grid de Experiencias Premium** (8 servicios con toggle dinámico)
- ✅ **Mapa Interactivo Leaflet** (5 puntos con filtros)
- ✅ **Ticker de Urgencia** (Anuncios rotativos automáticos)
- ✅ **Dashboard Admin** (Resumen de servicios)
- ✅ **100% Responsivo** (Mobile-first)

---

## 🚀 Inicio Rápido

```bash
npm install
npm start
# http://localhost:3000
```

---

## 🎯 Funcionalidades

### 1. Grid de Experiencias Premium (8 Servicios)
- Ubicación: Home + Registro
- Toggle visual: borde dorado → neón turquesa
- Cálculo dinámico de valor total
- Glassmorphism con backdrop-blur
- Almacenamiento JSON

**Servicios:**
1. 🚕 Traslado: $40k | 2. 🏄 Jet Ski: $400k | 3. ⛵ Lancha: $80k
4. 🛥️ Regata: $100k | 5. 🏌️ Mula: $250k | 6. 🚐 Chiva: $50k
7. 🐴 Tour Burro: $140k | 8. 👕 Jersey (base): $120k

### 2. Mapa Interactivo (`/itinerario`)
- 5 marcadores en San Andrés
- Filtros dinámicos
- Geolocalización
- Popups con Google Maps
- Dark mode

**Puntos:** Muelle Portofino 🚩 | Johnny Cay 🏝️ | Hotel 🏨 | Hoyo Soplador 💨 | Centro Médico 🏥

### 3. Ticker de Urgencia
- 5 anuncios rotativos
- Rotación automática (6s)
- Botones: ANTERIOR | SIGUIENTE
- Glassmorphism

### 4. Dashboard Admin
- Usuario: `admin` / Contraseña: `admin123`
- Estadísticas principales
- Resumen de servicios premium ⭐ NUEVO
- Tabla inscripciones con columna "Servicios"

---

## 🎨 Diseño

**Colores:**
- lamaBlack: #0A0A0A | lamaDark: #1A1A1A
- lamaGold: #D4AF37 | lamaNeon: #00F5FF | lamaBone: #F5F5DC

**Responsividad:**
- Mobile (1 col) → Tablet (2 col) → Desktop (4 col)

---

## 📁 Estructura

```
├── public/js/
│   ├── servicios-premium.js (Toggle + cálculo)
│   └── ticker.js (Anuncios)
├── src/views/
│   ├── home.ejs (Grid servicios)
│   ├── registro-campeonato.ejs (Formulario + Grid)
│   ├── itinerario.ejs (Mapa) ⭐ NUEVO
│   ├── admin/dashboard.ejs (Admin) ⭐ MEJORADO
│   └── partials/header.ejs (+ Nav + Ticker)
├── server-demo.js (+ /itinerario ruta)
└── Documentación/
    ├── ESPECIFICACIONES_TECNICAS.md
    ├── RESUMEN_CAMBIOS.md
    ├── GUIA_PRUEBA_RAPIDA.md
    └── CHANGELOG.md
```

---

## 📚 Documentación Completa

- [ESPECIFICACIONES_TECNICAS.md](./ESPECIFICACIONES_TECNICAS.md) - Arquitectura y APIs
- [RESUMEN_CAMBIOS.md](./RESUMEN_CAMBIOS.md) - Cambios implementados
- [GUIA_PRUEBA_RAPIDA.md](./GUIA_PRUEBA_RAPIDA.md) - Pruebas paso a paso
- [CHANGELOG.md](./CHANGELOG.md) - Historial de versiones

---

## ✅ Tests Validados

- ✅ Home: Grid responsive (1/2/4 columnas)
- ✅ Registro: Toggle + cálculo dinámico
- ✅ Itinerario: Mapa + filtros + geoloc
- ✅ Ticker: Rotación automática
- ✅ Admin: Resumen servicios + tabla

---

## 🚀 Roadmap

**v1.1.0:** Base de datos PostgreSQL, Pagos Stripe, Email automático
**v1.2.0:** Gráficos, Multiidioma, Dark/Light mode
**v2.0.0:** App móvil, Push notifications, Analytics

---

## 📊 Estadísticas

- **Líneas de código:** ~2,500+
- **Archivos nuevos:** 4
- **Archivos actualizados:** 5
- **Funcionalidades:** 3 sistemas
- **Status:** ✅ Production-ready

---

**Versión 1.0.0 | Actualizado 15/01/2026 | MIT License**

🏍️ **¡Házte LAMA →** `/registro-campeonato`
