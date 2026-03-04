import './auth.js';
import './dashboard.js';
import './demo.js';

// Global error handler for production
window.addEventListener("error", (e) => {
    console.error("Production error:", e.message);
});

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check for Demo Mode setup (Phase 6)
    const isDemo = sessionStorage.getItem("demo") === "true";
    window.isDemoMode = isDemo; // Set globally

    // 2. Setup Route Logic
    const path = window.location.pathname;

    if (path === '/dashboard') {
        renderDashboard();
    } else {
        renderLogin();
    }
});

async function renderLogin() {
    // Reveal Login UI elements
    const loginPage = document.querySelector('.login-page');
    if (loginPage) loginPage.style.display = 'block';

    const dashboardRoot = document.getElementById('dashboardRoot');
    if (dashboardRoot) dashboardRoot.style.display = 'none';

    // Existing Auth initialization logic via imported files will trigger on login DOM forms
    // Let's add the small delay guard as requested in Phase 5
    await new Promise(r => setTimeout(r, 50));

    // Redirect if already authenticated
    if (!window.isDemoMode) {
        const session = await window.Auth?.getSession();
        if (session && window.location.pathname === "/") {
            window.location.replace("/dashboard");
        }
    }
}

async function renderDashboard() {
    // Hide Login UI
    const loginPage = document.querySelector('.login-page');
    if (loginPage) loginPage.style.display = 'none';

    // Show Dashboard UI root
    let dashboardRoot = document.getElementById('dashboardRoot');
    
    // Check if we need to load dashboard HTML content dynamically
    if (!dashboardRoot) {
        dashboardRoot = document.createElement('div');
        dashboardRoot.id = 'dashboardRoot';
        dashboardRoot.className = 'dashboard-layout';
        document.body.appendChild(dashboardRoot);
        
        // We'll populate this with the former dashboard.html layout structure 
        dashboardRoot.innerHTML = `
            <!-- Sidebar -->
            <aside class="sidebar glass-panel">
                <div class="sidebar-header">
                    <div class="brand">
                        <svg viewBox="0 0 120 120" width="40" height="40">
                            <defs>
                                <linearGradient id="gradBlue2" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stop-color="#0a8fd4" />
                                    <stop offset="100%" stop-color="#005f99" />
                                </linearGradient>
                            </defs>
                            <path d="M60 5 L110 30 V70 C110 95 85 115 60 115 C35 115 10 95 10 70 V30 Z" fill="url(#gradBlue2)" />
                            <polyline points="25,65 40,65 48,50 60,85 72,60 95,60" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <h2 class="brand-text">Carenium</h2>
                    </div>
                </div>
                
                <div class="user-profile-compact">
                    <div class="avatar" id="userAvatar">D</div>
                    <div class="user-info">
                        <span class="user-name" id="userName">Loading...</span>
                        <span class="user-role" id="userRoleText">...</span>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <!-- Dashboard navigation injected here by dashboard.js -->
                </nav>
            </aside>
            
            <!-- Main Content Area -->
            <main class="main-wrapper">
                <header class="top-header glass-panel">
                    <div class="header-left">
                        <h1 class="page-title" id="topUserName">Loading Workspace...</h1>
                        <div id="specBadgeContainer">
                            <span class="role-badge doctor specialization-badge" id="topRoleBadge">Doctor</span>
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <!-- Theme Toggle / Notifications -->
                        <button class="icon-btn theme-toggle" id="themeToggleDash" aria-label="Toggle theme">
                            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        </button>
                        <button class="icon-btn notification-btn" onclick="UI.togglePanel('notificationPanel')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            <span class="badge" id="alertBadgeCount" style="display:none">0</span>
                        </button>
                    </div>
                </header>
                
                <div class="content-area" id="dashboardContent">
                    <!-- Dashboard modules will render content here -->
                    <div class="section-loader p-12 text-center">Initializing medical systems...</div>
                </div>
            </main>
        `;
    } else {
        dashboardRoot.style.display = 'flex'; // Or whatever its layout mode was
    }

    // Initialize Dashboard logic via imported dashboard component 
    if (window.Dashboard) {
        window.Dashboard.init();
    }
}
