/**
 * TICKER DE URGENCIA - Anuncios dinámicos y rotación automática
 * Muestra información importante del campeonato en tiempo real
 * Utiliza iconos SVG profesionales
 * Se alimenta desde el backend - /api/ticker
 */

class TickerUrgencia {
    constructor() {
        this.announcements = []; // Se cargará desde el servidor
        this.currentIndex = 0;
        this.autoRotateInterval = null;
        this.manualPause = false;
        this.hoverPause = false;
        this.rotationDurationMs = 5000;
        this.rotationRemainingMs = this.rotationDurationMs;
        this.rotationStartedAt = null;
        this.init();
    }

    async init() {
        const tickerContainer = document.getElementById('ticker-container');
        if (tickerContainer) {
            // Cargar anuncios desde el servidor
            await this.loadAnnouncements();
            this.ensureTickerStyles();
            this.render();
            this.startAutoRotate();
            this.setupControls();
        }
    }

    /**
     * Carga los anuncios desde el servidor
     */
    async loadAnnouncements() {
        try {
            const response = await fetch('/api/ticker');
            const data = await response.json();

            if (data.success && data.data) {
                // Agregar iconos SVG basado en el tipo/icon
                this.announcements = data.data.map(ann => ({
                    ...ann,
                    color: this.normalizeColor(ann.color),
                    iconSVG: this.getIconSVG(ann.icon)
                }));

                console.log('✓ Anuncios del ticker cargados:', this.announcements.length);
            } else {
                console.error('Error al cargar anuncios:', data.message);
                this.announcements = [];
            }
        } catch (error) {
            console.error('Error fetching ticker announcements:', error);
            this.announcements = [];
        }
    }

    /**
     * Retorna el icono SVG apropiado basado en el tipo
     */
    getIconSVG(iconType) {
        switch (iconType) {
            case 'ticket':
                return this.getTicketIcon();
            case 'calendar':
                return this.getCalendarIcon();
            case 'success':
            case 'trophy':
                return this.getTrophyIcon();
            case 'warning':
                return this.getWarningIcon();
            case 'info':
            default:
                return this.getInfoIcon();
        }
    }

    /**
     * Retorna icono SVG de ticket
     */
    getTicketIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2rem; height: 2rem; animation: pulse 1.5s ease-in-out infinite;">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 8h10v2H7zm0 3h10v2H7zm0 3h10v2H7z" fill="currentColor"/>
        </svg>`;
    }

    /**
     * Retorna icono SVG de calendario
     */
    getCalendarIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2rem; height: 2rem; animation: pulse 1.5s ease-in-out infinite;">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor"/>
        </svg>`;
    }

    /**
     * Retorna icono SVG de trofeo/premio
     */
    getTrophyIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2rem; height: 2rem; animation: pulse 1.5s ease-in-out infinite;">
            <path d="M9 3H5c-1.1 0-2 .9-2 2v4h4V5c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v4h4V5c0-1.1-.9-2-2-2h-4V1h-2v2zm11 6h-2v2h2v6c0 1.1-.9 2-2 2h-3v2h-2v-2h-3c-1.1 0-2-.9-2-2v-6H4v-2h2V5h12v4zm-4 8H8v-6h8v6z" fill="currentColor"/>
        </svg>`;
    }

    /**
     * Retorna icono SVG de advertencia
     */
    getWarningIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2rem; height: 2rem; animation: pulse 1.5s ease-in-out infinite;">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
        </svg>`;
    }

    /**
     * Retorna icono SVG de info
     */
    getInfoIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2rem; height: 2rem; animation: pulse 1.5s ease-in-out infinite;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
        </svg>`;
    }

    getChevronLeftIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M15 18l-6-6 6-6"/></svg>`;
    }

    getChevronRightIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M9 18l6-6-6-6"/></svg>`;
    }

    getPauseIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>`;
    }

    getPlayIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M8 5v14l11-7z"/></svg>`;
    }

    render() {
        const container = document.getElementById('ticker-container');
        if (!container) return;

        if (!this.announcements.length) {
            container.innerHTML = `
                <div class="ticker-content" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 0.9rem 1rem;
                    background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 245, 212, 0.04) 100%);
                    border-radius: 8px;
                    border-left: 4px solid #D4AF37;
                ">
                    <div style="display:flex; align-items:center; gap:0.75rem; color:#F5F5DC;">
                        ${this.getInfoIcon()}
                        <div>
                            <div style="font-weight:700; letter-spacing:0.5px;">TICKER SIN ANUNCIOS ACTIVOS</div>
                            <div style="font-size:0.9rem; opacity:0.85;">Publica anuncios desde el panel administrativo.</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const announcement = this.announcements[this.currentIndex];
        const safeTitle = this.escapeHtml(announcement.title);
        const safeMessage = this.escapeHtml(announcement.message);
        const canRotate = this.announcements.length > 1;
        const pauseLabel = this.manualPause ? 'Reanudar ticker' : 'Pausar ticker';
        const pauseIcon = this.manualPause ? this.getPlayIcon() : this.getPauseIcon();

        container.innerHTML = `
            <div class="ticker-shell" style="position:relative; border-radius:8px; overflow:hidden;">
                <div class="ticker-content" style="
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1rem;
                    background: linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 245, 212, 0.05) 100%);
                    border-radius: 8px;
                    border-left: 4px solid ${announcement.color};
                    animation: slideIn 0.5s ease-out;
                ">
                    <div style="
                        color: ${announcement.color};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    ">
                        ${announcement.iconSVG}
                    </div>

                    <div style="flex: 1; min-width: 0;">
                        <div style="
                            color: ${announcement.color};
                            font-weight: bold;
                            font-size: 1.1rem;
                            letter-spacing: 1px;
                            font-family: 'Bebas Neue', sans-serif;
                            text-transform: uppercase;
                        ">${safeTitle}</div>
                        <div style="
                            color: #F5F5DC;
                            font-size: 0.95rem;
                            margin-top: 0.25rem;
                        ">${safeMessage}</div>
                    </div>

                    <div style="display: flex; align-items:center; gap: 0.25rem; margin-left:auto;" id="ticker-controls">
                        <span style="color:#9CA3AF; font-size:0.78rem; align-self:center; min-width:2.6rem; text-align:center;">
                            ${this.currentIndex + 1}/${this.announcements.length}
                        </span>
                        <button id="prevBtn" class="ticker-btn ticker-icon-btn min-h-[48px] min-w-[48px] p-2" ${canRotate ? '' : 'disabled'} aria-label="Ver anuncio anterior">
                            ${this.getChevronLeftIcon()}
                        </button>
                        <button id="pauseBtn" class="ticker-btn ticker-icon-btn min-h-[48px] min-w-[48px] p-2" ${canRotate ? '' : 'disabled'} aria-label="${pauseLabel}">
                            ${pauseIcon}
                        </button>
                        <button id="nextBtn" class="ticker-btn ticker-icon-btn min-h-[48px] min-w-[48px] p-2" ${canRotate ? '' : 'disabled'} aria-label="Ver anuncio siguiente">
                            ${this.getChevronRightIcon()}
                        </button>
                    </div>
                </div>
                <div class="ticker-progress-track" aria-hidden="true">
                    <div id="ticker-progress-fill" class="ticker-progress-fill"></div>
                </div>
            </div>
        `;
    }

    setupControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const tickerContent = document.querySelector('.ticker-content');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        if (tickerContent) {
            tickerContent.addEventListener('mouseenter', () => {
                this.hoverPause = true;
                this.stopAutoRotate({ preserveProgress: true });
            });
            tickerContent.addEventListener('mouseleave', () => {
                this.hoverPause = false;
                if (!this.manualPause && this.announcements.length > 1) {
                    this.startAutoRotate();
                }
            });
        }
    }

    next() {
        if (!this.announcements.length) return;
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex + 1) % this.announcements.length;
        this.rotationRemainingMs = this.rotationDurationMs;
        this.render();
        this.setupControls();
        if (!this.manualPause && !this.hoverPause) {
            this.startAutoRotate();
        }
    }

    previous() {
        if (!this.announcements.length) return;
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex - 1 + this.announcements.length) % this.announcements.length;
        this.rotationRemainingMs = this.rotationDurationMs;
        this.render();
        this.setupControls();
        if (!this.manualPause && !this.hoverPause) {
            this.startAutoRotate();
        }
    }

    startAutoRotate() {
        this.stopAutoRotate();
        if (this.manualPause || this.hoverPause || this.announcements.length <= 1) {
            this.pauseProgressBar();
            return;
        }

        const delay = this.rotationRemainingMs > 0 ? this.rotationRemainingMs : this.rotationDurationMs;
        this.rotationStartedAt = Date.now();
        this.animateProgressBar(delay);

        this.autoRotateInterval = setTimeout(() => {
            this.rotationRemainingMs = this.rotationDurationMs;
            this.currentIndex = (this.currentIndex + 1) % this.announcements.length;
            this.render();
            this.setupControls();
            if (!this.manualPause && !this.hoverPause) {
                this.startAutoRotate();
            }
        }, delay);
    }

    stopAutoRotate(options = {}) {
        const { preserveProgress = false } = options;

        if (preserveProgress && this.rotationStartedAt) {
            const elapsed = Date.now() - this.rotationStartedAt;
            this.rotationRemainingMs = Math.max(250, this.rotationRemainingMs - elapsed);
            this.pauseProgressBar();
        }

        if (this.autoRotateInterval) {
            clearTimeout(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }

        this.rotationStartedAt = null;

        if (!preserveProgress) {
            this.rotationRemainingMs = this.rotationDurationMs;
            this.resetProgressBar();
        }
    }

    togglePause() {
        this.manualPause = !this.manualPause;
        if (this.manualPause) {
            this.stopAutoRotate({ preserveProgress: true });
        } else {
            this.startAutoRotate();
        }
        this.render();
        this.setupControls();
    }

    getProgressFill() {
        return document.getElementById('ticker-progress-fill');
    }

    resetProgressBar() {
        const fill = this.getProgressFill();
        if (!fill) {
            return;
        }

        fill.style.transition = 'none';
        fill.style.width = '0%';
    }

    animateProgressBar(durationMs) {
        const fill = this.getProgressFill();
        if (!fill) {
            return;
        }

        fill.style.transition = 'none';
        fill.style.width = '0%';

        window.requestAnimationFrame(() => {
            fill.style.transition = `width ${durationMs}ms linear`;
            fill.style.width = '100%';
        });
    }

    pauseProgressBar() {
        const fill = this.getProgressFill();
        if (!fill || !fill.parentElement) {
            return;
        }

        const parentWidth = fill.parentElement.getBoundingClientRect().width;
        const currentWidth = fill.getBoundingClientRect().width;
        const currentPercent = parentWidth > 0
            ? Math.min(100, Math.max(0, (currentWidth / parentWidth) * 100))
            : 0;

        fill.style.transition = 'none';
        fill.style.width = `${currentPercent}%`;
    }

    normalizeColor(color) {
        if (typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color)) {
            return color;
        }
        return '#00F5FF';
    }

    escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    ensureTickerStyles() {
        if (document.getElementById('ticker-urgencia-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'ticker-urgencia-styles';
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .ticker-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 15px currentColor;
            }

            .ticker-icon-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 9999px;
                border: 1px solid rgba(156, 163, 175, 0.45);
                background: rgba(17, 24, 39, 0.25);
                color: #9CA3AF;
                cursor: pointer;
                transition: all 0.22s ease;
                min-width: 48px;
                min-height: 48px;
            }

            .ticker-icon-btn:hover:not(:disabled) {
                color: #00F5FF;
                border-color: rgba(0, 245, 255, 0.7);
                box-shadow: 0 0 14px rgba(0, 245, 255, 0.35);
                transform: translateY(-1px);
            }

            .ticker-progress-track {
                width: 100%;
                height: 2px;
                background: rgba(245, 245, 220, 0.12);
            }

            .ticker-progress-fill {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #00F5FF 0%, #00f5d4 100%);
                box-shadow: 0 0 10px rgba(0, 245, 255, 0.6);
            }

            .ticker-btn:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }

            @media (max-width: 640px) {
                .ticker-content {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 0.75rem !important;
                    padding: 0.85rem !important;
                }

                #ticker-controls {
                    width: 100% !important;
                    display: flex !important;
                    justify-content: flex-end !important;
                    gap: 0.45rem !important;
                }

                #ticker-controls > span {
                    margin-right: auto !important;
                    text-align: left !important;
                }

                .ticker-btn {
                    flex: 0 0 auto !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Método para agregar anuncios dinámicamente
    addAnnouncement(announcement) {
        this.announcements.push(announcement);
    }

    // Método para limpiar
    destroy() {
        this.stopAutoRotate();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tickerUrgencia = new TickerUrgencia();
});
