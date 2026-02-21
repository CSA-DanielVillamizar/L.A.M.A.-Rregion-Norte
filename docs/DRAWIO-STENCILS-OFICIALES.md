# Draw.io en VS Code: uso de stencils oficiales (Azure + GitHub)

Este proyecto ya incluye diagramas listos en:
- `docs/arquitectura-solucion-iconos.drawio`
- `docs/flujo-despliegue-operativo-iconos.drawio`
- `docs/runbook-incidentes-operativos-iconos.drawio`

## 1) Abrir con la extensión Draw.io

1. En VS Code, abre cualquiera de los archivos `.drawio` anteriores.
2. Ábrelo con **Draw.io Integration** (vista visual, no texto).
3. Activa cuadrícula/snap para ajustes finos de layout.

## 2) Cargar librerías oficiales de Azure (stencils)

En Draw.io (More Shapes / Open Library from URL), usa estos URLs:

- `https://raw.githubusercontent.com/dwarfered/azure-architecture-icons-for-drawio/main/azure-public-service-icons/003%20app%20services.xml`
- `https://raw.githubusercontent.com/dwarfered/azure-architecture-icons-for-drawio/main/azure-public-service-icons/009%20databases.xml`
- (Opcional todo Azure) `https://raw.githubusercontent.com/dwarfered/azure-architecture-icons-for-drawio/main/azure-public-service-icons/000%20all%20azure%20public%20service%20icons.xml`

## 3) Activo oficial de GitHub en este repo

- Archivo local oficial usado: `docs/icons-official/github-mark.svg`
- En Draw.io puedes insertarlo con **Insert > Image** para mantener consistencia con los SVG publicados.

## 4) Convenciones de arquitectura usadas

- Diagramas por **dominios/capas** (Canal, Plataforma Azure, Datos, DevOps/Gobierno).
- Flujos numerados `F1..Fn` y leyenda operativa.
- No se distorsionan iconos (lineamiento de marca).

## 5) Exportación recomendada

- Formato: `SVG`
- Escala: 1x (vector)
- Fondo: transparente o blanco según uso en README
- Mantener texto editable en export cuando sea posible

## 6) Publicación en este repo

Después de editar:

1. Guarda el `.drawio`
2. Exporta/actualiza el `.svg` correspondiente
3. Verifica que ambos (fuente + render) queden sincronizados
4. Commit de ambos archivos en el mismo cambio
