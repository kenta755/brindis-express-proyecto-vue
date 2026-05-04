<template>
  <div class="compra-page">
    <div class="background-overlay"></div>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/home" class="brand-title">Brindis Express</router-link>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/home" class="nav-link">🏠 Inicio</router-link>
            <router-link to="/catalogo" class="nav-link">📋 Catálogo</router-link>
            <router-link to="/promociones" class="nav-link">🎯 Promociones</router-link>
          </div>
          <div v-if="isAuthenticated" class="user-menu">
            <div class="user-welcome">👋 {{ userName }}</div>
            <button @click="logout" class="logout-btn">🚪 Cerrar Sesión</button>
          </div>
          <router-link v-else to="/login" class="login-link">🔑 Iniciar Sesión</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="purchase-hero">
      <div class="hero-content">
        <div class="hero-icon">⚡</div>
        <h1 class="hero-title">Completar <span class="gold-text">Compra</span></h1>
        <p class="hero-subtitle">Estás a un paso de disfrutar lo mejor</p>
      </div>
    </section>

    <!-- Main content -->
    <div class="purchase-layout">

      <!-- Order summary -->
      <div class="order-summary glass-card">
        <div class="card-header">
          <h2>🛒 Resumen del Pedido</h2>
          <div class="gold-underline"></div>
        </div>

        <div class="order-items">
          <div class="order-item" v-for="(item, i) in orderItems" :key="i">
            <img :src="item.img" :alt="item.name" class="item-img" />
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-qty">Cant: {{ item.qty }}</span>
            </div>
            <span class="item-price">{{ item.price }}</span>
          </div>
        </div>

        <div class="order-totals">
          <div class="total-row"><span>Subtotal</span><span>{{ subtotal }}</span></div>
          <div class="total-row"><span>Envío</span><span class="gold-text">Gratis</span></div>
          <div class="total-row total-final"><span>Total</span><span class="gold-text">{{ subtotal }}</span></div>
        </div>
      </div>

      <!-- Checkout form -->
      <div class="checkout-form glass-card">
        <div class="card-header">
          <h2>📋 Datos de Entrega</h2>
          <div class="gold-underline"></div>
        </div>

        <form @submit.prevent="placeOrder" class="form-body">
          <!-- Personal info -->
          <div class="form-section">
            <h3 class="section-label">Información Personal</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Nombre completo *</label>
                <input v-model="form.nombre" type="text" placeholder="Tu nombre" required />
              </div>
              <div class="form-group">
                <label>Teléfono *</label>
                <input v-model="form.telefono" type="tel" placeholder="+57 300 000 0000" required />
              </div>
            </div>
            <div class="form-group">
              <label>Correo electrónico *</label>
              <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required />
            </div>
          </div>

          <!-- Delivery -->
          <div class="form-section">
            <h3 class="section-label">Dirección de Entrega</h3>
            <div class="form-group">
              <label>Dirección *</label>
              <input v-model="form.direccion" type="text" placeholder="Calle, Carrera, Número" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ciudad *</label>
                <input v-model="form.ciudad" type="text" placeholder="Ciudad" required />
              </div>
              <div class="form-group">
                <label>Barrio</label>
                <input v-model="form.barrio" type="text" placeholder="Barrio (opcional)" />
              </div>
            </div>
            <div class="form-group">
              <label>Notas adicionales</label>
              <textarea v-model="form.notas" placeholder="Indicaciones especiales para la entrega..." rows="3"></textarea>
            </div>
          </div>

          <!-- Payment method -->
          <div class="form-section">
            <h3 class="section-label">Método de Pago</h3>
            <div class="payment-options">
              <label v-for="method in paymentMethods" :key="method.id" class="payment-option" :class="{ active: form.pago === method.id }">
                <input type="radio" v-model="form.pago" :value="method.id" />
                <span class="method-icon">{{ method.icon }}</span>
                <span>{{ method.label }}</span>
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div v-if="orderPlaced" class="success-message">
            <div class="success-icon">✅</div>
            <h3>¡Pedido Confirmado!</h3>
            <p>Nos pondremos en contacto contigo muy pronto. ¡Gracias por elegir Brindis Express!</p>
            <router-link to="/home" class="back-home-btn">🏠 Volver al Inicio</router-link>
          </div>

          <button v-else type="submit" class="submit-btn" :disabled="isProcessing">
            <span v-if="isProcessing" class="spinner"></span>
            <span>{{ isProcessing ? 'Procesando...' : '⚡ Confirmar Pedido' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Footer -->
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
          <a href="tel:+573023723919" class="flink">📞 +57 302 372 3919</a>
          <a href="mailto:contacto@brindisexpress.com" class="flink">✉️ contacto@brindisexpress.com</a>
          <span class="flink">📍 Calle 30, Carrera 34 #1</span>
        </div>
      </div>
      <p class="footer-copy">© 2025 Brindis Express · Todos los derechos reservados · Solo para mayores de 18 años</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isAuthenticated = ref(false)
const userName = ref('')
const isProcessing = ref(false)
const orderPlaced = ref(false)

const form = ref({
  nombre: '', telefono: '', email: '',
  direccion: '', ciudad: '', barrio: '', notas: '',
  pago: 'efectivo'
})

const paymentMethods = [
  { id: 'efectivo', icon: '💵', label: 'Efectivo al entregar' },
  { id: 'transferencia', icon: '🏦', label: 'Transferencia bancaria' },
  { id: 'nequi', icon: '📱', label: 'Nequi / Daviplata' },
]

const orderItems = ref([
  { name: 'Vodka Premium', qty: 1, price: '$85,000', img: 'https://bottleengraving.com/cdn/shop/products/belvedere-super-premium-vodka-808216.jpg?v=1689877745&width=400' },
  { name: "Buchanan's 12 Años", qty: 1, price: '$120,000', img: 'http://crownwineandspirits.com/cdn/shop/products/buchanan-s-scotch-buchanan-s-deluxe-aged-12-years-blended-scotch-whisky-750ml-31515759870045.jpg?v=1664304151' },
])

const subtotal = computed(() => {
  const total = orderItems.value.reduce((sum, item) => {
    return sum + parseInt(item.price.replace(/[$.,]/g, '')) * item.qty
  }, 0)
  return `$${total.toLocaleString('es-CO')}`
})

function checkAuthStatus() {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('user') || localStorage.getItem('usuario')
  if (token && user && user !== 'undefined') {
    try {
      const userData = JSON.parse(user)
      isAuthenticated.value = true
      userName.value = userData.nombre || userData.email || 'Usuario'
      form.value.nombre = userData.nombre || ''
      form.value.email = userData.email || ''
    } catch { isAuthenticated.value = false }
  }
}

function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  localStorage.removeItem('usuario')
  isAuthenticated.value = false
  router.push('/login')
}

async function placeOrder() {
  isProcessing.value = true
  await new Promise(r => setTimeout(r, 1800))
  isProcessing.value = false
  orderPlaced.value = true
}

onMounted(checkAuthStatus)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

.compra-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}

.background-overlay {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none; z-index: 0;
}

/* Navbar */
.navbar {
  position: sticky; top: 0; z-index: 999; height: 90px; overflow: hidden;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6);
}
.navbar::before {
  content: ''; position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  filter: brightness(0.55) saturate(1.3);
}
.navbar::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(10,7,3,0.85) 0%, rgba(10,7,3,0.5) 50%, rgba(10,7,3,0.85) 100%);
}
.navbar-content {
  position: relative; z-index: 2; height: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 3rem;
}
.brand-title {
  font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 700;
  background: linear-gradient(135deg, #FFE066, #C9A84C, #E87B2B);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-decoration: none;
}
.nav-section { display: flex; align-items: center; gap: 1.5rem; }
.nav-links { display: flex; gap: 0.5rem; }
.nav-link {
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s ease;
}
.nav-link:hover { color: #FFE066; border-color: rgba(201,168,76,0.6); transform: translateY(-1px); }
.user-menu { display: flex; align-items: center; gap: 0.6rem; }
.user-welcome {
  background: rgba(10,7,3,0.75); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 30px; padding: 0.5rem 1rem;
  color: rgba(240,220,180,0.9); font-size: 0.82rem; font-weight: 600;
}
.logout-btn {
  background: linear-gradient(135deg, #c0392b, #96281b);
  border: none; color: #fff; padding: 0.55rem 1.1rem;
  border-radius: 30px; cursor: pointer; font-size: 0.82rem; font-weight: 700;
}
.login-link {
  color: rgba(240,220,180,0.9); text-decoration: none; font-size: 0.82rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
}

/* Hero */
.purchase-hero {
  position: relative; z-index: 2;
  padding: 5rem 2rem 3rem; text-align: center;
}
.hero-icon { font-size: 3rem; margin-bottom: 1rem; }
.hero-title {
  font-family: 'Cinzel', serif; font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700; margin-bottom: 0.8rem;
  color: rgba(255,255,255,0.95);
}
.gold-text {
  background: linear-gradient(135deg, #FFE066, #C9A84C, #E87B2B);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-subtitle { color: rgba(200,175,130,0.7); font-size: 1.1rem; letter-spacing: 1px; }

/* Layout */
.purchase-layout {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 1.6fr;
  gap: 2rem; max-width: 1200px; margin: 0 auto;
  padding: 2rem 2rem 4rem;
}

@media (max-width: 900px) {
  .purchase-layout { grid-template-columns: 1fr; }
}

/* Glass cards */
.glass-card {
  background: rgba(20,14,8,0.75);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 20px; padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
}
.card-header h2 {
  font-family: 'Cinzel', serif; color: #E8C97A;
  font-size: 1.4rem; margin: 0 0 0.5rem;
}
.gold-underline {
  height: 2px; width: 60px;
  background: linear-gradient(90deg, #C9A84C, transparent);
  margin-bottom: 1.5rem;
}

/* Order summary */
.order-items { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.order-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.8rem; border-radius: 10px;
  background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.1);
}
.item-img { width: 55px; height: 55px; object-fit: cover; border-radius: 8px; }
.item-details { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.item-name { color: rgba(240,220,180,0.9); font-weight: 600; font-size: 0.95rem; }
.item-qty { color: rgba(200,175,130,0.6); font-size: 0.8rem; }
.item-price { color: #E8C97A; font-weight: 700; }

.order-totals { border-top: 1px solid rgba(201,168,76,0.15); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.total-row { display: flex; justify-content: space-between; color: rgba(240,220,180,0.75); font-size: 0.95rem; }
.total-final { font-size: 1.2rem; font-weight: 700; color: #fff; padding-top: 0.5rem; border-top: 1px solid rgba(201,168,76,0.2); }

/* Form */
.form-body { display: flex; flex-direction: column; gap: 1.5rem; }
.form-section { display: flex; flex-direction: column; gap: 0.8rem; }
.section-label {
  font-size: 0.8rem; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: #C9A84C; margin-bottom: 0.2rem;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.85rem; color: rgba(200,175,130,0.8); font-weight: 600; }
.form-group input,
.form-group textarea {
  background: rgba(10,7,3,0.6); border: 1px solid rgba(100,80,30,0.4);
  color: #fff; padding: 0.75rem 1rem; border-radius: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
  transition: border-color 0.25s;
  outline: none;
}
.form-group input:focus,
.form-group textarea:focus { border-color: #C9A84C; background: rgba(15,10,5,0.8); }
.form-group textarea { resize: vertical; }

/* Payment options */
.payment-options { display: flex; flex-direction: column; gap: 0.6rem; }
.payment-option {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.9rem 1rem; border-radius: 10px; cursor: pointer;
  border: 1px solid rgba(100,80,30,0.3);
  background: rgba(10,7,3,0.5); transition: all 0.2s;
  color: rgba(240,220,180,0.8); font-weight: 500;
}
.payment-option input { display: none; }
.payment-option:hover { border-color: rgba(201,168,76,0.4); }
.payment-option.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); color: #E8C97A; }
.method-icon { font-size: 1.2rem; }

/* Submit */
.submit-btn {
  width: 100%; padding: 1.1rem;
  background: linear-gradient(135deg, #C9A84C, #8B6914);
  color: #fff; border: none; border-radius: 10px;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: 0.3s; letter-spacing: 0.5px;
}
.submit-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.3); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Success */
.success-message {
  text-align: center; padding: 2rem;
  background: rgba(72,187,120,0.08); border: 1px solid rgba(72,187,120,0.3);
  border-radius: 14px;
}
.success-icon { font-size: 3rem; margin-bottom: 1rem; }
.success-message h3 { color: #68d391; font-size: 1.4rem; margin-bottom: 0.5rem; }
.success-message p { color: rgba(200,175,130,0.7); margin-bottom: 1.5rem; }
.back-home-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.8rem 2rem; background: linear-gradient(135deg, #C9A84C, #8B6914);
  color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;
}

/* Footer */
.footer { position: relative; z-index: 2; padding: 3rem 2rem 1.5rem; margin-top: 4rem; }
.footer-top-border { height: 1px; background: linear-gradient(90deg, transparent, #C9A84C, transparent); margin-bottom: 2rem; }
.footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.5rem; }
.footer-brand { display: flex; align-items: center; gap: 1rem; }
.fb-emblem { font-size: 2rem; }
.fb-name { font-family: 'Cinzel', serif; color: #E8C97A; font-size: 1.1rem; font-weight: 700; display: block; }
.fb-tagline { color: rgba(200,175,130,0.5); font-size: 0.8rem; margin: 0; }
.footer-links { display: flex; flex-direction: column; gap: 0.4rem; }
.flink { color: rgba(200,175,130,0.6); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
.flink:hover { color: #E8C97A; }
.footer-copy { text-align: center; color: rgba(200,175,130,0.35); font-size: 0.78rem; border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1rem; margin: 0; }
</style>
