# Servicios Premium para Acompañantes - Guía de Prueba

## Cambios Realizados

### 1. **Servicios Por Persona Agregados a Acompañantes**

Los siguientes 4 servicios ahora están disponibles para **cada acompañante**:

- ✅ **Lancha de Lujo** - $80.000 por persona
- ✅ **Velero 7 Colores** - $100.000 por persona
- ✅ **Cupo en Chiva** - $50.000 por persona
- ✅ **Tour Burro** - $140.000 por persona

### 2. **Ubicación de Servicios de Acompañantes**

Los servicios aparecen en cada bloque de acompañante dentro del formulario de registro, bajo la sección **"SERVICIOS ADICIONALES (Costos por persona)"**

### 3. **Actualización de Cálculo de Total**

- El resumen de pago ahora **suma automáticamente** los servicios del participante principal + servicios de todos los acompañantes
- El contador de "Servicios Premium" muestra el **total de items** seleccionados (incluyendo acompañantes)

---

## Flujo de Prueba

### Escenario 1: Participante + 1 Acompañante con Servicios

1. **Abre**: `http://localhost:3000/registro-campeonato`

2. **Completa datos del participante principal**:
   - Nombre, Documento, EPS, etc.
   - Selecciona **Jet Ski** ($400.000)

3. **Marca**: "¿Asistirá con acompañante?" ✅

4. **Haz click**: "Agregar acompañante"

5. **En el bloque del Acompañante #1**:
   - Completa: Nombre, Documento, Teléfono
   - **Selecciona**: "Lancha de Lujo" ($80.000)
   - **Selecciona**: "Tour Burro" ($140.000)

6. **Verifica en "Resumen de Pago"**:
   - Inscripción: $300.000 (participante $150k + acompañante $150k)
   - Servicios Premium: $620.000
     - Jet Ski (participante): $400.000
     - Lancha (acompañante): $80.000
     - Tour Burro (acompañante): $140.000
   - **Total**: $920.000

---

### Escenario 2: Múltiples Acompañantes con Diferentes Servicios

1. **Participa**: Agrega 2 acompañantes

2. **Acompañante #1**:
   - Selecciona: "Velero 7 Colores" ($100.000)

3. **Acompañante #2**:
   - Selecciona: "Cupo en Chiva" ($50.000)

4. **Verifica**:
   - Servicios Premium debe mostrar: **3 items**
   - Total debe incluir todos: $150k + $100k + $50k = $300k en servicios

---

## Variables JavaScript

Cada acompañante tiene:
- `.acompanante-nombre` → Nombre
- `.acompanante-documento` → Documento
- `.acompanante-telefono` → Teléfono
- `.acompanante-jersey` → Checkbox Jersey
- `.acompanante-service-check` → Checkboxes de servicios
- `.acompanante-servicios-json` → JSON guardado con servicios seleccionados

---

## Validación

- ✅ Nombre, Documento, Teléfono de acompañante son **obligatorios**
- ✅ Si selecciona Jersey, la talla es **obligatoria**
- ✅ Servicios son **opcionales** (no bloquean envío)
- ✅ Los acompañantes sin servicios seleccionados **no se cuentan** en el total

---

## Integración con Servicios Principales

### Servicios que NO aplican a Acompañantes:
- **Traslado Aeropuerto** ($40.000) - Solo individual en el participante principal
- **Jet Ski** ($400.000) - Solo en participante principal (es para 2 personas)
- **Mula (Golf Cart)** ($250.000) - Solo en participante principal (es para 5 personas)

### Servicios disponibles para AMBOS (participante + acompañantes):
- **Lancha de Lujo** - Sí ✅
- **Velero 7 Colores** - Sí ✅
- **Cupo en Chiva** - Sí ✅
- **Tour Burro** - Sí ✅

---

## Troubleshooting

### Los servicios de acompañantes no aparecen
→ Presiona **Ctrl+Shift+R** para limpiar cache del navegador

### El total no se actualiza
→ Abre la consola (F12) y verifica que no hay errores JavaScript

### Los servicios se guardan pero no se suman
→ Verifica que las funciones `actualizarServiciosAcompanante()` y `updateResumenPago()` se ejecuten (console.log)

---

## Archivos Modificados

- `src/views/registro-campeonato.ejs`
  - Función `crearAcompananteItem()` - Agregados 4 servicios
  - Función `actualizarServiciosAcompanante()` - Nueva función
  - Función `updateResumenPago()` - Incluye servicios de acompañantes

---

## Próximos Pasos

- [ ] Probar en navegador con varios acompañantes
- [ ] Verificar que WhatsApp message incluya servicios de acompañantes
- [ ] Confirmar que la base de datos guarde los servicios correctamente
- [ ] Ajustar validaciones si es necesario

