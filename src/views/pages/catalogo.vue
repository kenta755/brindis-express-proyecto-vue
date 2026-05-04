<template>
  <div class="catalog-page" ref="catalogPage">
    <!-- Fondo animado -->
    <div class="background-overlay"></div>
    
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/home" class="brand-title">Brindis Express</router-link>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/home" class="nav-link">
              <span class="nav-icon">🏠</span>
              Inicio
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

    <!-- Header del catálogo -->
    <div class="catalog-header">
      <div class="header-content">
        <h1 class="page-title">🍾 Catálogo Premium</h1>
        <p class="page-subtitle">Descubre nuestra selección exclusiva de bebidas de alta calidad</p>
        <div class="title-underline"></div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
   <div class="filters-section" ref="filtersSection">
  <div class="filters-container">
    <!-- Primera fila: Input de búsqueda y ordenar -->
    <div class="top-filters-row">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar productos..." 
          class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="sort-dropdown">
        <select v-model="sortBy" class="sort-select">
          <option value="name">Ordenar por Nombre</option>
          <option value="price">Ordenar por Precio</option>
          <option value="category">Ordenar por Categoría</option>
        </select>
      </div>
    </div>
    
    <!-- Segunda fila: Categorías en línea horizontal -->
    <div class="filter-buttons-row">
      <div class="filter-buttons">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['filter-btn', { active: selectedCategory === category.id }]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
    
        <!-- Controles de paginación superiores -->
        <div v-if="totalPages > 1" class="pagination-controls">
          <button 
            @click="goToFirstPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Primera página"
          >
            <span>⏮️</span>
          </button>
          
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Página anterior"
          >
            <span>⬅️</span>
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="['page-number', { active: currentPage === page }]"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Página siguiente"
          >
            <span>➡️</span>
          </button>
          
          <button 
            @click="goToLastPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Última página"
          >
            <span>⏭️</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Botón "Volver arriba" -->
    <Transition name="fade">
      <button 
        v-if="showScrollToTop" 
        @click="scrollToTop" 
        class="scroll-to-top"
        title="Volver arriba"
      >
        <span>⬆️</span>
      </button>
    </Transition>

    <!-- Paginación info -->
    <div class="pagination-section">
      <div class="pagination-info">
        <span class="results-info">
          Mostrando {{ startIndex + 1 }}-{{ Math.min(startIndex + itemsPerPage, filteredProducts.length) }} 
          de {{ filteredProducts.length }} productos
        </span>
        <div class="items-per-page">
          <label for="itemsSelect">Productos por página:</label>
          <select id="itemsSelect" v-model="itemsPerPage" class="items-select">
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
            <option value="18">18</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Carrito flotante (solo para usuarios autenticados) -->
    <div v-if="isAuthenticated && cart.length > 0" class="floating-cart">
      <button @click="toggleCartModal" class="cart-toggle">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cart.length }}</span>
      </button>
    </div>

    <!-- Modal del carrito -->
    <div v-if="showCartModal" class="cart-modal-overlay" @click="closeCartModal">
      <div class="cart-modal" @click.stop>
        <div class="cart-header">
          <h3>Mi Carrito</h3>
          <button @click="closeCartModal" class="close-btn">×</button>
        </div>
        <div class="cart-items">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <img :src="item.src" :alt="item.titulo" class="cart-item-image">
            <div class="cart-item-info">
              <h4>{{ item.titulo }}</h4>
              <p>{{ item.precio }}</p>
            </div>
            <button @click="removeFromCart(index)" class="remove-item">🗑️</button>
          </div>
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            Total: {{ calculateTotal() }}
          </div>
         <button @click="openPaymentOptions" class="checkout-btn">Proceder al Pago</button>
        </div>
      </div>
    </div>

   <!-- Modal de Opciones de Pago -->
<div v-if="showPaymentModal" class="payment-modal-overlay" @click="closePaymentModal">
  <div class="payment-modal" @click.stop>
    <div class="payment-header">
      <h3>Opciones de Pago</h3>
      <button @click="closePaymentModal" class="close-btn">×</button>
    </div>
    <div class="payment-content">
      <p class="payment-intro">Selecciona tu método de pago:</p>
      <div class="payment-options">
        <button
          :class="['payment-option', { active: selectedPaymentMethod === 'tarjeta' }]"
          @click="selectPaymentMethod('tarjeta')"
        >
          <span>💳</span> Tarjeta de Crédito/Débito
        </button>
        <button
          :class="['payment-option', { active: selectedPaymentMethod === 'transferencia' }]"
          @click="selectPaymentMethod('transferencia')"
        >
          <span>🏦</span> Transferencia Bancaria
        </button>
        <button
          :class="['payment-option', { active: selectedPaymentMethod === 'efectivo' }]"
          @click="selectPaymentMethod('efectivo')"
        >
          <span>💵</span> Efectivo (Contraentrega)
        </button>
      </div>
      <p v-if="selectedPaymentMethod" class="payment-selected-info">
        Metodo seleccionado:
        <strong>
          {{
            selectedPaymentMethod === 'tarjeta'
              ? 'Tarjeta'
              : selectedPaymentMethod === 'transferencia'
              ? 'Transferencia'
              : 'Efectivo'
          }}
        </strong>
      </p>
      <div class="payment-form" v-if="selectedPaymentMethod === 'tarjeta'">
        <h4>Ingresa los datos de tu tarjeta</h4>
        <form @submit.prevent="processPayment">
          <input type="text" placeholder="Número de tarjeta" class="payment-input" autocomplete="cc-number" inputmode="numeric" maxlength="19" required>
          <input type="text" placeholder="Nombre del titular" class="payment-input" autocomplete="cc-name" required>
          <div class="expiry-cvv">
            <input type="text" placeholder="MM/AA" class="payment-input" autocomplete="cc-exp" inputmode="numeric" maxlength="5" required>
            <input type="text" placeholder="CVV" class="payment-input" autocomplete="cc-csc" inputmode="numeric" maxlength="4" required>
          </div>
          <button type="submit" class="confirm-payment-btn">Confirmar Pago</button>
        </form>
      </div>
      <div class="payment-instructions" v-if="selectedPaymentMethod === 'transferencia'">
        <h4>Instrucciones para Transferencia Bancaria</h4>
        <p>Realiza tu pago a la siguiente cuenta:</p>
        <p><strong>Banco:</strong> Banco XYZ</p>
        <p><strong>Número de Cuenta:</strong> 123456789</p>
        <p><strong>Titular:</strong> Brindis Express S.A.</p>
        <p><strong>Monto:</strong> {{ calculateTotal() }}</p>
        <button @click="confirmTransferPayment" class="confirm-payment-btn">Confirmar Transferencia</button>
      </div>
      <div class="payment-confirmation" v-if="selectedPaymentMethod === 'efectivo'">
        <h4>Pago en Efectivo</h4>
        <p>Tu pedido será procesado y podrás pagar en efectivo al recibirlo.</p>
        <button @click="confirmCashPayment" class="confirm-payment-btn">Confirmar Pedido</button>
      </div>
    </div>
  </div>
</div>

    <!-- Grid de productos -->
    <div class="products-section" ref="productsSection">
      <div class="products-container">
        <div v-if="filteredProducts.length === 0" class="no-products">
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
        
        <div v-else class="products-grid">
          <div 
            v-for="(product, index) in paginatedProducts" 
            :key="startIndex + index" 
            class="product-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-image-container">
              <div class="discount-badge" v-if="product.descuento">{{ product.descuento }}% dto</div>
              <img :src="product.src" :alt="product.alt" class="product-image" />
              <div class="image-overlay"></div>
              <div class="product-actions-overlay">
                <button class="quick-view-btn" @click="showProductDetail(product)">
                  <span>👁️</span>
                  Vista Rápida
                </button>
              </div>
            </div>
            
            <div class="product-info">
              <div class="product-category">{{ product.categoria }}</div>
              <h3 class="product-title">{{ product.titulo }}</h3>
              <p class="product-description">{{ product.descripcion }}</p>
              
              <div class="price-display">
                <span class="price-label">Precio:</span>
                <span class="price-value">{{ product.precio }}</span>
              </div>
              
              <!-- Rating -->
              <div class="product-rating">
                <div class="stars">
                  <span v-for="star in 5" :key="star" :class="['star', { filled: star <= product.rating }]">⭐</span>
                </div>
                <span class="rating-text">({{ product.reviews }} reseñas)</span>
              </div>
              
              <!-- Mostrar precio solo a usuarios autenticados -->
              <div v-if="isAuthenticated" class="product-actions">
                <div class="price-display">
                  <span v-if="product.precioOriginal" class="original-price">{{ product.precioOriginal }}</span>
                  <span class="price-value">{{ product.precio }}</span>
                </div>
                <button class="add-to-cart-btn" @click="addToCart(product)">
                  <span class="cart-icon">🛒</span>
                  <span>Agregar al Carrito</span>
                </button>
              </div>
              
              <div v-else class="login-prompt">
                <router-link to="/login" class="login-prompt-btn">
                  <span class="lock-icon">🔒</span>
                  <span>Inicia sesión para ver precios</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de paginación inferiores -->
    <div v-if="totalPages > 1" class="pagination-bottom">
      <div class="pagination-controls">
        <button 
          @click="goToFirstPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Primera página"
        >
          <span>⏮️</span>
        </button>
        
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Página anterior"
        >
          <span>⬅️</span>
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-number', { active: currentPage === page }]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Página siguiente"
        >
          <span>➡️</span>
        </button>
        
        <button 
          @click="goToLastPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Última página"
        >
          <span>⏭️</span>
        </button>
      </div>
    </div>

    <!-- Modal de detalle del producto -->
    <div v-if="selectedProduct" class="product-modal-overlay" @click="closeProductDetail">
      <div class="product-modal" @click.stop>
        <button @click="closeProductDetail" class="modal-close">×</button>
        <div class="modal-content">
          <div class="modal-image">
            <img :src="selectedProduct.src" :alt="selectedProduct.titulo">
          </div>
          <div class="modal-info">
            <div class="product-category">{{ selectedProduct.categoria }}</div>
            <h2>{{ selectedProduct.titulo }}</h2>
            <div class="product-rating">
              <div class="stars">
                <span v-for="star in 5" :key="star" :class="['star', { filled: star <= selectedProduct.rating }]">⭐</span>
              </div>
              <span class="rating-text">({{ selectedProduct.reviews }} reseñas)</span>
            </div>
            <p class="modal-description">{{ selectedProduct.descripcionLarga || selectedProduct.descripcion }}</p>
            
            <div v-if="isAuthenticated" class="modal-actions">
              <div class="modal-price">
                <span v-if="selectedProduct.precioOriginal" class="original-price">{{ selectedProduct.precioOriginal }}</span>
                <span class="current-price">{{ selectedProduct.precio }}</span>
              </div>
              <button class="modal-add-to-cart" @click="addToCart(selectedProduct)">
                <span class="cart-icon">🛒</span>
                Agregar al Carrito
              </button>
            </div>
            
            <div v-else class="modal-login-prompt">
              <router-link to="/login" class="modal-login-btn">
                <span class="lock-icon">🔒</span>
                Inicia sesión para comprar
              </router-link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
   


    

    <!-- ══════════════ FOOTER ══════════════ -->
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

<script setup >
import axios from 'axios';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/stores';

const route = useRoute();
const router = useRouter();
const store = useStore();

// ==== Estado general ====
const isAuthenticated = ref(false);
const userName = ref('');
const cart = ref([]);
const showCartModal = ref(false);
const selectedProduct = ref(null);
const showScrollToTop = ref(false);
const showPaymentModal = ref(false);
const selectedPaymentMethod = ref('');

// ==== Filtros y paginación ====
const searchQuery = ref('');
const selectedCategory = ref('Todos');
const sortBy = ref('name');
const currentPage = ref(1);
const itemsPerPage = ref(9);

// ==== Referencias DOM ====
const filtersSection = ref(null);
const productsSection = ref(null);
const catalogPage = ref(null);

// ==================== ESTRUCTURA: CATEGORÍAS CON PRODUCTOS ====================
const categoriesWithProducts = computed(() => {
  const cats = store.categories || [];
  
  return cats.map(category => {
    const categoryProducts = (store.products || []).filter(prod => 
      Number(prod.id_categoria) === Number(category.id)
    );

    return {
      id: category.id,
      nombre: category.nombre,
      descripcion: category.descripcion,
      productos: categoryProducts.map(product => {
        const precio = Number(product.precio_venta || 0);
        return {
          id: product.id,
          src: product.imagen_url || 'https://via.placeholder.com/300',
          alt: product.nombre,
          titulo: product.nombre,
          descripcion: product.descripcion || 'Producto de alta calidad',
          descripcionLarga: product.descripcion || 'Sin descripción detallada',
          precio: `$${precio.toLocaleString('es-CO')}`,
          precioOriginal: null,
          descuento: null,
          rating: 4.8,
          reviews: Math.floor(Math.random() * 200) + 50,
          categoria: category.nombre,
          categoryId: Number(product.id_categoria),
          stock: product.stock_actual
        };
      })
    };
  });
});

// ==================== PRODUCTOS BIEN MAPEADOS ====================
const products = computed(() => {
  const prods = store.products || [];
  
  return prods.map(product => {
    const categoriaObj = store.categories.find(cat => 
      Number(cat.id_categoria || cat.id) === Number(product.id_categoria)
    );

    const nombreCategoria = categoriaObj 
      ? (categoriaObj.nombre || categoriaObj.name || 'Sin categoría')
      : 'Sin categoría';

    const precio = Number(product.precio_venta || product.price || 0);

    return {
      id: product.id_producto || product.id,
      src: product.imagen_url || product.image || 'https://via.placeholder.com/300',
      alt: product.nombre || product.name,
      titulo: product.nombre || product.name,
      descripcion: product.descripcion || 'Bebida premium de alta calidad',
      descripcionLarga: product.descripcion_larga || product.descripcion || 'Sin descripción detallada',
      precio: `$${precio.toLocaleString('es-CO')}`,
      precioOriginal: null,
      descuento: null,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 200) + 50,
      categoria: nombreCategoria,
      categoryId: Number(product.id_categoria),
      stock: product.stock_actual
    };
  });
});

// ==================== CATEGORÍAS CORRECTAS ====================
const categories = computed(() => {
  const cats = store.categories || [];
  return [
    { id: 'Todos', name: 'Todos los productos' },
    ...cats.map(cat => ({
      id: Number(cat.id_categoria || cat.id),
      name: cat.nombre || cat.name || 'Sin nombre'
    }))
  ];
});

// ==================== FILTRADO CORRECTO ====================
const filteredProducts = computed(() => {
  let filtered = products.value;

  if (selectedCategory.value !== 'Todos') {
    filtered = filtered.filter(product => 
      product.categoryId === Number(selectedCategory.value)
    );
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product =>
      product.titulo.toLowerCase().includes(query) ||
      product.descripcion.toLowerCase().includes(query) ||
      product.categoria.toLowerCase().includes(query)
    );
  }

  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (sortBy.value === 'price') {
    filtered.sort((a, b) => {
      const priceA = parseInt(a.precio.replace(/[^\d]/g, ''));
      const priceB = parseInt(b.precio.replace(/[^\d]/g, ''));
      return priceA - priceB;
    });
  } else if (sortBy.value === 'category') {
    filtered.sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  return filtered;
});

// ==================== PAGINACIÓN ====================
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const paginatedProducts = computed(() => 
  filteredProducts.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...', total);

  rangeWithDots.push(1);
  rangeWithDots.push(...range);
  if (total > 1) rangeWithDots.push(total);

  return total <= 1 ? [1] : rangeWithDots;
});

// ==================== FUNCIONES AUXILIARES ====================
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('usuario');

  if (token && user && user !== "undefined") {
    try {
      const userData = JSON.parse(user);
      isAuthenticated.value = true;
      userName.value = userData.nombre || userData.email || 'Usuario';
    } catch (e) {
      logout();
    }
  } else {
    isAuthenticated.value = false;
    userName.value = '';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('usuario');
  isAuthenticated.value = false;
  userName.value = '';
  cart.value = [];
  router.push('/');
}

 async function obtenerIdCarritoActivo() {
  if (!isAuthenticated.value) return null;

  const token = localStorage.getItem('authToken');
  const usuarioStr = localStorage.getItem('usuario');
  if (!token || !usuarioStr) return null;

  try {
    const usuario = JSON.parse(usuarioStr);
    
    // Verifica qué campo tiene tu objeto usuario
    const userId = usuario.id_usuario || usuario.id || usuario.user_id;
    
    console.log('🔍 Buscando carrito activo para usuario:', userId);
    
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/carrito-compra/activo/usuario/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Carrito encontrado:', data);
    return data?.id_carrito_compra || data?.id || null;
    
  } catch (error) {
    // Si es 404, es normal (no existe carrito activo)
    if (error.response?.status === 404) {
      console.log('ℹ️ No hay carrito activo, se creará uno nuevo');
      return null;
    }
    
    console.error('❌ Error obteniendo carrito activo:', error.response?.data || error);
    return null;
  }
}

async function addToCart(product) {
  // 1. Carrito flotante local
  const existente = cart.value.find(p => p.id === product.id);
  let cantidadFinal = 1;

  if (existente) {
    existente.cantidad += 1;
    cantidadFinal = existente.cantidad;
  } else {
    cart.value.push({ ...product, cantidad: 1 });
  }

  showCartModal.value = true;

  // Si no está logueado → solo local
  if (!isAuthenticated.value) {
    alert(`¡${product.titulo} agregado al carrito!`);
    return;
  }

  // 2. Obtener o crear carrito
  let idCarritoCompra = await obtenerIdCarritoActivo();

  if (!idCarritoCompra) {
    try {
      const token = localStorage.getItem('authToken');
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      // Obtener el ID del usuario (verifica qué campo usa tu backend)
      const userId = usuario.id_usuario || usuario.id || usuario.user_id;

      console.log('🛒 Creando nuevo carrito para usuario:', userId);

      // ✅ CORRECCIÓN: Usar camelCase como espera el DTO
      const respuesta = await axios.post(
        `${import.meta.env.VITE_API_URL}/carrito-compra`,
        {
          idUsuario: userId,      // ✅ camelCase (antes era id_usuario)
          estado: 'activo',       // ✅ correcto
          subtotal: 0             // ✅ correcto
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      idCarritoCompra = respuesta.data.id_carrito_compra || respuesta.data.id;
      console.log('✅ Carrito creado con ID:', idCarritoCompra);
      
    } catch (error) {
      console.error('❌ Error creando carrito padre:', error.response?.data || error.message);
      alert('Error al iniciar el carrito. Por favor, intenta nuevamente.');
      
      // Revertir cambio local
      if (existente) {
        existente.cantidad -= 1;
        if (existente.cantidad === 0) {
          cart.value = cart.value.filter(p => p.id !== product.id);
        }
      } else {
        cart.value = cart.value.filter(p => p.id !== product.id);
      }
      return;
    }
  }

  // 3. Agregar el producto al detalle del carrito
  // 3. Agregar el producto al detalle del carrito
  try {
    const token = localStorage.getItem('authToken');
    
    const payload = {
      idCarritoCompra: idCarritoCompra,
      idProducto: product.id,
      cantidad: cantidadFinal,
      precioUnitario: parseInt(product.precio.replace(/[^\d]/g, ''), 10)
    };

    console.log('📦 Agregando producto al carrito:', payload);

    // ✅ CAMBIO: Guardar la respuesta en una variable
    const respuesta = await axios.post(
      `${import.meta.env.VITE_API_URL}/detalle-carrito`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // ✅ NUEVO: Guardar el ID del detalle para poder eliminarlo después
    if (existente) {
      existente.detalleId = respuesta.data.id_detalle_carrito || respuesta.data.id;
    } else {
      const itemEnCarrito = cart.value.find(p => p.id === product.id);
      if (itemEnCarrito) {
        itemEnCarrito.detalleId = respuesta.data.id_detalle_carrito || respuesta.data.id;
        console.log('📦 Respuesta del backend al agregar:', respuesta.data)
      }
    }

    console.log('✅ Producto agregado exitosamente');
    alert(`¡${product.titulo} agregado al carrito!`);
    
  } catch (error) {
    console.error('❌ Error agregando al detalle:', error.response?.data || error.message);
    alert('Error al guardar el producto en el carrito.');

    // Revertir el cambio local
    if (existente) {
      existente.cantidad -= 1;
      if (existente.cantidad === 0) {
        cart.value = cart.value.filter(p => p.id !== product.id);
      }
    } else {
      cart.value = cart.value.filter(p => p.id !== product.id);
    }
  }
}
// ==================== CARGAR CARRITO DESDE EL BACKEND ====================
// ==================== CARGAR CARRITO DESDE EL BACKEND ====================
async function cargarCarritoDesdeBackend() {
  if (!isAuthenticated.value) return;

  try {
    const token = localStorage.getItem('authToken');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userId = usuario.id_usuario || usuario.id || usuario.user_id;

    console.log('🔄 Cargando carrito desde el backend...');

    // 1. Obtener el carrito activo
    const idCarritoCompra = await obtenerIdCarritoActivo();
    
    if (!idCarritoCompra) {
      console.log('ℹ️ No hay carrito activo');
      cart.value = [];
      return;
    }

    // 2. Obtener los detalles del carrito
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/detalle-carrito/carrito/${idCarritoCompra}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('📦 Detalles del carrito obtenidos:', data);

    // 3. Mapear los productos al formato del carrito local
    cart.value = data.map((detalle) => {
      const producto = detalle.producto || {}; // El backend debería incluir la relación
      
      return {
        id: producto.id_producto || detalle.idProducto,
        detalleId: detalle.id_detalle_carrito || detalle.id, // Guardar para poder eliminar después
        titulo: producto.nombre || 'Producto',
        src: producto.imagen_url || 'https://via.placeholder.com/300',
        precio: `$${Number(detalle.precioUnitario || producto.precio_venta || 0).toLocaleString('es-CO')}`,
        cantidad: detalle.cantidad || 1,
        stock: producto.stock_actual || 0
      };
    });

    console.log('✅ Carrito cargado:', cart.value);

  } catch (error) {
    console.error('❌ Error cargando carrito:', error.response?.data || error);
    cart.value = [];
  }
}


async function removeFromCart(index) {
  const producto = cart.value[index]
  console.log('🗑️ Eliminando producto:', JSON.stringify(producto))
  
  if (!producto) return

  // Eliminar localmente primero
  cart.value.splice(index, 1)

  if (!isAuthenticated.value) return

  try {
    const token = localStorage.getItem('authToken')
    
    // Si tenemos detalleId directo, usarlo
    if (producto.detalleId) {
      console.log('🔑 Usando detalleId:', producto.detalleId)
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/detalle-carrito/${producto.detalleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('✅ Eliminado del backend por detalleId')
      return
    }

    // Si no hay detalleId, buscar el detalle por carritoId y productoId
    console.log('⚠️ Sin detalleId, buscando en backend...')
    const idCarrito = await obtenerIdCarritoActivo()
    
    if (!idCarrito) return

    const { data: detalles } = await axios.get(
      `${import.meta.env.VITE_API_URL}/detalle-carrito/carrito/${idCarrito}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    console.log('📋 Detalles del carrito:', detalles)
    
    const detalle = detalles.find(d => 
      (d.idProducto || d.id_producto) === producto.id
    )
    
    console.log('🔍 Detalle encontrado:', detalle)
    
    if (!detalle) {
      console.log('❌ No se encontró el detalle en el backend')
      return
    }

    const detalleId = detalle.id_detalle_carrito || detalle.id
    
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/detalle-carrito/${detalleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    console.log('✅ Eliminado del backend por búsqueda')

  } catch (error) {
    console.error('❌ Error eliminando:', error.response?.data || error)
    // Restaurar si falla
    cart.value.splice(index, 0, producto)
  }
}
function calculateTotal() {
  const total = cart.value.reduce((sum, item) => {
    return sum + parseInt(item.precio.replace(/[^\d]/g, ''));
  }, 0);
  return `$${total.toLocaleString('es-CO')}`;
}

function toggleCartModal() {
  showCartModal.value = !showCartModal.value;
}

function closeCartModal() {
  showCartModal.value = false;
}

function openPaymentOptions() {
  showCartModal.value = false;
  showPaymentModal.value = true;
  selectedPaymentMethod.value = '';
}

function closePaymentModal() {
  showPaymentModal.value = false;
  selectedPaymentMethod.value = '';
}

function selectPaymentMethod(method) {
  selectedPaymentMethod.value = method;
}

function showProductDetail(product) {
  selectedProduct.value = product;
}

function closeProductDetail() {
  selectedProduct.value = null;
}

function scrollToTop() {
  if (catalogPage.value) {
    catalogPage.value.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==================== WATCHERS: ACTUALIZACIONES EN TIEMPO REAL ====================
watch(
  () => store.categories,
  async (newCategories) => {
    if (newCategories && newCategories.length > 0) {
      console.log('📢 Categorías actualizadas en el store:', newCategories);
      selectedCategory.value = 'Todos';
      currentPage.value = 1;
    }
  },
  { deep: true }
);

watch(
  () => store.products,
  () => {
    console.log('📢 Productos actualizados en el store:', store.products);
    currentPage.value = 1;
  },
  { deep: true }
);

watch([searchQuery, selectedCategory, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(currentPage, () => nextTick(() => productsSection.value?.scrollIntoView({ behavior: 'smooth' })));

onMounted(async () => {
  checkAuthStatus();
  console.log('🚀 Catálogo montado, cargando datos del store...');
  
  await store.fetchCategories();
  await store.fetchProducts();
  
  // ✅ AGREGAR ESTA LÍNEA: Cargar carrito si está autenticado
  await cargarCarritoDesdeBackend();
  
  console.log('✅ Categorías en store:', store.categories);
  console.log('✅ Productos en store:', store.products);
  console.log('✅ Carrito cargado:', cart.value);
  
  // El scroll real del contenido vive en este contenedor (no en window).
  await nextTick();
  if (catalogPage.value) {
    catalogPage.value.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
});

onUnmounted(() => {
  catalogPage.value?.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  const el = catalogPage.value;
  const top = el ? el.scrollTop : window.scrollY;
  showScrollToTop.value = top > 400;   // aparece después de bajar 400px
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
}

*, *::before, *::after { box-sizing: border-box; }

/* ══ PÁGINA BASE ══ */
.catalog-page {
  height: 100vh;
  min-height: 100vh;
  background:
    repeating-linear-gradient(90deg,  transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    repeating-linear-gradient(0deg,   transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 215, 0, 0.45) rgba(201,168,76,0.06);
}

.catalog-page::-webkit-scrollbar {
  width: 10px;
}
.catalog-page::-webkit-scrollbar-track {
  background: rgba(201,168,76,0.06);
}
.catalog-page::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--gold-dk) 0%, var(--amber) 55%, var(--gold-lt) 100%);
  border-radius: 999px;
  border: 2px solid rgba(0,0,0,0);
  background-clip: padding-box;
}
.catalog-page::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--gold-lt) 0%, var(--amber) 55%, var(--gold-dk) 100%);
}

.background-overlay {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/><circle cx="80" cy="80" r="0.3" fill="%23ffffff" opacity="0.015"/><circle cx="40" cy="60" r="0.4" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none; z-index: 1;
}

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; transform: translateY(16px) scale(0.85); }

/* ══ NAVBAR — barra de bar + overlay dorado (= primera versión Promociones) ══ */
.navbar {
  position: sticky; top: 0; z-index: 999;
  height: 90px; overflow: hidden;
  transition: height 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6);
}

/* Imagen de bar de fondo */
.navbar::before {
  content: '';
  position: absolute; inset: 0;
  background:
    url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80')
    center/cover no-repeat;
  filter: brightness(0.55) saturate(1.3);
  z-index: 0;
}

/* Overlay dorado encima */
.navbar::after {
  content: '';
  position: absolute; inset: 0;
  background:
    linear-gradient(90deg,
      rgba(60,30,5,0.82) 0%,
      rgba(20,12,3,0.65) 30%,
      rgba(20,12,3,0.65) 70%,
      rgba(60,30,5,0.82) 100%
    ),
    linear-gradient(180deg,
      rgba(180,120,20,0.18) 0%,
      transparent 40%,
      transparent 60%,
      rgba(180,120,20,0.12) 100%
    );
  border-bottom: 1px solid rgba(201,168,76,0.35);
  border-top: 2px solid rgba(201,168,76,0.5);
  z-index: 1;
}

/* Línea dorada inferior del navbar */
.navbar-content::before {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(201,168,76,0.6) 20%,
    rgba(255,200,60,0.9) 50%,
    rgba(201,168,76,0.6) 80%,
    transparent 100%
  );
  z-index: 3;
}

.navbar-content {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1400px; margin: 0 auto;
  height: 90px; padding: 0 3.5rem; gap: 1.5rem;
}

/* Flechas decorativas laterales */
.navbar-content::after {
  display: none; /* las flechas se ponen manualmente o con pseudo en nav */
}

/* Brand */
.brand-title {
  font-family: 'Cinzel', serif !important;
  font-size: 1.55rem; font-weight: 700; letter-spacing: 4px;
  white-space: nowrap; text-decoration: none;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(201,168,76,0.5));
  transition: filter 0.3s;
  margin-right: auto;
}
.brand-title:hover { filter: drop-shadow(0 2px 20px rgba(255,220,80,0.8)); }

.nav-section { display: flex; align-items: center; gap: 1.2rem; }
.nav-links   { display: flex; gap: 0.5rem; }

/* Links — pills negros */
.nav-link {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72);
  border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,80,0.06);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: #FFE066; background: rgba(10,7,3,0.9);
  border-color: rgba(201,168,76,0.6);
  box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(201,168,76,0.2);
  transform: translateY(-1px);
}
.nav-icon { font-size: 0.85rem; }

/* Auth */
.user-menu   { display: flex; align-items: center; gap: 0.6rem; }
.user-welcome {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.75); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 30px; padding: 0.5rem 1rem; backdrop-filter: blur(8px);
  color: rgba(240,220,180,0.9); font-size: 0.82rem; font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.welcome-icon, .logout-icon, .login-icon { font-size: 0.88rem; }

.logout-btn {
  display: flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #c0392b, #96281b);
  border: none; color: #fff;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  cursor: pointer; font-size: 0.82rem; font-weight: 700;
  font-family: 'DM Sans', sans-serif; transition: all 0.25s;
  box-shadow: 0 3px 12px rgba(192,57,43,0.5);
}
.logout-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.7); }

.login-link {
  display: flex; align-items: center; gap: 0.4rem;
  color: rgba(240,220,180,0.9) !important; text-decoration: none;
  font-size: 0.82rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s;
}
.login-link:hover { color: #FFE066 !important; border-color: rgba(201,168,76,0.6); transform: translateY(-1px); }

/* ══ CATALOG HEADER ══ */
.catalog-header {
  padding: 5rem 2rem 3.5rem; text-align: center;
  position: relative; z-index: 2;
  background:
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 65%),
    radial-gradient(ellipse 50% 40% at 50% 100%, rgba(232,123,43,0.08) 0%, transparent 60%);
}
.header-content { max-width: 760px; margin: 0 auto; }

.page-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 5vw, 3.8rem); font-weight: 700; letter-spacing: 3px;
  margin-bottom: 0.8rem;
  background: linear-gradient(160deg, #E8C97A 0%, #C9A84C 40%, #E87B2B 80%, #C9A84C 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 30px rgba(201,168,76,0.35));
}
.page-subtitle {
  color: rgba(200,175,130,0.45); font-size: 1rem; font-weight: 300;
  margin-bottom: 1.5rem; font-style: italic; letter-spacing: 0.3px;
}
.title-underline {
  width: 120px; height: 3px; margin: 0 auto;
  background: linear-gradient(90deg, var(--amber), #ffb347, var(--amber));
  border-radius: 2px; box-shadow: 0 0 12px rgba(232,123,43,0.5);
}

/* ══ FILTROS ══ */
.filters-section {
  padding: 1.5rem 2rem; position: relative; z-index: 2;
  scroll-margin-top: 100px;
}
.filters-container {
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 1.2rem;
  background:
    linear-gradient(145deg, rgba(28,22,14,0.98) 0%, rgba(19,14,9,0.98) 100%);
  border: 1px solid rgba(201,168,76,0.15); border-radius: 8px;
  padding: 1.8rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}

.search-bar { position: relative; }
.search-input {
  width: 100%;
  background: rgba(201,168,76,0.05);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 30px;
  padding: 0.85rem 3rem 0.85rem 1.4rem;
  color: rgba(240,220,180,0.9); font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
  transition: all 0.25s;
}
.search-input:focus {
  outline: none; border-color: rgba(201,168,76,0.55);
  box-shadow: 0 0 18px rgba(201,168,76,0.12);
  background: rgba(201,168,76,0.08);
}
.search-input::placeholder { color: rgba(200,175,130,0.3); }
.search-icon {
  position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%);
  color: rgba(201,168,76,0.5); font-size: 1rem; pointer-events: none;
}

.sort-dropdown { display: flex; justify-content: flex-end; }
.sort-select {
  background: rgba(201,168,76,0.05);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 10px;
  padding: 0.7rem 1.1rem;
  color: rgba(240,220,180,0.85); font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem; cursor: pointer; transition: all 0.25s;
}
.sort-select:focus { outline: none; border-color: rgba(201,168,76,0.5); }
.sort-select option { background: #130F0A; color: rgba(240,220,180,0.9); }

.filter-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.filter-btn {
  background: rgba(201,168,76,0.04);
  border: 1px solid rgba(201,168,76,0.12);
  color: rgba(200,175,130,0.5);
  padding: 0.5rem 1.2rem; border-radius: 4px;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 500; letter-spacing: 0.4px;
  transition: all 0.25s ease;
}
.filter-btn:hover {
  color: var(--gold-lt); background: rgba(201,168,76,0.1);
  border-color: rgba(201,168,76,0.35);
}
.filter-btn.active {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,123,43,0.12)) !important;
  color: var(--gold-lt) !important;
  border-color: rgba(201,168,76,0.45) !important;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(201,168,76,0.12) !important;
}

/* ══ PAGINACIÓN ══ */
.pagination-section { padding: 1.2rem 2rem; max-width: 1400px; margin: 0 auto; }
.pagination-info {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(145deg, rgba(28,22,14,0.96), rgba(19,14,9,0.96));
  border: 1px solid rgba(201,168,76,0.12); border-radius: 8px;
}
.results-info  { color: rgba(200,175,130,0.45); font-size: 0.85rem; }
.items-per-page { display: flex; align-items: center; gap: 0.5rem; }
.items-per-page label { color: rgba(200,175,130,0.45); font-size: 0.82rem; }
.items-select {
  background: rgba(201,168,76,0.05);
  border: 1px solid rgba(201,168,76,0.18); border-radius: 6px;
  padding: 0.35rem 0.6rem;
  color: rgba(240,220,180,0.85); font-size: 0.82rem; cursor: pointer;
}
.items-select:focus { outline: none; border-color: rgba(201,168,76,0.45); }
.items-select option { background: #130F0A; }

.pagination-controls {
  display: flex; justify-content: center; align-items: center; gap: 0.4rem;
  margin-top: 1.5rem; padding: 1.4rem;
  background: linear-gradient(145deg, rgba(28,22,14,0.96), rgba(19,14,9,0.96));
  border: 1px solid rgba(201,168,76,0.12); border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}
.pagination-bottom { padding: 1.5rem 2rem; max-width: 1400px; margin: 0 auto; }

.pagination-btn {
  width: 42px; height: 42px; border-radius: 8px;
  background: rgba(201,168,76,0.04);
  border: 1px solid rgba(201,168,76,0.15);
  color: rgba(200,175,130,0.5); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; transition: all 0.25s ease;
}
.pagination-btn:hover:not(:disabled) {
  background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.45);
  color: var(--gold-lt); transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(201,168,76,0.15);
}
.pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.page-numbers { display: flex; gap: 0.25rem; margin: 0 0.6rem; }
.page-number {
  width: 38px; height: 38px; border-radius: 6px;
  background: rgba(201,168,76,0.04);
  border: 1px solid rgba(201,168,76,0.12);
  color: rgba(200,175,130,0.5); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif; font-size: 0.8rem; font-weight: 600;
  transition: all 0.25s ease;
}
.page-number:hover:not(:disabled) {
  background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.4);
  color: var(--gold-lt); transform: translateY(-1px);
}
.page-number.active {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,123,43,0.12));
  border-color: rgba(201,168,76,0.45); color: var(--gold-lt); font-weight: 700;
  box-shadow: 0 0 20px rgba(201,168,76,0.12);
}
.page-number:disabled { opacity: 0.3; cursor: not-allowed; }

/* ══ CARRITO FLOTANTE ══ */
.floating-cart { position: fixed; bottom: 2rem; right: 2rem; z-index: 1000; }
.cart-toggle {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(10,7,3,0.88);
  border: 1px solid rgba(201,168,76,0.4);
  display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer; transition: all 0.28s ease;
  box-shadow: 0 6px 22px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.1);
}
.cart-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(0,0,0,0.7), 0 0 24px rgba(201,168,76,0.25);
  border-color: rgba(201,168,76,0.7);
}
.cart-icon  { font-size: 1.7rem; }
.cart-count {
  position: absolute; top: -4px; right: -4px;
  background: linear-gradient(135deg, #c0392b, #96281b);
  color: #fff; border-radius: 50%; width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  box-shadow: 0 2px 8px rgba(192,57,43,0.6);
}

/* ══ MODAL CARRITO ══ */
.cart-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(5,3,1,0.9); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.cart-modal {
  background: linear-gradient(145deg, #1C1610, #130F0A);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 8px;
  max-width: 480px; width: 90%; max-height: 80vh; overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(201,168,76,0.05);
  position: relative;
}
.cart-modal::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 8px 8px 0 0;
}
.cart-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.3rem 1.8rem; border-bottom: 1px solid rgba(201,168,76,0.12);
}
.cart-header h3 {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.35rem; font-weight: 700; margin: 0;
}
.close-btn {
  background: none; border: 1px solid rgba(201,168,76,0.15);
  color: rgba(200,175,130,0.4); font-size: 1.4rem; cursor: pointer;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.close-btn:hover { color: var(--gold); border-color: rgba(201,168,76,0.45); }

.cart-items { max-height: 380px; overflow-y: auto; padding: 0.9rem; }
.cart-item {
  display: flex; align-items: center; gap: 0.9rem;
  padding: 0.9rem; background: rgba(201,168,76,0.04);
  border: 1px solid rgba(201,168,76,0.08); border-radius: 8px;
  margin-bottom: 0.5rem; transition: all 0.22s;
}
.cart-item:hover { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.18); }
.cart-item-image { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; }
.cart-item-info { flex: 1; }
.cart-item-info h4 { color: var(--gold-lt); font-size: 0.9rem; font-weight: 600; margin: 0 0 0.3rem; }
.cart-item-info p  { color: rgba(200,175,130,0.45); font-size: 0.8rem; margin: 0; }
.remove-item {
  background: rgba(192,57,43,0.2); border: 1px solid rgba(192,57,43,0.3);
  border-radius: 50%; width: 32px; height: 32px; cursor: pointer;
  font-size: 0.9rem; transition: all 0.22s;
  display: flex; align-items: center; justify-content: center;
}
.remove-item:hover { background: rgba(192,57,43,0.5); transform: scale(1.1); }

.cart-footer { padding: 1.2rem 1.8rem; border-top: 1px solid rgba(201,168,76,0.1); }
.cart-total {
  font-family: 'Cinzel', serif; color: var(--gold-lt);
  font-size: 1.2rem; font-weight: 700; text-align: center;
  margin-bottom: 0.9rem; text-shadow: 0 0 12px rgba(201,168,76,0.22);
}
.checkout-btn {
  display: block; width: 100%;
  background: transparent; border: 1px solid rgba(201,168,76,0.35); color: var(--gold);
  padding: 0.8rem; border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.8rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase; transition: all 0.25s;
}
.checkout-btn:hover {
  background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.55);
  box-shadow: 0 0 20px rgba(201,168,76,0.15);
}

/* ══ SCROLL TO TOP ══ */
.scroll-to-top {
  position: fixed; bottom: 2rem; left: 2rem; z-index: 999;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(10,7,3,0.88); border: 1px solid rgba(201,168,76,0.3);
  color: var(--gold); cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s; box-shadow: 0 4px 14px rgba(0,0,0,0.5);
}
.scroll-to-top:hover {
  border-color: rgba(201,168,76,0.65); transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201,168,76,0.2);
}

/* ══ MODAL PAGO ══ */
.payment-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(5,3,1,0.9); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; z-index: 2001;
}
.payment-modal {
  background: linear-gradient(145deg, #1C1610, #130F0A);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 8px;
  max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto;
  padding: 2rem; box-shadow: 0 40px 100px rgba(0,0,0,0.9);
  position: relative;
}
.payment-modal::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 8px 8px 0 0;
}
.payment-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.4rem; padding-bottom: 0.9rem;
  border-bottom: 1px solid rgba(201,168,76,0.12);
}
.payment-header h3 {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.3rem; font-weight: 700; margin: 0;
}
.payment-intro { color: rgba(224,197,152,0.75); margin-bottom: 1.2rem; font-size: 0.92rem; }
.payment-options { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.2rem; }
.payment-option {
  background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.14);
  border-radius: 6px; padding: 0.82rem 1rem; color: rgba(220,190,140,0.65);
  font-size: 0.88rem; cursor: pointer; transition: all 0.22s;
  display: flex; align-items: center; gap: 0.7rem; font-family: 'DM Sans', sans-serif;
}
.payment-option:hover {
  background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.35); color: var(--gold-lt);
}
.payment-option.active {
  background: rgba(201,168,76,0.15);
  border-color: rgba(201,168,76,0.6);
  color: var(--gold-lt);
  box-shadow: inset 0 0 0 1px rgba(201,168,76,0.28), 0 0 12px rgba(201,168,76,0.18);
}
.payment-selected-info {
  margin-top: -0.35rem;
  margin-bottom: 1rem;
  color: rgba(210,184,140,0.72);
  font-size: 0.84rem;
}
.payment-selected-info strong {
  color: var(--gold-lt);
}
.payment-form, .payment-instructions, .payment-confirmation {
  margin-top: 1.2rem; padding: 1.2rem;
  background: rgba(201,168,76,0.04); border-radius: 6px;
  border: 1px solid rgba(201,168,76,0.12);
}
.payment-form h4, .payment-instructions h4, .payment-confirmation h4 {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1rem; margin-bottom: 0.9rem;
}
.payment-instructions p, .payment-confirmation p {
  color: rgba(200,175,130,0.5); font-size: 0.85rem; margin-bottom: 0.5rem;
}
.payment-instructions strong { color: var(--gold-lt); }
.payment-input {
  width: 100%; padding: 0.7rem 1rem; margin-bottom: 0.8rem;
  background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.18);
  border-radius: 6px; color: rgba(240,220,180,0.9);
  font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
}
.payment-input::placeholder { color: rgba(200,175,130,0.3); }
.payment-input:focus { outline: none; border-color: rgba(201,168,76,0.45); }
.expiry-cvv { display: flex; gap: 0.8rem; }
.expiry-cvv .payment-input { flex: 1; }
.confirm-payment-btn {
  width: 100%; margin-top: 0.9rem;
  background: transparent; border: 1px solid rgba(201,168,76,0.35); color: var(--gold);
  padding: 0.78rem; border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.76rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase; transition: all 0.25s;
}
.confirm-payment-btn:hover {
  background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.55);
  box-shadow: 0 0 18px rgba(201,168,76,0.15);
}

/* ══ GRID DE PRODUCTOS ══ */
.products-section {
  padding: 2.5rem 2rem 5rem; position: relative; z-index: 2;
  scroll-margin-top: 100px;
}
.products-container { max-width: 1400px; margin: 0 auto; }

.no-products {
  text-align: center; padding: 4rem 2rem;
  background: linear-gradient(145deg, rgba(28,22,14,0.96), rgba(19,14,9,0.96));
  border: 1px solid rgba(201,168,76,0.12); border-radius: 8px;
}
.no-products h3 {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.6rem; margin-bottom: 0.6rem;
}
.no-products p { color: rgba(200,175,130,0.38); font-size: 0.9rem; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.8rem;
}

/* ── Card ── */
.product-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.98) 0%, rgba(19,14,9,0.98) 100%);
  border: 1px solid rgba(201,168,76,0.12); border-radius: 8px; overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: cardRise 0.55s ease both; opacity: 0; transform: translateY(28px);
}
@keyframes cardRise { to { opacity: 1; transform: translateY(0); } }
.product-card:nth-child(1){animation-delay:.06s} .product-card:nth-child(2){animation-delay:.14s}
.product-card:nth-child(3){animation-delay:.22s} .product-card:nth-child(4){animation-delay:.30s}
.product-card:nth-child(5){animation-delay:.38s} .product-card:nth-child(6){animation-delay:.46s}

.product-card:hover {
  transform: translateY(-10px);
  border-color: rgba(201,168,76,0.42);
  box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.1);
}

.card-image-container { position: relative; height: 250px; overflow: hidden; }
.product-image {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.23,1,0.32,1);
  filter: saturate(0.9) brightness(0.92);
}
.product-card:hover .product-image { transform: scale(1.07); filter: saturate(1.05) brightness(1); }

.image-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(13,10,7,0.1) 0%, rgba(13,10,7,0.3) 60%, rgba(13,10,7,0.92) 100%);
}

.discount-badge {
  position: absolute; top: 0.9rem; left: 0.9rem; z-index: 3;
  background: linear-gradient(135deg, rgba(232,123,43,0.9), rgba(201,100,30,0.9));
  color: rgba(255,240,220,0.95); font-family: 'Cinzel', serif;
  font-size: 0.68rem; font-weight: 800; padding: 0.26rem 0.65rem;
  border-radius: 3px; letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(232,123,43,0.4);
}

.product-actions-overlay {
  position: absolute; inset: 0;
  background: rgba(5,3,1,0.75);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all 0.3s ease;
}
.product-card:hover .product-actions-overlay { opacity: 1; }

.quick-view-btn {
  display: flex; align-items: center; gap: 0.45rem;
  background: rgba(10,7,3,0.88); border: 1px solid rgba(201,168,76,0.4);
  color: var(--gold-lt); padding: 0.72rem 1.35rem; border-radius: 30px;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 600; transition: all 0.25s;
  backdrop-filter: blur(8px);
}
.quick-view-btn:hover {
  border-color: rgba(201,168,76,0.75); background: rgba(201,168,76,0.12);
  transform: scale(1.04); box-shadow: 0 6px 18px rgba(201,168,76,0.2);
}

/* Card body */
.product-info { padding: 1.3rem 1.4rem 1.5rem; }

.product-category {
  color: rgba(200,175,130,0.32); font-size: 0.6rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.45rem;
}
.product-title {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.18rem; font-weight: 700; margin-bottom: 0.55rem; line-height: 1.25;
}
.product-description {
  color: rgba(200,175,130,0.4); font-size: 0.82rem;
  line-height: 1.65; margin-bottom: 0.9rem; font-weight: 300;
}

.product-rating { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.9rem; }
.stars { display: flex; gap: 0.12rem; }
.star { font-size: 0.82rem; filter: grayscale(100%); transition: all 0.25s; }
.star.filled { filter: grayscale(0%); text-shadow: 0 0 8px rgba(255,215,0,0.5); }
.rating-text { color: rgba(200,175,130,0.28); font-size: 0.72rem; }

.product-actions {
  border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1rem;
}
.price-display {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;
}
.original-price { color: rgba(200,175,130,0.22); font-size: 0.78rem; text-decoration: line-through; }
.price-value {
  font-family: 'Cinzel', serif; color: var(--gold-lt);
  font-size: 1.45rem; font-weight: 700;
  text-shadow: 0 0 14px rgba(201,168,76,0.2);
}

.add-to-cart-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.45rem; width: 100%;
  background: linear-gradient(135deg, rgba(201,168,76,0.16) 0%, rgba(232,123,43,0.12) 100%);
  border: 1px solid rgba(201,168,76,0.28); color: var(--gold-lt);
  padding: 0.7rem 1.2rem; border-radius: 4px;
  font-family: 'Cinzel', serif; font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer;
  transition: all 0.25s ease; box-shadow: inset 0 1px 0 rgba(201,168,76,0.1);
}
.add-to-cart-btn:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(232,123,43,0.2) 100%);
  border-color: rgba(201,168,76,0.5);
  box-shadow: 0 0 20px rgba(201,168,76,0.16); transform: translateY(-1px);
}

.login-prompt { border-top: 1px solid rgba(201,168,76,0.08); padding-top: 1rem; text-align: center; }
.login-prompt-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  color: var(--gold); text-decoration: none;
  padding: 0.62rem 1.1rem; border: 1px solid rgba(201,168,76,0.22); border-radius: 4px;
  font-size: 0.78rem; font-weight: 600; background: rgba(201,168,76,0.05); transition: all 0.25s;
}
.login-prompt-btn:hover {
  background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.42);
  transform: translateY(-1px);
}
.lock-icon { font-size: 0.82rem; }

/* ══ MODAL DETALLE PRODUCTO ══ */
.product-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(5,3,1,0.9); backdrop-filter: blur(15px);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem;
}
.product-modal {
  background: linear-gradient(145deg, #1C1610, #130F0A);
  border: 1px solid rgba(201,168,76,0.22); border-radius: 8px;
  max-width: 860px; width: 100%; max-height: 90vh; overflow-y: auto;
  position: relative; box-shadow: 0 40px 100px rgba(0,0,0,0.9);
}
.product-modal::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 8px 8px 0 0;
}
.modal-close {
  position: absolute; top: 1rem; right: 1.2rem; z-index: 2;
  background: rgba(10,7,3,0.88); border: 1px solid rgba(201,168,76,0.2);
  border-radius: 50%; width: 38px; height: 38px;
  color: rgba(200,175,130,0.4); font-size: 1.3rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.22s;
}
.modal-close:hover { color: var(--gold); border-color: rgba(201,168,76,0.5); transform: scale(1.1); }

.modal-content { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; padding: 2rem; }
.modal-image img {
  width: 100%; height: 360px; object-fit: cover;
  border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.modal-info { display: flex; flex-direction: column; justify-content: center; }
.modal-info .product-category {
  color: rgba(200,175,130,0.28); font-size: 0.62rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.5rem;
}
.modal-info h2 {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.85rem; font-weight: 700; margin-bottom: 0.9rem; line-height: 1.2;
}
.modal-info .product-rating { margin-bottom: 1.2rem; }
.modal-description {
  color: rgba(200,175,130,0.45); font-size: 0.93rem; line-height: 1.72;
  margin-bottom: 1.8rem; font-weight: 300;
}
.modal-actions { border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1.5rem; }
.modal-price { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.1rem; }
.modal-price .original-price { color: rgba(200,175,130,0.22); font-size: 1rem; text-decoration: line-through; }
.current-price {
  font-family: 'Cinzel', serif; color: var(--gold-lt);
  font-size: 1.85rem; font-weight: 700;
  text-shadow: 0 0 16px rgba(201,168,76,0.25);
}
.modal-add-to-cart {
  display: flex; align-items: center; justify-content: center; gap: 0.6rem; width: 100%;
  background: linear-gradient(135deg, rgba(201,168,76,0.16) 0%, rgba(232,123,43,0.12) 100%);
  border: 1px solid rgba(201,168,76,0.3); color: var(--gold-lt);
  padding: 0.88rem 1.8rem; border-radius: 4px;
  font-family: 'Cinzel', serif; font-size: 0.76rem; font-weight: 700;
  letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer; transition: all 0.25s;
}
.modal-add-to-cart:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(232,123,43,0.2) 100%);
  border-color: rgba(201,168,76,0.52);
  box-shadow: 0 0 20px rgba(201,168,76,0.16); transform: translateY(-1px);
}
.modal-login-prompt { border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1.6rem; text-align: center; }
.modal-login-btn {
  display: inline-flex; align-items: center; gap: 0.55rem;
  color: var(--gold); text-decoration: none;
  padding: 0.85rem 2rem; border: 1px solid rgba(201,168,76,0.28); border-radius: 4px;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.76rem;
  background: rgba(201,168,76,0.06); text-transform: uppercase; transition: all 0.25s;
}
.modal-login-btn:hover {
  background: rgba(201,168,76,0.14); border-color: rgba(201,168,76,0.46);
  transform: translateY(-2px); box-shadow: 0 8px 22px rgba(201,168,76,0.18);
}

/* ══ FOOTER ══ */
.footer {
  background: rgba(7,5,3,0.98); border-top: 1px solid rgba(201,168,76,0.1);
  padding: 3rem 2.5rem 1.5rem; position: relative; overflow: hidden;
}
.footer-top-border {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-dk), var(--gold), var(--amber), var(--gold), var(--gold-dk), transparent);
  background-size: 200%; animation: shine 4s linear infinite;
}
@keyframes shine { 0%{background-position:0%} 100%{background-position:200%} }
.footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2rem; margin-bottom: 2.5rem;
}
.footer-brand { display: flex; align-items: flex-start; gap: 1rem; }
.fb-emblem { font-size: 1.8rem; line-height: 1; }
.fb-name {
  display: block; font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(135deg, #E8C97A, #C9A84C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.3rem;
}
.fb-tagline { color: rgba(200,175,130,0.3); font-size: 0.8rem; font-weight: 300; letter-spacing: 1px; }
.footer-links { display: flex; flex-direction: column; gap: 0.55rem; }
.flink { color: rgba(200,175,130,0.4); text-decoration: none; font-size: 0.85rem; font-weight: 300; transition: color 0.2s; }
.flink:hover { color: var(--gold); }
.footer-copy {
  text-align: center; color: rgba(200,175,130,0.18); font-size: 0.75rem;
  padding-top: 1.5rem; border-top: 1px solid rgba(201,168,76,0.06); letter-spacing: 0.5px;
}

/* Scrollbar */
.cart-items::-webkit-scrollbar,
.product-modal::-webkit-scrollbar { width: 6px; }
.cart-items::-webkit-scrollbar-track,
.product-modal::-webkit-scrollbar-track { background: rgba(201,168,76,0.05); border-radius: 3px; }
.cart-items::-webkit-scrollbar-thumb,
.product-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--gold-dk), var(--amber)); border-radius: 3px;
}

/* Focus */
.search-input:focus, .sort-select:focus, .filter-btn:focus,
.cart-toggle:focus, .add-to-cart-btn:focus, .checkout-btn:focus {
  outline: 2px solid rgba(201,168,76,0.5); outline-offset: 2px;
}

html { scroll-behavior: smooth; scroll-padding-top: 100px; }

/* ══ RESPONSIVE ══ */
@media (max-width: 1100px) {
  .navbar-content { padding: 0 2rem; }
  .modal-content  { grid-template-columns: 1fr; gap: 1.8rem; }
  .modal-image img{ height: 260px; }
}
@media (max-width: 768px) {
  .navbar-content { flex-direction: column; height: auto; gap: 0.8rem; padding: 0.8rem 1.5rem; }
  .nav-links      { flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
  .nav-link       { font-size: 0.76rem; padding: 0.4rem 0.75rem; }
  .catalog-header { padding: 4rem 1.5rem 2.5rem; }
  .products-grid  { grid-template-columns: 1fr; }
  .user-menu      { width: 100%; justify-content: center; flex-wrap: wrap; }
  .footer-inner   { flex-direction: column; gap: 1.5rem; }
  .floating-cart  { bottom: 1rem; right: 1rem; }
  .pagination-info{ flex-direction: column; gap: 0.8rem; text-align: center; }
  .pagination-controls { flex-wrap: wrap; gap: 0.3rem; padding: 1rem; }
}
@media (max-width: 480px) {
  .nav-link       { font-size: 0.7rem; padding: 0.36rem 0.62rem; }
  .catalog-header { padding: 3rem 1rem 2rem; }
  .page-title     { font-size: 1.7rem; }
  .filters-container { padding: 1.2rem; }
  .product-info   { padding: 1.2rem; }
  .modal-content  { padding: 1.2rem; }
  .modal-info h2  { font-size: 1.5rem; }
  .footer         { padding: 2.5rem 1.5rem 1.5rem; }
  .floating-cart  { bottom: 0.5rem; right: 0.5rem; }
  .cart-toggle    { width: 52px; height: 52px; }
  .scroll-to-top  { bottom: 3rem; left: 0.5rem; width: 40px; height: 40px; }
}


</style>