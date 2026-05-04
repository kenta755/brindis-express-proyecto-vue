<template>
  <div class="promotions-page">
    <!-- Navbar (Premium like Catalog) -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="brand-title">Brindis Express</router-link>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/home" class="nav-link">
              <span class="nav-icon">🏠</span>
              Inicio
            </router-link>
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

    <!-- Fondo animado con partículas doradas -->
    <div class="particles-bg"></div>
    <div class="background-overlay"></div>

    <!-- Hero Premium -->
    <section class="promotions-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gold-text">Promociones</span> Exclusivas
        </h1>
        <p class="hero-subtitle">
          Ofertas reservadas solo para los que saben disfrutar lo mejor
        </p>
        <div class="countdown-timer" v-if="hasActiveCountdown">
          <span>Termina en</span>
          <div class="timer">
            {{ countdown.days }}d {{ countdown.hours }}h {{ countdown.minutes }}m {{ countdown.seconds }}s
          </div>
        </div>
      </div>
      <div class="hero-scroll-hint">↓ Descubre las ofertas</div>
    </section>

    <!-- Filtros Premium (Glassmorphism + 3D hover) -->
    <div class="filters-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['filter-tab', { active: activeTab === tab.id }]"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Grid de promociones -->
    <div class="promotions-grid">
      <div
        v-for="promo in filteredPromotions"
        :key="promo.id"
        class="promo-card"
        :class="promo.rarity"
        @mouseenter="hoverCard = promo.id"
        @mouseleave="hoverCard = null"
      >
        <!-- Badge diagonal premium -->
        <div class="promo-badge" v-if="promo.exclusive">
          <span>{{ promo.exclusive }}</span>
        </div>

        <!-- Imagen con efecto parallax -->
        <div class="promo-image">
          <img :src="promo.image" :alt="promo.title" />
          <div class="image-overlay"></div>
          <div class="shine-effect"></div>
        </div>

        <div class="promo-content">
          <h3 class="promo-title">{{ promo.title }}</h3>
          <p class="promo-description">{{ promo.description }}</p>

          <div class="promo-price">
            <div class="original-price" v-if="promo.originalPrice">
              {{ promo.originalPrice }}
            </div>
            <div class="final-price">
              {{ getPriceForUser(promo) }}
            </div>
            <div class="discount-tag" v-if="promo.discount">
              {{ promo.discount }}
            </div>
          </div>

          <div class="promo-tags" v-if="promo.tags">
            <span v-for="tag in promo.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <button @click="buyNow(promo)" class="buy-btn">
            <span class="btn-icon">⚡</span>
            Comprar Ahora
          </button>
        </div>

        <div class="promo-timer" v-if="promo.endsAt">
          Termina en {{ formatTimeLeft(promo.endsAt) }}
        </div>
      </div>
    </div>

    <div v-if="filteredPromotions.length === 0" class="empty-state">
      <div class="empty-icon">🍷</div>
      <h3>No hay promociones disponibles en este momento</h3>
      <p>¡Vuelve pronto o sube de categoría para acceder a ofertas exclusivas!</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'

const store = useStore()
const router = useRouter()

// Estado de autenticación
const isAuthenticated = ref(false)
const userName = ref('')
const userRole = ref('user') // user | vip | premium | admin
const hoverCard = ref(null)

// Tabs de filtro
const tabs = [
  { id: 'all', label: 'Todas', icon: '🎁' },
  { id: 'vip', label: 'VIP', icon: '⭐', badge: '15%' },
  { id: 'premium', label: 'Premium', icon: '💎', badge: '25%' },
  { id: 'limited', label: 'Tiempo Limitado', icon: '⏰' }
]
const activeTab = ref('all')

// Datos de promociones corregidos y consolidados
const promotions = computed(() => {
  const list = store.promotions || []
  return list.map((p, idx) => {
    const endsAt = p.fecha_fin ? new Date(p.fecha_fin) : null
    const hasEndsAt = endsAt && endsAt > new Date()
    
    // Mapeo de rareza basado en el tipo o índice para demostración
    const rarity = idx % 3 === 0 ? 'vip' : idx % 3 === 1 ? 'premium' : 'limited'
    
    return {
      id: p.id_promocion,
      title: p.nombre_promocion || 'Promoción Especial',
      description: p.descripcion || `Oferta exclusiva en nuestra selección premium. ${p.cantidad_productos || 0} productos incluidos.`,
      image: p.imagen_url || 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
      basePrice: p.precio_promocion ? `$${Number(p.precio_promocion).toLocaleString('es-CO')}` : 'Consultar',
      originalPrice: p.precio_original ? `$${Number(p.precio_original).toLocaleString('es-CO')}` : null,
      discount: p.descuento ? `${p.descuento}% OFF` : null,
      exclusive: hasEndsAt ? 'Tiempo Limitado' : (rarity === 'vip' ? 'VIP' : (rarity === 'premium' ? 'Premium' : null)),
      rarity: rarity,
      tags: ['Exclusivo', 'Promoción'],
      endsAt: endsAt
    }
  })
})

// Filtro según tab activo
const filteredPromotions = computed(() => {
  if (!promotions.value) return []
  return promotions.value.filter(promo => {
    if (activeTab.value === 'all') return true
    if (activeTab.value === 'vip' && promo.rarity === 'vip') return true
    if (activeTab.value === 'premium' && promo.rarity === 'premium') return true
    if (activeTab.value === 'limited' && promo.endsAt) return true
    return false
  })
})

// Precio según rol
function getPriceForUser(promo) {
  if (!promo.basePrice.startsWith('$')) return promo.basePrice
  const price = parseInt(promo.basePrice.replace(/[$,.]/g, ''))
  if (userRole.value === 'vip') return `$${(price * 0.85).toLocaleString('es-CO')}`
  if (userRole.value === 'premium') return `$${(price * 0.75).toLocaleString('es-CO')}`
  return promo.basePrice
}

// Temporizador global
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const hasActiveCountdown = ref(true)
let timerInterval = null

function updateCountdown() {
  const end = new Date('2025-12-31T23:59:59')
  const now = new Date()
  const diff = end - now

  if (diff <= 0) {
    hasActiveCountdown.value = false
    clearInterval(timerInterval)
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

function formatTimeLeft(date) {
  const diff = new Date(date) - new Date()
  if (diff <= 0) return 'Finalizada'
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${h}h ${m}m`
}

function buyNow(promo) {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  alert(`¡Genial! Has seleccionado: ${promo.title}. Serás redirigido para completar tu compra.`)
}

function checkAuthStatus() {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('user') || localStorage.getItem('usuario')
  if (token && user && user !== "undefined") {
    try {
      const userData = JSON.parse(user)
      isAuthenticated.value = true
      userName.value = userData.nombre || userData.email || 'Usuario'
      userRole.value = userData.role || userData.rol || 'user'
    } catch (_) {
      logout()
    }
  } else {
    isAuthenticated.value = false
    userName.value = ''
    userRole.value = 'user'
  }
}

function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('usuario')
  isAuthenticated.value = false
  userName.value = ''
  router.push('/login')
}

onMounted(async () => {
  checkAuthStatus()
  await store.fetchPromotions()
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:wght@600;700&display=swap');

:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
}

.promotions-page {
  position: relative;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background:
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  overflow-x: hidden;
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

/* Partículas y Fondo */
.particles-bg {
  position: fixed; inset: 0; pointer-events: none;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.06) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

.background-overlay {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  z-index: 1; pointer-events: none;
}

/* Hero */
.promotions-hero {
  position: relative;
  height: 70vh;
  background: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.95)),
              url('https://images.unsplash.com/photo-1517783972485-52b8c2e9db34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; color: white; z-index: 2;
}

.hero-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 700;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
}

.gold-text { display: block; font-size: 0.8em; }

.hero-subtitle {
  font-size: 1.2rem; max-width: 600px; margin: 1rem auto 2rem;
  opacity: 0.8; font-style: italic;
}

.countdown-timer {
  background: rgba(232, 123, 43, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(232, 123, 43, 0.3);
  padding: 1rem 2rem; border-radius: 50px;
}

.timer {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem; font-weight: bold; color: #E87B2B;
}

/* Filters */
.filters-container {
  display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;
  padding: 3rem 2rem; z-index: 3; position: relative;
}

.filter-tab {
  background: rgba(20, 15, 10, 0.8);
  border: 1px solid rgba(201, 168, 76, 0.2);
  color: #fff; padding: 0.8rem 1.5rem; border-radius: 50px;
  font-weight: 600; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; gap: 0.5rem;
}

.filter-tab:hover {
  border-color: #C9A84C; background: rgba(201, 168, 76, 0.1);
}

.filter-tab.active {
  background: linear-gradient(135deg, #C9A84C, #E87B2B);
  color: #000; border-color: transparent;
}

/* Grid */
.promotions-grid {
  max-width: 1400px; margin: 0 auto; padding: 0 2rem 4rem;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem; z-index: 2; position: relative;
}

.promo-card {
  background: rgba(20, 20, 20, 0.9);
  border-radius: 15px; overflow: hidden; position: relative;
  transition: all 0.4s ease; border: 1px solid rgba(201, 168, 76, 0.1);
}

.promo-card:hover {
  transform: translateY(-10px); border-color: #C9A84C;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
}

.promo-badge {
  position: absolute; top: 15px; right: -35px;
  background: linear-gradient(45deg, #C9A84C, #E87B2B);
  color: #000; padding: 5px 40px; font-weight: 800; font-size: 0.8rem;
  transform: rotate(45deg); z-index: 10;
}

.promo-image { height: 220px; overflow: hidden; }
.promo-image img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.promo-card:hover .promo-image img { transform: scale(1.1); }

.promo-content { padding: 1.5rem; }
.promo-title { font-family: 'Cinzel', serif; color: #E8C97A; font-size: 1.4rem; margin-bottom: 0.5rem; }
.promo-description { color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.5; height: 3em; overflow: hidden; }

.promo-price { display: flex; align-items: center; gap: 0.8rem; margin: 1rem 0; }
.final-price { color: #E8C97A; font-size: 1.8rem; font-weight: 700; }
.original-price { color: rgba(255,255,255,0.4); text-decoration: line-through; font-size: 0.9rem; }
.discount-tag { background: #E87B2B; color: #fff; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }

.buy-btn {
  width: 100%; background: linear-gradient(135deg, #C9A84C, #8B6914);
  color: #fff; border: none; padding: 0.9rem; border-radius: 4px;
  font-weight: 700; cursor: pointer; transition: 0.3s;
  text-transform: uppercase; letter-spacing: 1px;
}

.buy-btn:hover { filter: brightness(1.2); transform: translateY(-2px); }

.promo-timer {
  background: rgba(232, 123, 43, 0.8); color: #fff;
  text-align: center; padding: 0.5rem; font-weight: bold; font-size: 0.85rem;
}

.empty-state { text-align: center; padding: 5rem 2rem; color: rgba(255,255,255,0.5); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }

/* Footer Copy from Catalog */
.footer {
  background: rgba(10, 7, 5, 0.98);
  border-top: 1px solid rgba(201, 168, 76, 0.2);
  padding: 3rem 2rem; position: relative; z-index: 10;
}

.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 2rem;
}

.footer-brand { display: flex; align-items: center; gap: 1rem; }
.fb-emblem { font-size: 2.5rem; }
.fb-name { font-family: 'Cinzel', serif; color: #C9A84C; font-size: 1.5rem; font-weight: 700; display: block; }
.fb-tagline { color: rgba(200,175,130,0.5); font-size: 0.8rem; margin: 0; }

.footer-links { display: flex; flex-direction: column; gap: 0.5rem; }
.flink { color: rgba(200,175,130,0.7); text-decoration: none; font-size: 0.9rem; transition: 0.3s; }
.flink:hover { color: #C9A84C; }

.footer-copy {
  text-align: center; margin-top: 2rem; padding-top: 2rem;
  border-top: 1px solid rgba(201, 168, 76, 0.1);
  color: rgba(200,175,130,0.4); font-size: 0.75rem;
}

@media (max-width: 768px) {
  .navbar-content { padding: 0 1.5rem; }
  .nav-links { display: none; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>