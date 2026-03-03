/* =============================================
   CARENIUM — Safe Supabase Configuration
   ============================================= */

(function () {
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

   // Global Registry
   window.supabaseClient = null;

   // 1. Validate URL
   if (SUPABASE_URL.includes('your-project-id')) {
      console.error('Carenium: Supabase URL is a placeholder. Please update supabase-config.js.');
      return;
   }

   // 2. Check CDN Availability
   if (!window.supabase) {
      console.error('Carenium: Supabase library (CDN) failed to load.');
      return;
   }

   // 3. Initialize with Safety
   try {
      const { createClient } = window.supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      if (client) {
         window.supabaseClient = client;
         console.log('Carenium: Database initialized successfully.');
      } else {
         throw new Error('createClient returned null');
      }
   } catch (err) {
      console.error('Carenium: Critical initialization error:', err.message);
   }
})();
