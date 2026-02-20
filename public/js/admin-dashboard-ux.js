/**
 * Módulo de UX Mejorada para Dashboard Admin
 * Hito 5 - Filtros avanzados, notificaciones y feedback visual
 */

class AdminDashboardUX {
    constructor() {
        this.filteredData = [];
        this.originalData = [];
        this.init();
    }

    init() {
        this.setupFilterListeners();
        this.setupLoadingStates();
    }

    /**
     * Configurar escuchadores de filtros avanzados
     */
    setupFilterListeners() {
        const filterButton = document.getElementById('btn-aplicar-filtros');
        const resetButton = document.getElementById('btn-resetear-filtros');

        if (filterButton) {
            filterButton.addEventListener('click', () => this.aplicarFiltros());
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetearFiltros());
        }

        // Aplicar filtros en tiempo real para campos específicos
        const estadoFilter = document.getElementById('filter-estado-validacion');
        const searchInput = document.getElementById('filter-buscar');

        if (estadoFilter) {
            estadoFilter.addEventListener('change', () => this.filtroRapido());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filtroRapido());
        }
    }

    /**
     * Configurar estados de carga en botones
     */
    setupLoadingStates() {
        // Esto se llama cuando se ejecutan acciones async
    }

    /**
     * Mostrar estado de carga en un botón
     * @param {HTMLElement} button - Botón a actualizar
     * @param {boolean} loading - true para mostrar loading, false para restaurar
     */
    setButtonLoading(button, loading = true) {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.classList.add('btn-loading');
            button.innerHTML = '<span class="loading-spinner"></span>' + button.dataset.originalText;
        } else {
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.textContent = button.dataset.originalText || 'Guardar';
        }
    }

    /**
     * Aplicar filtros avanzados
     */
    aplicarFiltros() {
        const estado = document.getElementById('filter-estado-validacion')?.value || '';
        const rango_min = document.getElementById('filter-rango-min')?.value || '';
        const rango_max = document.getElementById('filter-rango-max')?.value || '';
        const fecha_inicio = document.getElementById('filter-fecha-inicio')?.value || '';
        const fecha_fin = document.getElementById('filter-fecha-fin')?.value || '';
        const busqueda = document.getElementById('filter-buscar')?.value.toLowerCase() || '';

        const datosBase = this.originalData.length ? this.originalData : this.obtenerDatosTabla();
        let filtrados = [...datosBase];
        let aplicados = 0;

        // Filtrar por estado
        if (estado) {
            filtrados = filtrados.filter(item => item.estado_validacion === estado);
            aplicados++;
        }

        // Filtrar por rango de valores
        if (rango_min || rango_max) {
            filtrados = filtrados.filter(item => {
                const valor = parseFloat(item.valor_total_pagar) || 0;
                const min = rango_min ? parseFloat(rango_min) : -Infinity;
                const max = rango_max ? parseFloat(rango_max) : Infinity;
                return valor >= min && valor <= max;
            });
            aplicados++;
        }

        // Filtrar por rango de fechas
        if (fecha_inicio || fecha_fin) {
            filtrados = filtrados.filter(item => {
                const itemDate = new Date(item.fecha_registro || item.fecha_inscripcion);
                if (fecha_inicio) {
                    const inicio = new Date(fecha_inicio);
                    if (itemDate < inicio) return false;
                }
                if (fecha_fin) {
                    const fin = new Date(fecha_fin);
                    fin.setHours(23, 59, 59);
                    if (itemDate > fin) return false;
                }
                return true;
            });
            aplicados++;
        }

        // Filtrar por búsqueda de texto
        if (busqueda) {
            filtrados = filtrados.filter(item => {
                const campos = [
                    item.nombre_completo,
                    item.documento_numero,
                    item.capitulo,
                    item.email,
                    item.telefono
                ]
                    .map(c => (c || '').toString().toLowerCase())
                    .join(' ');

                return campos.includes(busqueda);
            });
            aplicados++;
        }

        // Actualizar tabla
        this.aplicarVisibilidadFilas(filtrados);

        // Notificar
        if (filtrados.length === 0) {
            toast.warning(
                `No se encontraron resultados con los filtros aplicados (${aplicados} filtro${aplicados !== 1 ? 's' : ''})`,
                'Sin resultados'
            );
        } else {
            toast.success(
                `Se mostrando ${filtrados.length} registro${filtrados.length !== 1 ? 's' : ''} de ${this.originalData?.length || 'muchos'} (${aplicados} filtro${aplicados !== 1 ? 's' : ''} activo${aplicados !== 1 ? 's' : ''})`,
                'Filtros aplicados'
            );
        }

        this.filteredData = filtrados;
    }

    /**
     * Filtro rápido en tiempo real (búsqueda y estado)
     */
    filtroRapido() {
        const estado = document.getElementById('filter-estado-validacion')?.value || '';
        const busqueda = document.getElementById('filter-buscar')?.value.toLowerCase() || '';

        if (!estado && !busqueda) {
            this.resetearFiltros();
            return;
        }

        const tbody = document.getElementById('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr[data-estado]');
        let visibles = 0;

        rows.forEach(row => {
            const estadoRow = row.dataset.estado || '';
            const textoRow = row.textContent.toLowerCase();

            let mostrar = true;

            // Filtrar por estado
            if (estado && estadoRow !== estado) {
                mostrar = false;
            }

            // Filtrar por búsqueda
            if (busqueda && !textoRow.includes(busqueda)) {
                mostrar = false;
            }

            row.style.display = mostrar ? '' : 'none';
            if (mostrar) visibles++;
        });

        // Mostrar estado vacío si es necesario
        const tbody_el = document.getElementById('tbody');
        let emptyRow = tbody_el.querySelector('.empty-row');

        if (visibles === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-row';
                emptyRow.innerHTML = `
                    <td colspan="9" class="px-4 py-8 text-center">
                        <div class="empty-state">
                            <div class="empty-state-icon">0</div>
                            <div class="empty-state-title">Sin resultados</div>
                            <div class="empty-state-text">No se encontraron inscripciones que coincidan con los filtros aplicados</div>
                        </div>
                    </td>
                `;
                tbody_el.appendChild(emptyRow);
            }
        } else {
            if (emptyRow) {
                emptyRow.remove();
            }
        }
    }

    /**
     * Resetear todos los filtros
     */
    resetearFiltros() {
        // Limpiar inputs
        if (document.getElementById('filter-estado-validacion')) {
            document.getElementById('filter-estado-validacion').value = '';
        }
        if (document.getElementById('filter-buscar')) {
            document.getElementById('filter-buscar').value = '';
        }
        if (document.getElementById('filter-rango-min')) {
            document.getElementById('filter-rango-min').value = '';
        }
        if (document.getElementById('filter-rango-max')) {
            document.getElementById('filter-rango-max').value = '';
        }
        if (document.getElementById('filter-fecha-inicio')) {
            document.getElementById('filter-fecha-inicio').value = '';
        }
        if (document.getElementById('filter-fecha-fin')) {
            document.getElementById('filter-fecha-fin').value = '';
        }

        // Mostrar todas las filas
        const tbody = document.getElementById('tbody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr[data-estado]');
            rows.forEach(row => (row.style.display = ''));

            // Remover empty state si existe
            const emptyRow = tbody.querySelector('.empty-row');
            if (emptyRow) emptyRow.remove();
        }

        // Notificar
        toast.info('Filtros reseteados', 'Filtros', 3000);
        this.filteredData = [];
    }

    /**
     * Obtener datos de la tabla actual
     */
    obtenerDatosTabla() {
        const tbody = document.getElementById('tbody');
        if (!tbody) return [];

        const datos = [];
        tbody.querySelectorAll('tr[data-estado]').forEach(row => {
            const cells = row.querySelectorAll('td');
            datos.push({
                id_inscripcion: cells[0]?.textContent.trim().replace('#', ''),
                nombre_completo: cells[1]?.textContent.trim(),
                documento_numero: cells[2]?.textContent.trim(),
                tipo_participante: cells[3]?.textContent.trim(),
                capitulo: cells[4]?.textContent.trim(),
                valor_total_pagar: cells[6]?.textContent.trim().replace('$', '').replace(/\./g, ''),
                estado_validacion: row.dataset.estado,
                element: row
            });
        });

        this.originalData = datos;
        return datos;
    }

    /**
     * Mostrar datos filtrados en la tabla
     */
    aplicarVisibilidadFilas(datos) {
        const tbody = document.getElementById('tbody');
        if (!tbody) return;

        const permitidos = new Set(datos.map(item => String(item.id_inscripcion)));
        const rows = tbody.querySelectorAll('tr[data-estado]');
        let visibles = 0;

        rows.forEach(row => {
            const idTexto = (row.querySelector('td')?.textContent || '').replace('#', '').trim();
            const mostrar = permitidos.has(idTexto);
            row.style.display = mostrar ? '' : 'none';
            if (mostrar) visibles++;
        });

        let emptyRow = tbody.querySelector('.empty-row');
        if (visibles === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-row';
                emptyRow.innerHTML = `
                    <td colspan="9" class="px-4 py-8 text-center">
                        <div class="empty-state">
                            <div class="empty-state-title">Sin resultados</div>
                            <div class="empty-state-text">No se encontraron inscripciones que coincidan con los filtros aplicados</div>
                        </div>
                    </td>
                `;
                tbody.appendChild(emptyRow);
            }
        } else if (emptyRow) {
            emptyRow.remove();
        }
    }

    /**
     * Envolver funciones async con manejo mejorado de errores/éxito
     */
    async ejecutarAccion(fn, nombreAccion = 'Acción', button = null) {
        try {
            if (button) this.setButtonLoading(button, true);

            const resultado = await fn();

            if (button) this.setButtonLoading(button, false);
            return resultado;
        } catch (error) {
            if (button) this.setButtonLoading(button, false);

            console.error(`Error en ${nombreAccion}:`, error);
            toast.error(
                `${error.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'}`,
                `Error en ${nombreAccion}`
            );
            throw error;
        }
    }

    /**
     * Confirmar acciones destructivas
     */
    confirmarAccion(mensaje = '¿Estás seguro de esta acción?', titulo = 'Confirmación') {
        return new Promise((resolve) => {
            // Crear modal simple
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: #1A1A1A;
                border: 2px solid #D4AF37;
                border-radius: 8px;
                padding: 24px;
                max-width: 400px;
                color: #F5F5DC;
                font-family: 'Montserrat', sans-serif;
                animation: slideIn 0.3s ease;
            `;

            content.innerHTML = `
                <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #D4AF37;">
                    ${titulo}
                </h3>
                <p style="margin-bottom: 20px; font-size: 14px; line-height: 1.5; color: #CCC;">
                    ${mensaje}
                </p>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="btn-cancelar" style="padding: 8px 16px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                        Cancelar
                    </button>
                    <button id="btn-confirmar" style="padding: 8px 16px; background: #D4AF37; border: none; border-radius: 4px; color: #0A0A0A; cursor: pointer; font-weight: bold;">
                        Confirmar
                    </button>
                </div>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            document.getElementById('btn-cancelar').onclick = () => {
                modal.remove();
                resolve(false);
            };

            document.getElementById('btn-confirmar').onclick = () => {
                modal.remove();
                resolve(true);
            };

            // Cerrar con ESC
            const closeOnEsc = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeOnEsc);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', closeOnEsc);
        });
    }
}

// Inicializar globalmente
const adminUX = new AdminDashboardUX();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboardUX;
}
