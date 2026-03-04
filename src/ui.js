/* =============================================
   CARENIUM — UI Utilities Suite
   Toasts, Modals, Spinners, and Skeletons.
   ============================================= */

const UI = (() => {
    /**
     * Premium Toast Notification System
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.warn('Toast container not found. Falling back to alert.');
            alert(`${type.toUpperCase()}: ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-card`;

        // Lucide icon mapping
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <div class="toast-content flex items-center gap-3">
                <span class="toast-icon"><i data-lucide="${icons[type] || 'info'}"></i></span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">×</button>
        `;

        container.appendChild(toast);

        // Force reflow for enter animation
        void toast.offsetWidth;
        toast.classList.add('show');

        // Auto-remove with clean up
        const duration = 5000;
        let timeout = setTimeout(() => {
            removeToast(toast);
        }, duration);

        // Interactive behavior
        toast.onmouseenter = () => clearTimeout(timeout);
        toast.onmouseleave = () => {
            timeout = setTimeout(() => removeToast(toast), duration / 2);
        };
    }

    function removeToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }

    /**
     * Modal Management with smooth transitions
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            void modal.offsetWidth; // Reflow
            modal.classList.add('modal-active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('modal-active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!modal.classList.contains('modal-active')) {
                    modal.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Skeleton Loading Indicators (GPU Optimized)
     */
    function setSkeleton(containerId, count = 3, type = 'card') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const templates = {
            card: '<div class="glass-card skeleton-card" style="height: 250px;"></div>',
            list: '<div class="skeleton-list-item" style="height: 48px; margin-bottom: 8px; border-radius: 8px;"></div>',
            circle: '<div class="skeleton-avatar" style="height: 64px; width: 64px; border-radius: 50%;"></div>'
        };

        container.innerHTML = `
            <div class="skeleton-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Array(count).fill(templates[type] || templates.card).join('')}
            </div>
        `;
    }

    function renderSkeletonGrid(containerId, count = 3) {
        setSkeleton(containerId, count, 'card');
    }

    /**
     * Lucide Icon Engine Integration
     */
    function initIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    return {
        showToast,
        openModal,
        closeModal,
        setSkeleton,
        renderSkeletonGrid,
        initIcons
    };
})();
