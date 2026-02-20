# 📸 Guía de Imágenes y Assets

## ✅ Logo Oficial

### `LAMARegionNorte.png`
- **Ubicación**: `public/img/LAMARegionNorte.png`
- **Estado**: ✅ **OFICIAL - EN USO**
- **Implementado en**:
  - Header principal (navegación)
  - Footer del sitio
  - Dashboard de administración
- **Características**: Logo oficial del club L.A.M.A. Región Norte

---

## 🎨 Imágenes Placeholder (SVG)

Se han generado 3 imágenes SVG placeholder en `public/img/`:

### 1. `hero-bg.svg` (1920x1080)
- Fondo degradado negro/gris
- Logo "L.A.M.A. HARDCORE TROPICAL"
- Patrón de onda dorada decorativa
- **Uso**: Background del hero section (actualmente usa Unsplash)

### 2. `logo.svg` (400x400)
- Logo circular con gradiente dorado-turquesa
- Texto "L.A.M.A REGIÓN NORTE"
- **Estado**: ⚠️ **REEMPLAZADO** por `LAMARegionNorte.png`

### 3. `favicon.svg` (32x32)
- Ícono simple de escudo dorado
- **Uso**: Favicon del sitio

---

## 🖼️ Imágenes Recomendadas para Producción

Si deseas reemplazar los placeholders SVG, aquí están las especificaciones:

### Hero Section
- **Nombre**: `hero-motorcycle.jpg`
- **Dimensiones**: 1920x1080px (16:9)
- **Contenido**: Motocicletas en carretera, ambiente tropical
- **Formato**: JPG optimizado (< 500KB)

### Logo Principal
- **Nombre**: `logo-lama.png`
- **Dimensiones**: 400x400px (transparente)
- **Contenido**: Logo oficial L.A.M.A. Región Norte
- **Formato**: PNG con transparencia

### Eventos (Opcional)
- **Nombre**: `evento-san-andres.jpg`
- **Dimensiones**: 800x600px
- **Contenido**: Playa, jet skis, islas
- **Formato**: JPG optimizado

---

## 🔄 Cómo Cambiar Imágenes

### Opción 1: Usar URLs Externas (Actual)
El hero ya usa Unsplash:
```html
bg-[url('https://images.unsplash.com/photo-1544551763...')]
```

**Ventajas**: No ocupa espacio en servidor  
**Desventajas**: Depende de servicio externo

### Opción 2: Usar Imágenes Locales
1. Coloca tus imágenes en `public/img/`
2. Actualiza la ruta en `home.ejs`:

```html
<!-- Antes -->
bg-[url('https://images.unsplash.com/...')]

<!-- Después -->
bg-[url('/img/hero-motorcycle.jpg')]
```

---

## 📁 Estructura de Carpetas Public

```
public/
├── img/
│   ├── LAMARegionNorte.png  ✅ Logo Oficial (EN USO)
│   ├── hero-bg.svg          ✅ Creado
│   ├── logo.svg             ⚠️  Placeholder (reemplazado por PNG)
│   ├── favicon.svg          ✅ Creado
│   ├── hero-motorcycle.jpg  ⬜ Opcional (foto real)
│   ├── evento-san-andres.jpg ⬜ Opcional
│   └── ...
├── css/
│   └── (estilos personalizados si los necesitas)
└── js/
    └── (scripts personalizados si los necesitas)
```
│   ├── hero-bg.svg          ✅ Creado
│   ├── logo.svg             ✅ Creado
│   ├── favicon.svg          ✅ Creado
│   ├── hero-motorcycle.jpg  ⬜ Opcional
│   └── evento-san-andres.jpg ⬜ Opcional
├── css/
│   └── custom.css           ⬜ Futuro
└── js/
    └── main.js              ⬜ Futuro
```

---

## 🎯 Sitios Recomendados para Descargar Imágenes

### Gratuitas (Sin Copyright)
1. **Unsplash**: https://unsplash.com/s/photos/motorcycle
2. **Pexels**: https://www.pexels.com/search/motorcycle%20club/
3. **Pixabay**: https://pixabay.com/images/search/motorcycle/

### Búsquedas Sugeridas
- "motorcycle club road"
- "harley davidson tropical"
- "motorcycle beach sunset"
- "jet ski caribbean"
- "san andres island colombia"

---

## ✅ Estado Actual del Sitio

### Imágenes Funcionales
✅ Hero background (Unsplash externa)  
✅ Favicon SVG placeholder  
✅ Logo SVG placeholder  
✅ No hay imágenes rotas

### ¿El sitio se ve "roto"?
**NO** - Todas las rutas apuntan a:
- URLs externas (Unsplash) ✅
- SVG generados ✅
- Sin rutas rotas ✅

---

## 🚀 Deployment en Azure

El archivo `web.config` ya está configurado para:
- Servir archivos estáticos de `public/`
- Manejar rutas dinámicas con Express
- Caché de 7 días para imágenes
- MIME types para SVG, JSON, WOFF2

---

## 🧪 Prueba Local

```bash
# 1. Inicia el servidor
npm start

# 2. Abre en navegador
http://localhost:3000

# 3. Verifica que carguen:
# - Hero con imagen de fondo ✅
# - Logo en header (si existe) ✅
# - Sin errores 404 en consola ✅
```

---

## 📊 Optimización de Imágenes

Si subes imágenes JPG/PNG, optimízalas antes:

### Herramientas Recomendadas
1. **TinyPNG**: https://tinypng.com/ (hasta 5MB)
2. **Squoosh**: https://squoosh.app/ (Google)
3. **ImageOptim**: https://imageoptim.com/ (Mac)

### Tamaños Recomendados
- Hero: < 500KB
- Logos: < 50KB
- Eventos: < 200KB cada uno

---

**Estado**: ✅ Sin imágenes rotas  
**Fecha**: 13 de febrero de 2026
