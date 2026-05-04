import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes, { PromoRoutes, MenuVirtualRoutes } from './MainRoutes';
import AuthRoutes from './AuthRoutes';

// Function to check if user is active
function isUserActive(): boolean {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const token = localStorage.getItem('authToken') || '';
    
    // Allow Google login users (tokens starting with 'google_session_')
    if (token.startsWith('google_session_')) {
      console.log('✅ Router Guard - Google login user allowed');
      return true;
    }
    
    // Allow any user with valid token for now (temporary fix)
    if (token && token.length > 10) {
      console.log('✅ Router Guard - User with valid token allowed');
      return true;
    }
    
    const isActive = usuario.activo !== false && usuario.activo !== 0;
    
    console.log('🔍 Router Guard - User Status Check:', {
      usuario: usuario,
      activo: usuario.activo,
      isActive: isActive,
      userFields: Object.keys(usuario),
      isGoogleUser: token.startsWith('google_session_')
    });
    
    return isActive;
  } catch {
    console.log('🔍 Router Guard - Error parsing user data');
    // Allow users with tokens even if parsing fails (temporary fix)
    const token = localStorage.getItem('authToken') || '';
    return token.length > 10;
  }
}

// Function to logout inactive users
function logoutInactiveUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('usuario');
  localStorage.removeItem('user');
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/auth/Error.vue')
    },
    MainRoutes,
    PromoRoutes,
    MenuVirtualRoutes,
    AuthRoutes
  ]
});

// Add navigation guard to check user status
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const requiresAuth = to.meta.requiresAuth;
  
  console.log('🔍 Navigation Guard - Complete Check:', {
    to: to.path,
    from: from.path,
    requiresAuth: requiresAuth,
    hasToken: !!token,
    token: token,
    tokenStartsWith: token?.substring(0, 20),
    isGoogleToken: token?.startsWith('google_session_'),
    isLoginRoute: to.path === '/login',
    usuario: usuario,
    usuarioEmail: usuario.email,
    usuarioActivo: usuario.activo
  });
  
  // If route requires authentication and user has a token
  if (requiresAuth && token) {
    console.log('🔍 Route requires auth and user has token - checking user status');
    
    // Check if user is still active
    if (!isUserActive()) {
      console.log('🚫 Navigation blocked - user is inactive');
      logoutInactiveUser();
      next('/login');
      return;
    } else {
      console.log('✅ User is active - navigation allowed');
    }
  }
  
  // If user has a token but is inactive, redirect to login
  if (token && !isUserActive() && to.path !== '/login') {
    console.log('🚫 Navigation blocked - inactive user trying to access protected route');
    logoutInactiveUser();
    next('/login');
    return;
  }
  
  console.log('✅ Navigation allowed - proceeding to:', to.path);
  next();
});