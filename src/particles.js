/* =============================================
   CARENIUM — Space Particle System (Optimized)
   ============================================= */

const ParticleSystem = (() => {
    let canvas, ctx, particles = [];
    let animationId;
    const MAX_PARTICLES = 60;
    let isPaused = false;
    let width, height;

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function animate() {
        if (isPaused) return;

        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationId = requestAnimationFrame(animate);
    }

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'space-particles';
        canvas.style.position = 'fixed';
        canvas.style.inset = '0';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);

        ctx = canvas.getContext('2d');
        resize();

        for (let i = 0; i < MAX_PARTICLES; i++) {
            particles.push(new Particle());
        }

        window.addEventListener('resize', resize);

        // Performance optimization: Pause when tab is inactive
        document.addEventListener('visibilitychange', () => {
            isPaused = document.hidden;
            if (!isPaused) animate();
        });

        animate();
    }

    return { init };
})();

// Initialize if not in Demo Mode or if performance is good
document.addEventListener('DOMContentLoaded', () => {
    // Check if demo mode is active - usually indicated by a global flag or URL param
    const isDemoMode = window.location.search.includes('demo=true') || window.isDemoMode;

    // In production, we might want more complex checks, but for now:
    ParticleSystem.init();
});
