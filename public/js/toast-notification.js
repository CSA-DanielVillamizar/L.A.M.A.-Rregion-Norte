/**
 * Sistema de Notificaciones Toast mejorado
 * Reemplaza alerts genéricos con notificaciones visuales elegantes
 * Uso: showToast('mensaje', 'success|error|warning|info')
 */

class ToastNotification {
    constructor() {
        this.container = null;
        this.timeouts = [];
        this.init();
    }

    init() {
        // Crear contenedor de toasts si no existe
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Mostrar notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en ms (0 = infinito)
     * @param {string} title - Título opcional
     */
    show(message, type = 'info', duration = 5000, title = '') {
        const iconMap = {
            success: '✓',
            error: '×',
            warning: '⚠',
            info: 'ℹ'
        };

        const colorMap = {
            success: { bg: '#1a472a', border: '#00FF00', text: '#00FF00', icon: '#00FF00' },
            error: { bg: '#4a1a1a', border: '#FF0000', text: '#FF6b6b', icon: '#FF0000' },
            warning: { bg: '#4a3a1a', border: '#FFA500', text: '#FFB366', icon: '#FFA500' },
            info: { bg: '#1a2a4a', border: '#00F5FF', text: '#00F5FF', icon: '#00F5FF' }
        };

        const colors = colorMap[type] || colorMap.info;
        const icon = iconMap[type] || iconMap.info;

        // Crear elemento toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${colors.bg};
            border-left: 4px solid ${colors.border};
            border-radius: 8px;
            padding: 16px;
            color: ${colors.text};
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            display: flex;
            gap: 12px;
            align-items: flex-start;
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
            min-height: 50px;
            max-height: 150px;
            overflow-y: auto;
        `;

        // Contenido del toast
        const content = document.createElement('div');
        content.style.flex = '1';

        // Icono
        const iconEl = document.createElement('span');
        iconEl.style.cssText = `
            color: ${colors.icon};
            font-weight: bold;
            font-size: 20px;
            flex-shrink: 0;
            min-width: 24px;
            text-align: center;
        `;
        iconEl.textContent = icon;

        // Texto
        const textEl = document.createElement('div');
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.style.fontWeight = 'bold';
            titleEl.textContent = title;
            const msgEl = document.createElement('div');
            msgEl.style.cssText = 'margin-top: 4px; font-size: 12px; opacity: 0.9;';
            msgEl.textContent = message;
            textEl.appendChild(titleEl);
            textEl.appendChild(msgEl);
        } else {
            textEl.textContent = message;
        }

        // Botón cerrar
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: ${colors.text};
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin: 0;
            flex-shrink: 0;
            opacity: 0.7;
            transition: opacity 0.2s;
            font-family: 'Montserrat', sans-serif;
        `;
        closeBtn.textContent = '×';
        closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
        closeBtn.onclick = () => removeToast();

        // Armar el toast
        content.appendChild(textEl);
        toast.appendChild(iconEl);
        toast.appendChild(content);
        toast.appendChild(closeBtn);

        this.container.appendChild(toast);

        // Función para remover
        const removeToast = () => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
            const timeoutIndex = this.timeouts.indexOf(timeout);
            if (timeoutIndex > -1) {
                this.timeouts.splice(timeoutIndex, 1);
            }
        };

        // Auto-remover después de duración
        if (duration > 0) {
            const timeout = setTimeout(removeToast, duration);
            this.timeouts.push(timeout);
        }

        return removeToast;
    }

    /**
     * Atajos para métodos comunes
     */
    success(message, title = 'Éxito', duration = 4000) {
        return this.show(message, 'success', duration, title);
    }

    error(message, title = 'Error', duration = 6000) {
        return this.show(message, 'error', duration, title);
    }

    warning(message, title = 'Advertencia', duration = 5000) {
        return this.show(message, 'warning', duration, title);
    }

    info(message, title = 'Información', duration = 5000) {
        return this.show(message, 'info', duration, title);
    }

    /**
     * Remover todos los toasts
     */
    clearAll() {
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Inicializar globalmente
const toast = new ToastNotification();

// Helper global
function showToast(message, type = 'info', duration = 5000) {
    return toast.show(message, type, duration);
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastNotification;
}
