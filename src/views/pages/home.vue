<template>
  <!-- Layout para páginas de autenticación (solo el componente de login) -->
  <div v-if="isAuthPage" class="auth-layout">
    <router-view />
  </div>

  <!-- Layout principal de Brindis Express -->
  <div v-else class="home-page" ref="homePage">
    <!-- Fondo animado con efectos -->
    <div class="background-overlay"></div>
    
    <!-- Navbar (Premium like Catalog) -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="brand-title">Brindis Express</router-link>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/catalogo" class="nav-link">
              <span class="nav-icon">📋</span>
              Catálogo
            </router-link>
            <router-link to="/promociones" class="nav-link">
              <span class="nav-icon">🎯</span>
              Promociones
            </router-link>
            <a href='#contactanos' class="nav-link">
              <span class="nav-icon">📞</span>
              Contáctanos
            </a>
          </div>
          
          <!-- Botón de logout para usuarios autenticados -->
          <div v-if="isAuthenticated" class="user-menu">
            <div class="user-welcome">
              <span class="welcome-icon">👋</span>
              <span class="welcome-text">Hola, {{ userName }}!</span>
            </div>
            <button @click="logout" class="logout-btn">
              <span class="logout-icon">🚪</span>
              Cerrar Sesión
            </button>
          </div>
          
          <!-- Botón de login para usuarios no autenticados -->
          <router-link v-else to="/login" class="login-link">
            <span class="login-icon">🔑</span>
            Iniciar Sesión
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main content (hidden when terms are shown) -->
    <div v-if="!showTerms" class="main-content">
      <!-- Carrusel Hero -->
      <div class="hero-carousel">
        <div class="carousel-container">
          <div
            v-for="(img, index) in imagenes"
            :key="index"
            :class="['carousel-slide', { active: index === actual }]"
            :style="{ backgroundImage: `url(${img})` }"
          >
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <h2 class="slide-title">Brindis Express</h2>
              <p class="slide-subtitle">Experiencia Premium en Bebidas</p>
              <div class="hero-actions">
                <router-link to="/catalogo" class="hero-btn primary">
                  Explorar Catálogo
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="carousel-controls">
            <button @click="anterior" class="carousel-btn prev">
              <span>⬅️</span>
            </button>
            <button @click="siguiente" class="carousel-btn next">
              <span>➡️</span>
            </button>
          </div>

          <div class="carousel-indicators">
            <button
              v-for="(img, index) in imagenes"
              :key="index"
              @click="actual = index"
              :class="['indicator', { active: index === actual }]"
            ></button>
          </div>
        </div>
      </div>

      <!-- Secciones de información -->
      <div class="content-sections">
        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">🥃 Sobre Nosotros</h2>
            <div class="card-underline"></div>
          </div>
          <div class="card-content">
            <p>
              En <strong>Brindis Express</strong> nos apasiona ofrecer una experiencia única en bebidas. 
              Nuestro catálogo está cuidadosamente seleccionado para complacer a los paladares más exigentes.
            </p>
            <p>
              Explora nuestra amplia variedad y descubre tu nueva favorita. <em>¡Salud!</em>
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <h2 class="card-title">🎯 Nuestra Misión</h2>
            <div class="card-underline"></div>
          </div>
          <div class="card-content">
            <p>
              En <strong>Brindis Express</strong> tenemos como misión garantizar un excelente servicio en el ámbito 
              de las ventas de bebidas premium, asegurando disponibilidad y calidad excepcional.
            </p>
            <p>
              Colaboramos con las mejores marcas globales para garantizar que cada brindis sea un momento inolvidable.
            </p>
          </div>
        </div>
      </div>

      <!-- Vista previa del catálogo -->
      <div id="catalogo-preview" class="catalog-section">
        <div class="section-header">
          <h1 class="page-title">✨ Productos Destacados</h1>
          <p class="page-subtitle">Una muestra de nuestra excelencia</p>
          <div class="title-underline"></div>
        </div>
        
        <!-- Loading state -->
        <div v-if="loadingProducts" class="products-loading">
          <div class="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <!-- Empty state (backend unreachable) -->
        <div v-else-if="imagenesCatalogo.length === 0" class="products-empty">
          <span>🥃</span>
          <p>No hay productos disponibles en este momento.</p>
          <router-link to="/catalogo" class="buy-btn" style="margin-top:1rem; display:inline-flex;">Ver Catálogo</router-link>
        </div>

        <div v-else class="products-grid">
          <div class="product-card" v-for="(img, index) in imagenesCatalogo" :key="index">
            <div class="card-image-container">
              <div class="discount-badge">20% dto</div>
              <img :src="img.src" :alt="img.alt" class="product-image" />
              <div class="image-overlay"></div>
            </div>
            
            <div class="product-info">
              <h3 class="product-title">{{ img.titulo }}</h3>
              <p class="product-description">{{ img.descripcion }}</p>
              
              <div class="product-actions">
                <div class="price-display">
                  <span class="price-value">{{ img.precio }}</span>
                </div>
                <div class="action-buttons">
                  <button class="buy-btn" @click="buyNow(img)">
                    <span>⚡</span>
                    <span>Comprar</span>
                  </button>
                  <button v-if="isAuthenticated" class="add-to-cart-btn" @click="addToCart(img)">
                    <span class="cart-icon">🛒</span>
                    <span>Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Términos y Condiciones (Premium Modal) -->
    <div v-if="showTerms" class="terms-modal-overlay" @click="toggleTerms">
      <div class="terms-modal" @click.stop>
        <div class="modal-glow"></div>
        <button class="close-modal-btn" @click="toggleTerms">×</button>
        
        <div class="modal-header">
          <div class="brand-emblem">🥃</div>
          <h2 class="section-title">Lineamientos Corporativos</h2>
          <p class="section-subtitle">Términos, Condiciones y Compromiso de Calidad</p>
          <div class="title-underline"></div>
        </div>
        
        <div class="terms-content">
          <div class="terms-grid">
            <!-- 1. Aceptación -->
            <div class="terms-card">
              <div class="card-icon">📜</div>
              <h3 class="terms-subtitle">Aceptación de Términos</h3>
              <p class="terms-text">
                Al interactuar con nuestra plataforma, usted ratifica su consentimiento con nuestro marco legal y operativo vigente.
              </p>
              <div class="acceptance-badge">✅ Estatus: Vigente</div>
            </div>
            
            <!-- 2. Edad -->
            <div class="terms-card">
              <div class="card-icon">🔞</div>
              <h3 class="terms-subtitle">Restricción de Edad</h3>
              <p class="terms-text">Venta exclusiva para mayores de 18 años. Se requerirá documento de identidad al momento de la entrega.</p>
              <div class="age-restriction">Control Estricto</div>
            </div>

            <!-- 3. Entrega -->
            <div class="terms-card">
              <div class="card-icon">🚚</div>
              <h3 class="terms-subtitle">Logística y Entrega</h3>
              <p class="terms-text">Nuestro compromiso de entrega es de 30-60 min en áreas metropolitanas bajo condiciones normales.</p>
              <div class="delivery-badge">Fast Delivery</div>
            </div>

            <!-- 4. Propiedad Intelectual -->
            <div class="terms-card">
              <div class="card-icon">🛡️</div>
              <h3 class="terms-subtitle">Propiedad Intelectual</h3>
              <p class="terms-text">Todo el contenido visual y descriptivo es propiedad de Brindis Express. Prohibida su reproducción.</p>
              <div class="ip-badge">Copyright © 2025</div>
            </div>

            <!-- 5. Pagos Seguros -->
            <div class="terms-card">
              <div class="card-icon">💳</div>
              <h3 class="terms-subtitle">Transacciones Seguras</h3>
              <p class="terms-text">Implementamos protocolos de encriptación de grado militar para proteger sus datos financieros.</p>
              <div class="payment-badge">SSL Encrypted</div>
            </div>

            <!-- 6. Responsabilidad -->
            <div class="terms-card">
              <div class="card-icon">⚖️</div>
              <h3 class="terms-subtitle">Consumo Responsable</h3>
              <p class="terms-text">El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986. Disfrute con moderación.</p>
              <div class="responsibility-warning">Compromiso Social</div>
            </div>
          </div>
          
          <!-- Botón de acción principal -->
          <div class="modal-actions">
            <button class="accept-terms-btn" @click="toggleTerms">
              Confirmar y Explorar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer (Premium like Catalog) -->
    <footer class="footer" id="contactanos">
      <div class="footer-top-border"></div>
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="fb-emblem">🥃</span>
          <div>
            <span class="fb-name">Brindis Express</span>
            <p class="fb-tagline">Experiencia Premium en Bebidas</p>
          </div>
        </div>
        <div class="footer-links">
          <a href="tel:+573023723919"                   class="flink">📞 +57 302 372 3919</a>
          <a href="mailto:contacto@brindisexpress.com"  class="flink">✉️ contacto@brindisexpress.com</a>
          <span class="flink">📍 Calle 30, Carrera 34 #1</span>
        </div>
      </div>
      <p class="footer-copy">© 2025 Brindis Express · Todos los derechos reservados · Solo para mayores de 18 años</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { websocketService } from '@/services/websocket'

const router = useRouter()
const route = useRoute()


const imagenes = [
  "https://capasdelatierra.win/wp-content/uploads/bebidas-alcoholicas.jpg",
  "https://www.blasbermejo.com/wp-content/uploads/2022/12/clasificacion-bebidas-alcoholicas.jpg",
  "https://images.squarespace-cdn.com/content/v1/66e9d7dd116b1a1677dd8758/17c60a9d-89eb-44f9-9484-8989deefa578/PNG+image.jpeg"
]


const store = useStore()

// Productos destacados desde la base de datos (primeros 3 activos)
const imagenesCatalogo = computed(() => {
  return store.products
    .filter(p => p.activo !== false)
    .slice(0, 3)
    .map(p => ({
      src: p.imagen_url || 'https://via.placeholder.com/300',
      alt: p.nombre,
      titulo: p.nombre,
      descripcion: p.descripcion || 'Producto premium de alta calidad.',
      precio: `$${Number(p.precio_venta).toLocaleString('es-CO')}`
    }))
})


// Estado del carrusel
const actual = ref(0)
let intervalo = null

// Estado de autenticación
const isAuthenticated = ref(false)
const userName = ref('')

// Estado del modal
const showTerms = ref(false)

// Computed para verificar si es página de auth
const isAuthPage = computed(() => {
  return route.meta?.hideNavigation || route.name === 'login'
})

// Funciones del carrusel
function siguiente() {
  actual.value = (actual.value + 1) % imagenes.length
}

function anterior() {
  actual.value = (actual.value - 1 + imagenes.length) % imagenes.length
}

// Función para verificar autenticación
function checkAuthStatus() {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('user') || localStorage.getItem('usuario')

  console.log('🔍 Home Page - Auth Status Check:', {
    hasToken: !!token,
    token: token,
    tokenStartsWith: token?.substring(0, 20),
    isGoogleToken: token?.startsWith('google_session_'),
    hasUser: !!user,
    user: user,
    userNotUndefined: user !== "undefined"
  });

  // Allow Google login users immediately
  if (token && token.startsWith('google_session_')) {
    console.log('✅ Home Page - Google login user detected, allowing access');
    isAuthenticated.value = true
    userName.value = 'Google User'
    return
  }

  // Allow any user with valid token (temporary fix)
  if (token && token.length > 10) {
    console.log('✅ Home Page - User with valid token detected, allowing access');
    isAuthenticated.value = true
    userName.value = 'Usuario'
    return
  }

  if (token && user && user !== "undefined") {
    try {
      const userData = JSON.parse(user)
      console.log('🔍 Home Page - User Data Parsed:', {
        userData: userData,
        userName: userData.nombre,
        userEmail: userData.email,
        userActivo: userData.activo
      });
      
      isAuthenticated.value = true
      userName.value = userData.nombre || userData.email || 'Usuario'
      
      console.log('✅ Home Page - User authenticated:', userName.value);
    } catch (err) {
      console.log('❌ Home Page - Error parsing user data:', err);
      // Allow access even if parsing fails (temporary fix)
      if (token && token.length > 10) {
        isAuthenticated.value = true
        userName.value = 'Usuario'
      } else {
        isAuthenticated.value = false
        userName.value = ''
        localStorage.removeItem('authToken')
        localStorage.removeItem('usuario')
      }
    }
  } else {
    console.log('❌ Home Page - No valid auth data found');
    isAuthenticated.value = false
    userName.value = ''
  }
}

// Función de logout
function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('usuario')
  isAuthenticated.value = false
  userName.value = ''
  router.push('/login')
}

// Redirige a compra si autenticado, o a login si no
function buyNow(producto) {
  if (isAuthenticated.value) {
    router.push('/compra')
  } else {
    router.push('/login')
  }
}

// Función para agregar al carrito
function addToCart(producto) {
  alert(`¡${producto.titulo} agregado al carrito!`)
}

// New toggle function for terms
function toggleTerms() {
  showTerms.value = !showTerms.value
  if (!showTerms.value) {
    localStorage.setItem('policyAccepted', 'true')
  }
}

const loadingProducts = ref(false)

// Periodic status check interval
let statusCheckInterval = null

onMounted(async () => {
  checkAuthStatus()
  
  // Connect to WebSocket for real-time status updates
  if (isAuthenticated.value) {
    websocketService.connect()
    
    // Also set up periodic status check from backend (every 30 seconds)
    statusCheckInterval = setInterval(async () => {
      await checkUserStatusFromBackend()
    }, 30000)
  }
  
  loadingProducts.value = true
  try {
    await store.fetchProducts()
  } catch (e) {
    console.error('Error cargando productos en home:', e)
  } finally {
    loadingProducts.value = false
  }
  if (!isAuthPage.value) {
    intervalo = setInterval(siguiente, 5000)
  }
  const policyAccepted = localStorage.getItem('policyAccepted')
  if (route.query.showTerms === 'true' || !policyAccepted) {
    showTerms.value = true
  }
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
  if (statusCheckInterval) clearInterval(statusCheckInterval)
  websocketService.disconnect()
})

// Function to check user status from backend
async function checkUserStatusFromBackend() {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return
    
    const user = JSON.parse(localStorage.getItem('usuario') || '{}')
    if (!user.email) return
    
    // Fetch user profile from backend to check if still active
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      // If 401 or 403, user might be deactivated
      if (response.status === 401 || response.status === 403) {
        console.log('🚫 User appears to be deactivated - forcing logout')
        alert('Tu sesión ha expirado o tu cuenta ha sido desactivada.')
        logout()
      }
      return
    }
    
    const userData = await response.json()
    
    // Check if user is inactive
    if (userData.activo === false || userData.activo === 0) {
      console.log('🚫 User deactivated detected - forcing logout')
      alert('Tu cuenta ha sido desactivada por un administrador.')
      logout()
    }
    
  } catch (error) {
    console.error('Error checking user status:', error)
  }
}

watch(() => route.path, () => checkAuthStatus())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
}

/* Base Page Style matching Catalog */
.home-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;
}

.background-overlay {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none; z-index: 1;
}

/* Navbar Premium Copy from Catalog */
.navbar {
  position: sticky; top: 0; z-index: 999;
  height: 90px; overflow: hidden;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6);
}

.navbar::before {
  content: '';
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  filter: brightness(0.55) saturate(1.3);
  z-index: 0;
}

.navbar::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(60,30,5,0.82) 0%, rgba(20,12,3,0.65) 30%, rgba(20,12,3,0.65) 70%, rgba(60,30,5,0.82) 100%),
              linear-gradient(180deg, rgba(180,120,20,0.18) 0%, transparent 40%, transparent 60%, rgba(180,120,20,0.12) 100%);
  border-bottom: 1px solid rgba(201,168,76,0.35);
  z-index: 1;
}

.navbar-content {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1400px; margin: 0 auto;
  height: 90px; padding: 0 3.5rem; gap: 1.5rem;
}

.brand-title {
  font-family: 'Cinzel', serif !important;
  font-size: 1.55rem; font-weight: 700; letter-spacing: 4px;
  text-decoration: none;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(201,168,76,0.5));
}

.nav-section { display: flex; align-items: center; gap: 1.2rem; }
.nav-links   { display: flex; gap: 0.5rem; }

.nav-link {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72);
  border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #FFE066; background: rgba(10,7,3,0.9);
  border-color: rgba(201,168,76,0.6);
  transform: translateY(-1px);
}

.user-menu   { display: flex; align-items: center; gap: 0.6rem; }
.user-welcome {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.75); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 30px; padding: 0.5rem 1rem;
  color: rgba(240,220,180,0.9); font-size: 0.82rem; font-weight: 600;
}

.logout-btn {
  background: linear-gradient(135deg, #c0392b, #96281b);
  border: none; color: #fff;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  cursor: pointer; font-size: 0.82rem; font-weight: 700;
}

.login-link {
  color: rgba(240,220,180,0.9) !important; text-decoration: none;
  font-size: 0.82rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
}

/* Hero Carousel */
.hero-carousel {
  position: relative; height: 80vh; overflow: hidden; z-index: 2;
}

.carousel-slide {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  opacity: 0; transition: 1s ease; display: flex; align-items: center; justify-content: center;
}

.carousel-slide.active { opacity: 1; }

.slide-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.8));
}

.slide-content {
  position: relative; z-index: 10; text-align: center;
}

.slide-title {
  font-family: 'Cinzel', serif; font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 700; margin-bottom: 1rem;
  background: linear-gradient(135deg, #FFE066, #C9A84C, #E87B2B);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 30px rgba(201,168,76,0.4));
}

.slide-subtitle {
  font-size: 1.5rem; font-weight: 300; color: rgba(255,255,255,0.9);
  margin-bottom: 2.5rem; letter-spacing: 2px;
}

.hero-btn {
  padding: 1.2rem 3rem; border-radius: 50px; font-weight: 700;
  text-decoration: none; text-transform: uppercase; letter-spacing: 2px;
  transition: 0.4s;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #C9A84C, #8B6914); color: #fff;
  box-shadow: 0 8px 30px rgba(201,168,76,0.3);
}

.hero-btn:hover { transform: translateY(-5px); filter: brightness(1.2); }

.carousel-controls {
  position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between;
  padding: 0 3rem; transform: translateY(-50%); z-index: 20;
}

.carousel-btn {
  background: rgba(0,0,0,0.5); border: 1px solid rgba(201,168,76,0.3);
  color: #fff; width: 60px; height: 60px; border-radius: 50%;
  cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
}

.carousel-indicators {
  position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: 1rem; z-index: 20;
}

.indicator {
  width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.3);
  border: none; cursor: pointer; transition: 0.3s;
}

.indicator.active { background: #C9A84C; width: 30px; border-radius: 6px; }

/* Content Sections */
.content-sections {
  padding: 6rem 2rem; max-width: 1400px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 4rem; z-index: 2; position: relative;
}

.info-card {
  background: rgba(20, 15, 10, 0.85); backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 76, 0.15); border-radius: 20px;
  padding: 3rem; transition: 0.4s;
}

.info-card:hover { transform: translateY(-10px); border-color: #C9A84C; }

.card-title {
  font-family: 'Cinzel', serif; color: #E8C97A; font-size: 2rem; margin-bottom: 0.5rem;
}

.card-underline {
  width: 60px; height: 3px; background: #C9A84C; margin-bottom: 2rem;
}

.card-content p { color: rgba(255,255,255,0.8); line-height: 1.8; font-size: 1.1rem; margin-bottom: 1.5rem; }

/* Catalog Preview Section */
.catalog-section { padding: 4rem 2rem 8rem; position: relative; z-index: 2; }
.section-header { text-align: center; margin-bottom: 5rem; }
.page-title {
  font-family: 'Cinzel', serif; font-size: 3.5rem; font-weight: 700;
  background: linear-gradient(135deg, #E8C97A, #C9A84C, #E87B2B);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.page-subtitle { color: rgba(200,175,130,0.5); font-style: italic; margin-top: 1rem; }
.title-underline { width: 120px; height: 3px; background: #E87B2B; margin: 2rem auto 0; }

.products-grid {
  max-width: 1400px; margin: 0 auto 5rem;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem;
}

.products-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(20, 15, 10, 0.6);
  border: 1px dashed rgba(201, 168, 76, 0.3);
  border-radius: 15px;
  max-width: 600px;
  margin: 0 auto 4rem;
}

.products-empty span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.products-empty p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.product-card {
  background: rgba(20, 20, 20, 0.95); border: 1px solid rgba(201, 168, 76, 0.15);
  border-radius: 15px; overflow: hidden; transition: 0.4s;
}

.product-card:hover { transform: translateY(-10px); border-color: #C9A84C; }

.card-image-container { position: relative; height: 300px; overflow: hidden; }
.product-image { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.product-card:hover .product-image { transform: scale(1.1); }

.discount-badge {
  position: absolute; top: 1rem; left: 1rem; background: #e53e3e;
  color: #fff; padding: 0.4rem 1rem; border-radius: 4px; font-weight: 700; z-index: 2;
}

.product-info { padding: 2rem; }
.product-title { font-family: 'Cinzel', serif; color: #E8C97A; font-size: 1.6rem; margin-bottom: 0.8rem; }
.product-description { color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 2rem; }

.product-actions { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
.price-value { color: #E8C97A; font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; display: block; }

.add-to-cart-btn {
  flex: 1; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4);
  color: #E8C97A; padding: 0.9rem; border-radius: 4px;
  font-weight: 700; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}

.add-to-cart-btn:hover { background: rgba(201,168,76,0.25); }

.action-buttons {
  display: flex; gap: 0.8rem; margin-top: 1rem;
}

.buy-btn {
  flex: 1; background: linear-gradient(135deg, #C9A84C, #8B6914);
  color: #fff; padding: 0.9rem; border-radius: 4px;
  font-weight: 700; text-decoration: none; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}

.buy-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }

.login-prompt-btn {
  width: 100%; border: 1px solid #C9A84C; color: #C9A84C;
  padding: 1rem; border-radius: 4px; text-decoration: none;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}

.view-catalog-btn {
  display: inline-flex; align-items: center; gap: 1rem; padding: 1.5rem 4rem;
  background: rgba(201, 168, 76, 0.1); border: 2px solid #C9A84C;
  color: #E8C97A; text-decoration: none; font-size: 1.2rem; font-weight: 700;
  border-radius: 50px; transition: 0.4s; text-transform: uppercase;
}

.view-catalog-btn:hover { background: #C9A84C; color: #000; }

.terms-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 2000;
  padding: 2rem;
}

.terms-modal {
  background: linear-gradient(160deg, #130F0A 0%, #0A0807 100%);
  border: 1px solid rgba(201, 168, 76, 0.3); border-radius: 24px;
  width: 95%; max-width: 1100px; max-height: 90vh; padding: 4rem 3rem;
  overflow-y: auto; position: relative;
  box-shadow: 0 50px 100px rgba(0,0,0,0.9), 0 0 50px rgba(201, 168, 76, 0.1);
}

.modal-glow {
  position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 200px; background: rgba(201, 168, 76, 0.2);
  filter: blur(80px); pointer-events: none;
}

.close-modal-btn {
  position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1); color: #C9A84C; width: 40px; height: 40px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; cursor: pointer; transition: 0.3s;
}

.close-modal-btn:hover { background: rgba(201,168,76,0.2); transform: rotate(90deg); }

.brand-emblem { font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(201,168,76,0.5)); }

.section-subtitle { color: rgba(200,175,130,0.5); font-size: 1rem; letter-spacing: 1px; margin-top: 0.5rem; }

.terms-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 1.5rem; 
  margin-top: 2rem;
}

.terms-card {
  background: rgba(255,255,255,0.03); 
  border: 1px solid rgba(201,168,76,0.1);
  padding: 2rem; border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; align-items: center; text-align: center;
}

.terms-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(201,168,76,0.4);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.card-icon {
  font-size: 2.2rem; margin-bottom: 1.2rem;
  background: rgba(201,168,76,0.1); width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 15px; border: 1px solid rgba(201,168,76,0.2);
}

.terms-subtitle { 
  font-family: 'Cinzel', serif; color: #FFE066; font-size: 1.2rem; 
  margin-bottom: 1rem; letter-spacing: 1px;
}
.terms-text { color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 1.5rem; }

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.accept-terms-btn {
  background: linear-gradient(135deg, #C9A84C, #E87B2B);
  color: #000;
  border: none;
  padding: 1.2rem 4rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(232, 123, 43, 0.3);
}

.accept-terms-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 40px rgba(232, 123, 43, 0.5);
  filter: brightness(1.1);
}

.acceptance-badge, .age-restriction, .responsibility-warning, .delivery-badge, .ip-badge, .payment-badge {
  padding: 0.5rem 1.2rem; border-radius: 30px; font-weight: 700; font-size: 0.75rem; 
  width: fit-content; margin-top: auto; letter-spacing: 0.5px;
  text-transform: uppercase;
}

.acceptance-badge { background: rgba(40, 167, 69, 0.2); color: #2ecc71; border: 1px solid rgba(40, 167, 69, 0.3); }
.age-restriction { background: rgba(220, 53, 69, 0.2); color: #e74c3c; border: 1px solid rgba(220, 53, 69, 0.3); }
.delivery-badge { background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.3); }
.ip-badge { background: rgba(155, 89, 182, 0.2); color: #9b59b6; border: 1px solid rgba(155, 89, 182, 0.3); }
.payment-badge { background: rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
.responsibility-warning { background: rgba(232, 123, 43, 0.2); color: #E87B2B; border: 1px solid rgba(232, 123, 43, 0.3); }

/* Footer */
.footer {
  background: rgba(10, 7, 5, 0.98);
  border-top: 1px solid rgba(201, 168, 76, 0.2);
  padding: 4rem 2rem; position: relative; z-index: 10;
}

.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 2rem;
}

.footer-brand { display: flex; align-items: center; gap: 1rem; }
.fb-emblem { font-size: 3rem; }
.fb-name { font-family: 'Cinzel', serif; color: #C9A84C; font-size: 1.8rem; font-weight: 700; display: block; }
.fb-tagline { color: rgba(200,175,130,0.5); font-size: 0.9rem; margin: 0; }

.footer-links { display: flex; flex-direction: column; gap: 0.8rem; }
.flink { color: rgba(200,175,130,0.7); text-decoration: none; font-size: 1rem; transition: 0.3s; }
.flink:hover { color: #C9A84C; }

.footer-copy {
  text-align: center; margin-top: 3rem; padding-top: 2rem;
  border-top: 1px solid rgba(201, 168, 76, 0.1);
  color: rgba(200,175,130,0.4); font-size: 0.8rem;
}

@media (max-width: 768px) {
  .navbar-content { padding: 0 1.5rem; }
  .nav-links { display: none; }
  .content-sections { grid-template-columns: 1fr; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>