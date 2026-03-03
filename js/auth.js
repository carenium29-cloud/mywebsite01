/* =============================================
   CARENIUM — Enterprise Auth Module (v2.1 Hardened)
   ============================================= */

// Global Demo Gate
window.isDemoMode = sessionStorage.getItem('demoMode') === 'true';

const Auth = (() => {
    const supabase = window.supabaseClient;

    /**
     * Centralized Error Logger & Handler
     */
    function handleError(error, context) {
        console.error(`Carenium Auth [${context}]:`, error);
        // Integrate with UI toast system if available
        if (window.UI && window.UI.showToast) {
            window.UI.showToast(error.message || 'Authentication error', 'error');
        }
        return { success: false, message: error.message || 'Operation failed' };
    }

    function checkSupabase() {
        if (!supabase) {
            return handleError({ message: 'Supabase client not initialized' }, 'Initialization');
        }
        return true;
    }

    /**
     * Sign In with improved validation and demo cleanup
     */
    async function signIn(email, password) {
        if (!checkSupabase()) return { success: false, message: 'System unreachable' };

        try {
            // Clear demo mode artifacts on real login attempt
            sessionStorage.removeItem('demoMode');
            window.isDemoMode = false;

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            // Log successful audit event if needed
            return { success: true, user: data.user };
        } catch (error) {
            let message = error.message || 'Login failed';
            if (message.toLowerCase().includes('invalid login')) {
                message = 'Invalid credentials. Please verify your email and password.';
            }
            return handleError({ message }, 'SignIn');
        }
    }

    /**
     * Sign Up with RBAC initialization
     */
    async function signUp(email, password, fullName, role, phone = '') {
        if (!checkSupabase()) return { success: false, message: 'System unreachable' };

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        phone: phone,
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            return handleError(error, 'SignUp');
        }
    }

    /**
     * Secure Sign Out with state cleanup
     */
    async function signOut() {
        try {
            if (window.isDemoMode) {
                sessionStorage.removeItem('demoMode');
                window.isDemoMode = false;
                window.location.href = 'index.html';
                return;
            }

            if (supabase) {
                await supabase.auth.signOut();
            }

            sessionStorage.clear();
            localStorage.removeItem('carenium-theme'); // Reset theme on logout for security if preferred
            window.location.href = 'index.html';
        } catch (error) {
            console.error('SignOut error:', error);
            window.location.href = 'index.html'; // Force redirect anyway
        }
    }

    /**
     * Session Retrieval with Demo Mode bypass
     */
    async function getSession() {
        try {
            if (window.isDemoMode) {
                return { user: { email: 'demo@carenium.com', user_metadata: { full_name: 'Dr. Demo', role: 'doctor' }, demo: true } };
            }

            if (!supabase) return null;

            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            console.warn('Session retrieval failed:', error.message);
            return null;
        }
    }

    /**
     * Routing Guards
     */
    async function redirectIfLoggedIn() {
        try {
            const session = await getSession();
            if (session || window.isDemoMode) {
                window.location.href = 'dashboard.html';
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    async function redirectIfNotLoggedIn() {
        try {
            const session = await getSession();
            if (!session && !window.isDemoMode) {
                window.location.href = 'index.html';
                return true;
            }
        } catch (e) {
            window.location.href = 'index.html';
            return true;
        }
        return false;
    }

    return {
        signIn,
        signUp,
        signOut,
        getSession,
        redirectIfLoggedIn,
        redirectIfNotLoggedIn,
        handleError
    };
})();
