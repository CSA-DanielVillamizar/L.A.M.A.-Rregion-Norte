/**
 * Gestor de Servicios Premium - L.A.M.A. Campeonato
 * Maneja toggle de servicios y cálculo dinámico de precio total
 */

class ServiciosPremium {
    constructor() {
        this.servicios = new Set();
        this.precioBase = 120000; // Jersey Oficial
        this.init();
    }

    init() {
        // Seleccionar todas las tarjetas de servicios
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.toggleServicio(card, e));
        });

        // Escuchar cambios en el campo de precio total si existe
        this.actualizarTotal();
    }

    toggleServicio(card, event) {
        const servicio = card.dataset.service;
        const precio = parseInt(card.dataset.price);

        if (this.servicios.has(servicio)) {
            // Remover servicio
            this.servicios.delete(servicio);
            card.classList.remove('active');
            card.style.borderColor = 'rgba(242, 208, 13, 0.5)';
            card.style.backgroundColor = 'rgba(26, 25, 25, 0.4)';
        } else {
            // Agregar servicio
            this.servicios.add(servicio);
            card.classList.add('active');
            card.style.borderColor = '#00f5d4';
            card.style.backgroundColor = 'rgba(0, 245, 212, 0.1)';
            card.style.boxShadow = '0 0 20px rgba(0, 245, 212, 0.3)';
        }

        this.actualizarTotal();
        this.actualizarFormulario();
    }

    actualizarTotal() {
        let total = this.precioBase;
        this.servicios.forEach(servicio => {
            const card = document.querySelector(`[data-service="${servicio}"]`);
            if (card) {
                total += parseInt(card.dataset.price);
            }
        });

        // Actualizar campo de input si existe
        const inputTotal = document.getElementById('valor_total_pagar');
        if (inputTotal) {
            inputTotal.value = total;
        }

        // Actualizar display si existe
        const displayTotal = document.getElementById('total-display');
        if (displayTotal) {
            displayTotal.textContent = `$${total.toLocaleString('es-CO')}`;
        }

        return total;
    }

    actualizarFormulario() {
        // Crear JSON con servicios seleccionados
        const serviciosJSON = Array.from(this.servicios).map(servicio => {
            const card = document.querySelector(`[data-service="${servicio}"]`);
            if (!card) {
                console.warn(`Tarjeta de servicio no encontrada: ${servicio}`);
                return null;
            }
            
            // Buscar el título en diferentes estructuras
            const h3 = card.querySelector('h3');
            const h4 = card.querySelector('h4');
            const titulo = h3 || h4;
            
            if (!titulo) {
                console.warn(`Título no encontrado para servicio: ${servicio}`);
                return null;
            }
            
            return {
                servicio,
                precio: parseInt(card.dataset.price),
                nombre: titulo.textContent.trim()
            };
        }).filter(item => item !== null); // Filtrar null entries

        // Guardar en input hidden si existe
        const inputServicios = document.getElementById('servicios-seleccionados');
        if (inputServicios) {
            inputServicios.value = JSON.stringify(serviciosJSON);
        }

        // Actualizar resumen de pago si existe la función
        if (typeof updateResumenPago === 'function') {
            updateResumenPago();
        }

        // Log para debug
        console.log('Servicios seleccionados:', serviciosJSON);
        console.log('Total:', this.actualizarTotal());
    }

    obtenerResumen() {
        const desglose = Array.from(this.servicios).map(servicio => {
            const card = document.querySelector(`[data-service="${servicio}"]`);
            if (!card) {
                console.warn(`Tarjeta de servicio no encontrada: ${servicio}`);
                return null;
            }
            
            const h3 = card.querySelector('h3');
            const h4 = card.querySelector('h4');
            const titulo = h3 || h4;
            
            if (!titulo) {
                console.warn(`Título no encontrado para servicio: ${servicio}`);
                return null;
            }
            
            return {
                nombre: titulo.textContent.trim(),
                precio: parseInt(card.dataset.price)
            };
        }).filter(item => item !== null);
        
        return {
            servicios: Array.from(this.servicios),
            total: this.actualizarTotal(),
            desglose: desglose
        };
    }

    generarTextosWhatsApp() {
        const resumen = this.obtenerResumen();
        let texto = `*Resumen de Inscripción - V Campeonato L.A.M.A.*\n\n`;
        texto += `💰 *Desglose de Pago:*\n`;
        texto += `• Jersey Oficial: $${this.precioBase.toLocaleString('es-CO')}\n`;
        
        if (resumen.servicios.length > 0) {
            texto += `\n*✨ Servicios Adicionales Seleccionados:*\n`;
            resumen.desglose.forEach(item => {
                texto += `• ${item.nombre}: $${item.precio.toLocaleString('es-CO')}\n`;
            });
        } else {
            texto += `\n*Servicios Adicionales:* No seleccionados\n`;
        }
        
        texto += `\n*━━━━━━━━━━━━━━━━━━━━━*\n`;
        texto += `*TOTAL A PAGAR: $${resumen.total.toLocaleString('es-CO')}*\n`;
        texto += `*━━━━━━━━━━━━━━━━━━━━━*`;
        return texto;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.service-card')) {
        window.serviciosPremium = new ServiciosPremium();
    }
});
