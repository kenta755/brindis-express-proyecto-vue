<template>
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>Cargando...</p>
  </div>

  <div class="main-layout wp-layout" :class="{ 'light-mode': !isDarkMode }">
    <div class="background-overlay wp-bg-overlay"></div>

    <!-- Navbar (Top bar) -->
    <nav class="wp-topbar">
      <div class="wp-topbar-left">
        <div class="wp-home-icon">🏠</div>
        <span class="wp-site-name">Test Site</span>
        <div class="wp-new-menu"><span class="wp-menu-icon" style="margin-right: 5px;">💬</span> 0 <span class="wp-menu-icon" style="margin-left: 10px; margin-right: 5px;">➕</span> New</div>
      </div>
      <div class="wp-topbar-right">
        <button
          class="nav-link notification-bell-btn wp-notif-btn"
          @click="activeTab = 'notifications'"
          title="Notificaciones"
        >
          <span class="notification-icon">🔔</span>
          <span v-if="unreadNotifications.length" class="notification-badge animate-pulse wp-badge">
            {{ unreadNotifications.length }}
          </span>
        </button>
        
        <div v-if="isAuthenticated" class="user-menu wp-user-menu">
          <div class="user-welcome wp-user-welcome">
            <div class="user-info">
              <span class="welcome-text">Howdy, {{ userName }}</span>
            </div>
            <span class="welcome-icon wp-avatar-icon">👤</span>
          </div>
          <button @click="logout" class="logout-btn wp-logout-btn">
            Salir
          </button>
        </div>
      </div>
    </nav>

    <!-- Body Layout -->
    <div class="wp-body">
      <!-- Sidebar -->
      <aside class="wp-sidebar">
        <div class="wp-sidebar-header">
          <h1 class="brand-title wp-brand-title">Brindis Express</h1>
        </div>
        <div class="wp-sidebar-menu">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="wp-menu-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="wp-menu-icon" v-if="tab.id === 'dashboard'">📊</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'products'">🛍️</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'categories'">📋</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'orders'">📦</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'users'">👥</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'promotions'">🎉</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'tickets'">💬</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'notifications'">🔔</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'logs'">📜</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'payment-methods'">💳</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'backup'">💾</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'suppliers'">🏭</span>
            <span class="wp-menu-icon" v-else-if="tab.id === 'ideas'">💡</span>
            <span class="wp-menu-icon" v-else>📌</span>
            {{ tab.name }}
          </button>
        </div>
      </aside>

      <!-- Main Right Content -->
      <div class="wp-main">
        <div class="wp-page-header">
          <h1 class="wp-page-title" v-if="activeTab === 'dashboard'">Dashboard</h1>
          <h1 class="wp-page-title" v-else>{{ tabs.find(t => t.id === activeTab)?.name || 'Admin' }}</h1>
        </div>

        <!-- Contenedor con scroll -->
        <div class="content-scroll wp-content">
  
        <!-- Dashboard -->
        <div v-if="activeTab === 'dashboard'" id="dashboard" class="catalog-section">
          <div class="charts-section">
            <div class="chart-card">
            <h3>Ventas por Mes</h3>
            <canvas ref="salesChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Stock por Categoría</h3>
            <canvas ref="stockChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Usuarios Activos vs Inactivos</h3>
            <canvas ref="userChart"></canvas>
          </div>
        </div>
        <div class="section-header">
          <h2 class="section-title">📊 Dashboard</h2>
          <div class="live-indicator-container">
            <span class="live-dot"></span>
            <span class="live-text">SINCRONIZADO EN TIEMPO REAL</span>
          </div>
          <div class="title-underline"></div>
        </div>
        <div class="dashboard-grid">
          <div class="stat-card">
            <h3>Total Productos</h3>
            <p>{{ products.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Pedidos</h3>
            <p>{{ orders.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Ventas</h3>
            <p>{{ totalSales }}</p>
          </div>
          <div class="stat-card">
            <h3>Usuarios Activos</h3>
            <p>{{ activeUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>Pedidos Pendientes</h3>
            <p>{{ pendingOrders }}</p>
          </div>
          <div class="stat-card">
            <h3>Productos con Bajo Stock</h3>
            <p>{{ lowStockProducts }}</p>
          </div>
          <div class="stat-card">
            <h3>Tickets Abiertos</h3>
            <p>{{ openTickets }}</p>
          </div>
        </div>

        <!-- Monitor de Páginas Principales -->
        <div class="section-header" style="margin-top: 2rem;">
          <h2 class="section-title">🖥️ Monitor de Páginas Principales</h2>
          <div class="title-underline"></div>
        </div>
        <div class="page-monitor-grid">
          <!-- Monitor Home -->
          <div class="monitor-card page-home">
            <div class="monitor-header">
              <span class="page-icon">🏠</span>
              <h3>Home Page</h3>
            </div>
            <div class="monitor-body">
              <div class="monitor-stat">
                <span class="label">Carrusel:</span>
                <span class="value">{{ homeStats.carouselImages }} imágenes</span>
              </div>
              <div class="monitor-stat">
                <span class="label">Destacados:</span>
                <span class="value">{{ homeStats.featuredProducts }} productos</span>
              </div>
              <router-link to="/home" target="_blank" class="preview-btn">👁️ Previsualizar</router-link>
            </div>
          </div>

          <!-- Monitor Catálogo -->
          <div class="monitor-card page-catalog">
            <div class="monitor-header">
              <span class="page-icon">📦</span>
              <h3>Catálogo</h3>
            </div>
            <div class="monitor-body">
              <div class="monitor-stat">
                <span class="label">Categorías:</span>
                <span class="value">{{ categories.length }}</span>
              </div>
              <div class="monitor-stat">
                <span class="label">Salud Stock:</span>
                <div class="health-bar">
                  <div class="health-fill" :style="{ width: catalogStats.healthPercent + '%' }"></div>
                </div>
                <span class="value">{{ catalogStats.healthPercent }}%</span>
              </div>
              <router-link to="/catalogo" target="_blank" class="preview-btn">👁️ Previsualizar</router-link>
            </div>
          </div>

          <!-- Monitor Promociones -->
          <div class="monitor-card page-promotions">
            <div class="monitor-header">
              <span class="page-icon">🎯</span>
              <h3>Promociones</h3>
            </div>
            <div class="monitor-body">
              <div class="monitor-stat">
                <span class="label">Activas:</span>
                <span class="value badge-count">{{ activePromosCount }}</span>
              </div>
              <div class="monitor-stat">
                <span class="label">Expiran pronto:</span>
                <span class="value" :class="{ 'warning-text': true }">1 detectada</span>
              </div>
              <router-link to="/promociones" target="_blank" class="preview-btn">👁️ Previsualizar</router-link>
            </div>
          </div>

        </div>
      </div>

      <!-- Sidebar de Filtros -->
      <div v-if="activeTab === 'products'" class="filters-sidebar" :class="{ 'active': showFilters }">
        <button @click="showFilters = !showFilters" class="filters-toggle">
          🔧 Filtros
        </button>
        <div v-if="showFilters" class="filters-content">
          <h3>Filtrar Productos</h3>
          <div class="filter-group">
            <label>Rango de Precio</label>
            <input v-model="priceRange.min" type="number" placeholder="Mín">
            <input v-model="priceRange.max" type="number" placeholder="Máx">
          </div>
          <div class="filter-group">
            <label>Stock</label>
            <select v-model="stockFilter">
              <option value="">Todos</option>
              <option value="low">Bajo stock</option>
              <option value="out">Sin stock</option>
              <option value="good">Stock bueno</option>
            </select>
          </div>
          <button @click="applyFilters" class="apply-filters-btn">Aplicar Filtros</button>
          <button @click="clearFilters" class="clear-filters-btn">Limpiar</button>
        </div>
      </div>

      <!-- Gestión de Productos -->
      <div v-if="activeTab === 'products'" id="products" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🛍️ Gestión de Productos e Inventario</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="productSearchQuery" placeholder="🔍 Buscar productos por nombre..." />
          <select v-model="stockFilter">
            <option value="">Todos los stocks</option>
            <option value="low">Bajo stock (menos de 10)</option>
            <option value="out">Sin stock</option>
          </select>
          <button @click="openProductModal(null)" class="add-btn">➕ Agregar Producto</button>
          <button @click="exportProducts" class="export-btn">📥 Exportar CSV</button>
          <button @click="exportProductsPDF" class="export-btn">📥 Exportar PDF</button>
        </div>
        <div class="products-grid">
          <div class="product-card" v-for="(product, index) in filteredProducts" :key="product.id">
            <div class="card-image-container">
              <img :src="product.image" :alt="product.name" class="product-image" />
              <div class="image-overlay"></div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-description">Stock: {{ product.stock }} unidades</p>
              <p class="product-description">Categoría: {{ product.category }}</p>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="price-display admin-price">
                    <span class="price-label">Precio:</span>
                    <span class="price-value admin">{{ product.price }}</span>
                  </div>
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openProductModal(product)">
                      <span class="edit-icon">✏️</span> Editar
                    </button>
                    <button class="delete-btn" @click="deleteProduct(index)">
                      <span class="delete-icon">🗑️</span> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Categorías -->
      <div v-if="activeTab === 'categories'" id="categories" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">📋 Gestión de Categorías</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="categorySearchQuery" placeholder="🔍 Buscar categorías..." />
          <button @click="openCategoryModal(null)" class="add-btn">➕ Agregar Categoría</button>
        </div>
        <div v-if="filteredCategories.length > 0">
          <div v-for="(category, index) in filteredCategories" :key="category.id" class="category-section-wrapper">
            <div class="category-header">
              <div class="category-info-header">
                <h3 class="category-title-large">{{ category.name }}</h3>
                <p class="category-product-count">{{ getProductsByCategory(category.id).length }} productos</p>
              </div>
              <div class="category-actions-header">
                <button class="edit-product-btn" @click="openCategoryModal(category)">
                  <span class="edit-icon">✏️</span> Editar
                </button>
                <button class="delete-btn" @click="deleteCategory(index)">
                  <span class="delete-icon">🗑️</span> Eliminar
                </button>
              </div>
            </div>
            <div class="products-in-category">
              <div v-if="getProductsByCategory(category.id).length > 0" class="products-grid">
                <div class="product-card" v-for="product in getProductsByCategory(category.id)" :key="product.id">
                  <div class="card-image-container">
                    <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" />
                    <div class="image-overlay"></div>
                  </div>
                  <div class="product-info">
                    <h3 class="product-title">{{ product.name }}</h3>
                    <p class="product-description">Stock: {{ product.stock }} unidades</p>
                    <p class="product-description">Categoría: {{ product.category }}</p>
                    <div class="admin-user-view">
                      <div class="admin-controls">
                        <div class="price-display admin-price">
                          <span class="price-label">Precio:</span>
                          <span class="price-value admin">{{ product.price }}</span>
                        </div>
                        <div class="admin-actions">
                          <button class="edit-product-btn" @click="openProductModal(product)">
                            <span class="edit-icon">✏️</span> Editar
                          </button>
                          <button class="delete-btn" @click="deleteProduct(products.indexOf(product))">
                            <span class="delete-icon">🗑️</span> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-products-message">
                <p>📦 No hay productos en esta categoría</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="no-categories-message">No hay categorías registradas.</p>
      </div>

      <!-- Gestión de Pedidos -->
      <div v-if="activeTab === 'orders'" id="orders" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">📦 Gestión de Pedidos</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="orderSearchQuery" placeholder="🔍 Buscar pedidos por nombre..." />
          <select v-model="orderStatusFilter">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>
          <button @click="exportOrders" class="export-btn">📥 Exportar CSV</button>
          <button @click="exportOrdersPDF" class="export-btn">📥 Exportar PDF</button>
        </div>
        <div class="products-grid">
          <div class="product-card" v-for="(order, index) in filteredOrders" :key="order.id">
            <div class="card-image-container">
              <img :src="order.productImage" :alt="order.productName" class="order-image" loading="lazy" />
              <div class="image-overlay"></div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ order.productName }}</h3>
              <p class="product-description">Usuario: {{ order.userName }} | Estado: {{ order.status }}</p>
              <p class="product-description">Cantidad: {{ order.quantity }}</p>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="price-display admin-price">
                    <span class="price-label">Total:</span>
                    <span class="price-value admin">{{ order.total }}</span>
                  </div>
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openOrderUpdateModal(order)">
                      <span class="edit-icon">✏️</span> Actualizar Estado
                    </button>
                    <button class="view-stats-btn" @click="openOrderDetailsModal(order)">
                      <span class="stats-icon">📋</span> Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Usuarios -->
      <div v-if="activeTab === 'users'" id="users" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">👥 Gestión de Usuarios</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="userSearchQuery" placeholder="🔍 Buscar usuarios por nombre..." />
          <select v-model="userRoleFilter">
            <option value="">Todos los roles</option>
            <option value="Cliente">Cliente</option>
            <option value="Administrador">Administrador</option>
          </select>
          <button @click="openUserModal(null)" class="add-btn">➕ Agregar Usuario</button>
          <button @click="exportUsers" class="export-btn">📥 Exportar CSV</button>
          <button @click="exportUsersPDF" class="export-btn">📥 Exportar PDF</button>
        </div>
        
        <!-- Google Login Whitelist Management -->
        <div class="whitelist-section">
          <div class="whitelist-header">
            <h3 class="whitelist-title">🔐 Whitelist de Google Login</h3>
            <p class="whitelist-description">Solo los usuarios en esta lista pueden usar Google login</p>
          </div>
          <div class="whitelist-controls">
            <div class="whitelist-input-group">
              <input 
                v-model="newWhitelistEmail" 
                placeholder="📧 Email para agregar a whitelist..."
                class="whitelist-input"
                @keyup.enter="addToWhitelist"
              />
              <button @click="addToWhitelist" class="whitelist-add-btn">
                ➕ Agregar
              </button>
            </div>
            <div class="whitelist-stats">
              <span class="whitelist-count">{{ googleWhitelist.length }} usuarios en whitelist</span>
            </div>
          </div>
          <div class="whitelist-list">
            <div v-for="(email, index) in googleWhitelist" :key="index" class="whitelist-item">
              <div class="whitelist-email">
                <span class="email-icon">📧</span>
                {{ email }}
              </div>
              <div class="whitelist-actions">
                <button @click="removeFromWhitelist(email)" class="whitelist-remove-btn">
                  🗑️ Remover
                </button>
              </div>
            </div>
            <div v-if="googleWhitelist.length === 0" class="whitelist-empty">
              <span class="empty-icon">📭</span>
              <p>No hay usuarios en la whitelist</p>
            </div>
          </div>
        </div>
        <div class="users-grid">
          <div class="user-card" v-for="(user, index) in filteredUsers" :key="index" :class="{ 'user-inactive': user.status === 'Inactivo' }">
            <div class="user-status-badge" :class="{ 'status-active': user.status === 'Activo', 'status-inactive': user.status === 'Inactivo' }">
              <span class="status-icon">{{ user.status === 'Activo' ? '✅' : '🚫' }}</span>
              {{ user.status }}
            </div>
            <div class="user-info">
              <h3 class="product-title">{{ user.name }}</h3>
              <p class="product-description">Email: {{ user.email }}</p>
              <p class="product-description">Rol: {{ user.role }}</p>
              <div v-if="user.status === 'Inactivo'" class="inactive-warning">
                <span class="warning-icon">⚠️</span>
                <span>Usuario inactivo - No puede acceder al sistema</span>
              </div>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openUserModal(user)">
                      <span class="edit-icon">✏️</span> Editar
                    </button>
                    <button 
                      class="view-stats-btn" 
                      @click="toggleUserStatus(user)"
                      :class="{ 'deactivate-btn': user.status === 'Activo', 'activate-btn': user.status === 'Inactivo' }"
                    >
                      <span class="stats-icon">{{ user.status === 'Activo' ? '🔴' : '🟢' }}</span>
                      {{ user.status === 'Activo' ? 'Desactivar' : 'Activar' }}
                    </button>
                    <button class="delete-btn" @click="deleteUser(index)">
                      <span class="delete-icon">🗑️</span> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Promociones — CORREGIDO -->
      <div v-if="activeTab === 'promotions'" id="promotions" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🎉 Gestión de Promociones</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="promotionSearchQuery" placeholder="🔍 Buscar promociones..." />
          <button @click="openPromotionModal(null)" class="add-btn">➕ Agregar Promoción</button>
        </div>

        <div v-if="isLoadingPromotions" style="text-align:center; padding: 2rem; color: #FFD700;">
          Cargando promociones...
        </div>

        <div v-else class="promotions-grid">
  <div
    class="promotion-card"
    v-for="promotion in filteredPromotions"
    :key="promotion.id_promocion"
  >
    <!-- Imagen del producto asociado -->
    <div class="card-image-container">
      <img
        :src="getProductImage(promotion.id_producto)"
        :alt="promotion.nombre_promocion"
        class="product-image"
      />
      <div class="image-overlay"></div>
      <!-- Badge de descuento sobre la imagen -->
      <div class="discount-badge">{{ promotion.descuento }}% OFF</div>
    </div>

    <div class="promotion-info">
      <h3 class="promotion-title">{{ promotion.nombre_promocion }}</h3>

      <p class="promotion-description">
        📦 {{ getProductName(promotion.id_producto) }}
      </p>
      <p class="promotion-description">
        🔢 Cantidad: {{ promotion.cantidad_productos }} uds
      </p>
      <p class="promotion-description">
        📅 {{ formatDate(promotion.fecha_inicio) }} →
        {{ formatDate(promotion.fecha_fin) }}
      </p>
      <p class="promotion-description">
        Estado:
        <span :style="{ color: promotion.activo ? '#48bb78' : '#e53e3e', fontWeight: '700' }">
          {{ promotion.activo ? '✅ Activa' : '🔴 Inactiva' }}
        </span>
      </p>

      <div class="admin-actions" style="margin-top: 1rem;">
  <button class="edit-product-btn" @click="openPromotionModal(promotion)">
    <span class="edit-icon">✏️</span> Editar
  </button>
  <button class="delete-btn" @click="deletePromotion(promotion)">
    <span class="delete-icon">🗑️</span> Eliminar
  </button>
</div>
    </div>
  </div>

  <p v-if="filteredPromotions.length === 0" class="no-categories-message">
    No hay promociones registradas.
  </p>
</div>
      </div>

    <!-- Gestión de Proveedores y Marcas -->
<div v-if="activeTab === 'suppliers'" id="suppliers" class="catalog-section">
  <div class="section-header">
    <h2 class="section-title">🏭 Proveedores y Marcas</h2>
    <div class="title-underline"></div>
  </div>

  <div class="suppliers-layout">
    <!-- Panel Proveedores -->
    <div class="suppliers-panel">
      <div class="panel-header">
        <h3 class="panel-title">Proveedores</h3>
        <button class="add-btn" @click="openSupplierModal(null)">+ Nuevo Proveedor</button>
      </div>
      <div class="panel-list">
        <div
          class="panel-row"
          v-for="(supplier, index) in suppliers"
          :key="supplier.id"
        >
          <span class="panel-row-name">{{ supplier.nombre_empresa }}</span>
          <div class="panel-row-actions">
            <button class="edit-product-btn icon-btn" @click="openSupplierModal(supplier)" title="Editar">✏️</button>
            <button class="delete-btn icon-btn" @click="deleteSupplier(index)" title="Eliminar">🗑️</button>
          </div>
        </div>
        <p v-if="suppliers.length === 0" class="no-categories-message">Sin proveedores registrados.</p>
      </div>
    </div>

    <!-- Panel Marcas -->
    <div class="suppliers-panel">
      <div class="panel-header">
        <h3 class="panel-title">Marcas más importantes</h3>
        <button class="add-btn" @click="openBrandModal(null)">+ Nueva Marca</button>
      </div>
      <div class="panel-list">
        <div
          class="panel-row"
          v-for="(brand, index) in brands"
          :key="brand.id"
        >
          <span class="panel-row-name">{{ brand.name }}</span>
          <div class="panel-row-actions">
            <span class="count-badge">{{ brand.refCount }} referencias</span>
            <button class="edit-product-btn icon-btn" @click="openBrandModal(brand)" title="Editar">✏️</button>
            <button class="delete-btn icon-btn" @click="deleteBrand(index)" title="Eliminar">🗑️</button>
          </div>
        </div>
        <p v-if="brands.length === 0" class="no-categories-message">Sin marcas registradas.</p>
      </div>
    </div>
  </div>

 <!-- Modal Proveedor -->
<div v-if="showSupplierModal" class="modal-overlay">
  <div class="modal-content large-modal">
    <h2>{{ currentSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
    <form @submit.prevent="saveSupplier">
      <div class="form-group">
        <label>Nombre de la Empresa *</label>
        <input v-model="supplierForm.nombre_empresa" placeholder="Ej: Licores Mundiales S.A.S." required />
      </div>
      <div class="form-group">
        <label>Contacto</label>
        <input v-model="supplierForm.contacto" placeholder="Nombre del contacto" />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="supplierForm.telefono" placeholder="Ej: 3001234567" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="supplierForm.email" type="email" placeholder="contacto@empresa.com" />
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input v-model="supplierForm.direccion" placeholder="Dirección completa" />
      </div>
      <div class="form-group">
        <label>País</label>
        <input v-model="supplierForm.pais" placeholder="Ej: Colombia" />
      </div>
      <div class="form-group">
        <label>RUC / NIT</label>
        <input v-model="supplierForm.ruc_nit" placeholder="Ej: 900123456-1" />
      </div>
      <div class="form-group checkbox-group">
        <label>
          <input v-model="supplierForm.activo" type="checkbox" />
          Proveedor Activo
        </label>
      </div>
      <div class="modal-actions">
        <button type="submit" class="save-btn">💾 Guardar</button>
        <button type="button" @click="closeSupplierModal" class="cancel-btn">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>

  <!-- Modal Marca -->
  <div v-if="showBrandModal" class="modal-overlay">
    <div class="modal-content large-modal">
      <h2>{{ currentBrand ? 'Editar Marca' : 'Nueva Marca' }}</h2>
      <form @submit.prevent="saveBrand">
        <div class="form-group">
          <label>Nombre de la Marca *</label>
          <input v-model="brandForm.name" placeholder="Ej: Johnnie Walker" required />
        </div>
        <div class="form-group">
          <label>Referencias</label>
          <input v-model.number="brandForm.refCount" type="number" min="0" placeholder="0" />
        </div>
        <div class="modal-actions">
          <button type="submit" class="save-btn">💾 Guardar</button>
          <button type="button" @click="closeBrandModal" class="cancel-btn">❌ Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</div>





      <!-- Notificaciones -->
      <div v-if="activeTab === 'notifications'" id="notifications" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🔔 Centro de Notificaciones</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="notificationSearchQuery" placeholder="🔍 Buscar notificaciones..." />
          <select v-model="notificationFilter">
            <option value="">Todas</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </select>
          <button @click="markAllAsRead" class="add-btn">✅ Marcar todas como leídas</button>
          <button @click="clearAllNotifications" class="delete-btn">🗑️ Eliminar todas</button>
        </div>
        <div class="notifications-grid">
          <div
            class="notification-card"
            v-for="(notification, index) in filteredNotifications"
            :key="notification.id"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-info">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <p class="notification-date">{{ formatDate(notification.timestamp) }}</p>
              <div class="notification-actions">
                <button v-if="!notification.read" @click="markAsRead(index)" class="mark-read-btn">
                  ✅ Marcar como leída
                </button>
                <button @click="deleteNotification(index)" class="delete-notification-btn">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tickets -->
      <div v-if="activeTab === 'tickets'" id="tickets" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💬 Soporte al Cliente</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="ticketSearchQuery" placeholder="🔍 Buscar tickets..." />
          <select v-model="ticketStatusFilter">
            <option value="">Todos los estados</option>
            <option value="Abierto">Abierto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
        <div class="tickets-grid">
          <div class="ticket-card" v-for="(ticket, index) in filteredTickets" :key="index">
            <h3 class="ticket-title">{{ ticket.subject }}</h3>
            <p class="ticket-description">Usuario: {{ ticket.userName }} | Estado: {{ ticket.status }}</p>
            <p class="ticket-description">Fecha: {{ formatDate(ticket.createdAt) }}</p>
            <div class="ticket-actions">
              <button class="view-stats-btn" @click="openTicketChat(ticket)">
                <span class="stats-icon">💬</span> Ver Chat
              </button>
              <button
                :class="['status-btn', { 'open': ticket.status === 'Abierto' }]"
                @click="toggleTicketStatus(ticket)"
              >
                {{ ticket.status === 'Abierto' ? 'Cerrar' : 'Abrir' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div v-if="activeTab === 'logs'" id="logs" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">📜 Logs de Actividad</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="logSearchQuery" placeholder="🔍 Buscar logs..." />
          <select v-model="logFilter">
            <option value="">Todos</option>
            <option value="login">Inicios de Sesión</option>
            <option value="edit">Ediciones</option>
            <option value="delete">Eliminaciones</option>
          </select>
        </div>
        <div class="logs-grid">
          <div
            class="log-card"
            v-for="(log, index) in filteredLogs"
            :key="index"
            :class="{ 'critical': log.type === 'delete' }"
          >
            <p class="log-message">{{ log.message }}</p>
            <p class="log-date">{{ formatDate(log.timestamp) }} | {{ log.user }}</p>
          </div>
        </div>
      </div>

      <!-- Métodos de Pago -->
      <div v-if="activeTab === 'payment-methods'" id="payment-methods" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💳 Métodos de Pago</h2>
          <div class="title-underline"></div>
        </div>
        <div class="payment-form">
          <div class="form-group">
            <label>Stripe API Key</label>
            <input v-model="paymentConfig.stripeKey" type="password" placeholder="Clave API Stripe" />
          </div>
          <div class="form-group">
            <label>PayPal Client ID</label>
            <input v-model="paymentConfig.paypalId" type="password" placeholder="ID Cliente PayPal" />
          </div>
          <button @click="savePaymentConfig" class="save-btn">Guardar Configuración</button>
        </div>
      </div>

      <!-- Backup -->
      <div v-if="activeTab === 'backup'" id="backup" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💾 Backup y Restore</h2>
          <div class="title-underline"></div>
        </div>
        <div class="backup-actions">
          <button @click="exportBackup" class="export-btn">📥 Exportar Backup</button>
          <input type="file" ref="backupFile" @change="importBackup" accept=".json" />
          <button @click="$refs.backupFile.click()" class="add-btn">📤 Importar Backup</button>
          <div v-if="backupProgress" class="progress-bar">
            <div :style="{ width: backupProgress + '%' }" class="progress"></div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════ MODALES ═══════════════════════════════════════ -->

      <!-- Modal Productos -->
      <div v-if="showProductModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentProduct ? 'Editar Producto' : 'Agregar Producto' }}</h2>
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label for="nombre">Nombre del Producto *</label>
              <input id="nombre" v-model="productForm.nombre" placeholder="Nombre del producto" maxlength="100" required />
            </div>
            <div class="form-group">
              <label for="marca">Marca</label>
              <input id="marca" v-model="productForm.marca" placeholder="Marca del producto (opcional)" />
            </div>
            <div class="form-group">
              <label for="precio_venta">Precio de Venta *</label>
              <input id="precio_venta" v-model.number="productForm.precio_venta" type="number" step="0.01" min="0.01" placeholder="Ej: 85000" required />
            </div>
            <div class="form-group">
              <label for="precio_compra">Precio de Compra *</label>
              <input id="precio_compra" v-model.number="productForm.precio_compra" type="number" step="0.01" min="0.01" placeholder="Ej: 60000" required />
            </div>
            <div class="form-group">
              <label for="stock_minimo">Stock Mínimo *</label>
              <input id="stock_minimo" v-model.number="productForm.stock_minimo" type="number" min="0" placeholder="Ej: 10" required />
            </div>
            <div class="form-group">
              <label for="stock_actual">Stock Actual *</label>
              <input id="stock_actual" v-model.number="productForm.stock_actual" type="number" min="0" placeholder="Stock actual" required />
            </div>
            <div class="form-group">
              <label for="imagen_url">URL de la Imagen</label>
              <input id="imagen_url" v-model="productForm.imagen_url" type="url" maxlength="255" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            <div class="form-group">
              <label for="codigo_barras">Código de Barras</label>
              <input id="codigo_barras" v-model="productForm.codigo_barras" placeholder="Código de barras (opcional)" />
            </div>
            <div class="form-group checkbox-group">
              <label for="activo">
                <input id="activo" v-model="productForm.activo" type="checkbox" />
                Producto Activo
              </label>
            </div>
           <div class="form-group">
     <label for="id_categoria">ID de Categoría *</label>
      <input id="id_categoria" v-model.number="productForm.id_categoria" type="number" placeholder="ID de la categoría" required />
     </div>
     <div class="form-group">
  <label for="id_proveedor">Proveedor</label>
  <select id="id_proveedor" v-model="productForm.id_proveedor">
       <option :value="null">-- Sin proveedor --</option>
       <option v-for="supplier in suppliers" :key="supplier.id_proveedor" :value="supplier.id_proveedor">
           {{ supplier.nombre_empresa }}
         </option>
        </select>
         </div>
            <div class="modal-actions">
              <button type="submit" class="save-btn">💾 Guardar</button>
              <button type="button" @click="closeProductModal" class="cancel-btn">❌ Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Categorías -->
      <div v-if="showCategoryModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentCategory ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label for="cat_nombre">Nombre de la Categoría *</label>
              <input id="cat_nombre" v-model="categoryForm.nombre" placeholder="Nombre de la categoría" maxlength="100" required />
            </div>
            <div class="form-group">
              <label for="cat_descripcion">Descripción</label>
              <textarea id="cat_descripcion" v-model="categoryForm.descripcion" placeholder="Descripción (opcional)" rows="4"></textarea>
            </div>
            <div class="form-group checkbox-group">
              <label for="cat_activo">
                <input id="cat_activo" v-model="categoryForm.activo" type="checkbox" />
                Categoría Activa
              </label>
            </div>
            <div class="modal-actions">
              <button type="submit" class="save-btn">💾 Guardar</button>
              <button type="button" @click="closeCategoryModal" class="cancel-btn">❌ Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Usuarios -->
      <div v-if="showUserModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentUser ? 'Editar Usuario' : 'Agregar Usuario' }}</h2>
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="userForm.name" placeholder="Nombre" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="userForm.email" placeholder="Email" type="email" required />
            </div>
            <div class="form-group">
              <label>Rol</label>
              <select v-model="userForm.role" required>
                <option value="Cliente">Cliente</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="userForm.status" required>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="save-btn">💾 Guardar</button>
              <button type="button" @click="closeUserModal" class="cancel-btn">❌ Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Promociones — CORREGIDO -->
      <div v-if="showPromotionModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentPromotion ? 'Editar Promoción' : 'Agregar Promoción' }}</h2>
          <form @submit.prevent="savePromotion">

            <div class="form-group">
              <label for="promo_nombre">Nombre de la Promoción *</label>
              <input
                id="promo_nombre"
                v-model="promotionForm.nombre_promocion"
                type="text"
                maxlength="150"
                placeholder="Ej: Oferta Navideña 2025"
                required
              />
            </div>

            <div class="form-group">
              <label for="promo_descuento">Descuento (%) *</label>
              <input
                id="promo_descuento"
                v-model.number="promotionForm.descuento"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                placeholder="Ej: 15.50"
                required
              />
            </div>

            <div class="form-group">
              <label for="promo_producto">Producto Asociado *</label>
              <select id="promo_producto" v-model="promotionForm.id_producto" required>
                <option :value="null" disabled>-- Selecciona un producto --</option>
                <option v-for="prod in products" :key="prod.id" :value="prod.id">
                  {{ prod.name }} — {{ prod.price }} (Stock: {{ prod.stock }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="promo_inicio">Fecha de Inicio *</label>
              <input id="promo_inicio" v-model="promotionForm.fecha_inicio" type="date" required />
            </div>

            <div class="form-group">
              <label for="promo_fin">Fecha de Fin *</label>
              <input id="promo_fin" v-model="promotionForm.fecha_fin" type="date" required />
            </div>

            <div class="form-group">
              <label for="promo_cantidad">Cantidad de Productos *</label>
              <input
                id="promo_cantidad"
                v-model.number="promotionForm.cantidad_productos"
                type="number"
                min="1"
                placeholder="Ej: 10"
                required
              />
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input v-model="promotionForm.activo" type="checkbox" />
                Promoción Activa
              </label>
            </div>

            <div class="modal-actions">
              <button type="submit" class="save-btn">
                {{ currentPromotion ? '💾 Actualizar' : '🎉 Crear' }}
              </button>
              <button type="button" @click="closePromotionModal" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Detalles Pedido -->
      <div v-if="showOrderDetailsModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Detalles del Pedido</h2>
          <div class="order-details">
            <img :src="currentOrderForDetails.productImage" :alt="currentOrderForDetails.productName" class="detail-image" />
            <p><strong>Producto:</strong> {{ currentOrderForDetails.productName }}</p>
            <p><strong>Usuario:</strong> {{ currentOrderForDetails.userName }}</p>
            <p><strong>Estado:</strong> {{ currentOrderForDetails.status }}</p>
            <p><strong>Cantidad:</strong> {{ currentOrderForDetails.quantity }}</p>
            <p><strong>Total:</strong> {{ currentOrderForDetails.total }}</p>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeOrderDetailsModal" class="cancel-btn">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Modal Actualizar Estado Pedido -->
      <div v-if="showOrderUpdateModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Actualizar Estado del Pedido</h2>
          <form @submit.prevent="saveOrderStatus">
            <p><strong>Producto:</strong> {{ orderForm.productName }}</p>
            <p><strong>Estado Actual:</strong> {{ orderForm.status }}</p>
            <div class="form-group">
              <label>Nuevo Estado</label>
              <select v-model="orderForm.newStatus" required>
                <option value="Pendiente">Pendiente</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="save-btn">💾 Guardar</button>
              <button type="button" @click="closeOrderUpdateModal" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Chat Ticket -->
      <div v-if="showTicketChatModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Chat del Ticket: {{ currentTicket.subject }}</h2>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <div
                v-for="(message, index) in currentTicket.messages"
                :key="index"
                :class="['chat-message', { 'sent': message.sentBy === userName }]"
              >
                <p>{{ message.text }}</p>
                <span class="message-time">{{ formatDate(message.timestamp) }}</span>
              </div>
            </div>
            <div class="chat-input">
              <input v-model="newMessage" placeholder="Escribe un mensaje..." @keyup.enter="sendMessage" />
              <button @click="sendMessage" class="send-btn">Enviar</button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeTicketChatModal" class="cancel-btn">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content delete-modal">
          <div class="delete-modal-header">
            <span class="delete-icon">⚠️</span>
            <h2>{{ deleteModalData.title }}</h2>
          </div>
          <div class="delete-modal-body">
            <p class="delete-message">{{ deleteModalData.message }}</p>
            <div v-if="deleteModalData.item" class="delete-item-preview">
              <div class="preview-info">
                <span class="preview-label">Item a eliminar:</span>
                <span class="preview-name">{{ getItemName() }}</span>
              </div>
            </div>
            <div class="delete-warning">
              <p>⚠️ Esta acción no se puede deshacer</p>
            </div>
          </div>
          <div class="delete-modal-actions">
            <button @click="confirmDelete" class="delete-confirm-btn">
              <span class="btn-icon">🗑️</span>
              Sí, Eliminar
            </button>
            <button @click="closeDeleteModal" class="delete-cancel-btn">
              <span class="btn-icon">❌</span>
              Cancelar
            </button>
          </div>
        </div>
      </div>

 
          <!-- Menú de Ideas (Showroom) -->
          <div v-if="activeTab === 'ideas'" id="ideas-menu" class="catalog-section showroom-integration">
            <div class="section-header">
              <h2 class="section-title">💡 Menú de Ideas (Vista Showroom)</h2>
              <div class="title-underline"></div>
            </div>
            <div class="showroom-container-admin">
              <MenuVirtual />
            </div>
          </div>

        </div><!-- /content-scroll -->
      </div><!-- /wp-main -->
    </div><!-- /wp-body -->
    <div v-if="toast.show" :class="['wp-toast', toast.type]">
      {{ toast.message }}
    </div>
  </div><!-- /main-layout -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import MenuVirtual from './menuvirtual.vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { useStore } from '@/stores';
import { websocketService } from '@/services/websocket';
Chart.register(...registerables);

const activeTab = ref('dashboard');
const tabs = ref([
  { id: 'dashboard',        name: 'Dashboard' },
  { id: 'products',         name: 'Productos' },
  { id: 'categories',       name: 'Categorías' },
  { id: 'orders',           name: 'Pedidos' },
  { id: 'users',            name: 'Usuarios' },
  { id: 'promotions',       name: 'Promociones' },
  { id: 'tickets',          name: 'Tickets' },
  { id: 'logs',             name: 'Logs' },
  { id: 'payment-methods',  name: 'Métodos de Pago' },
  { id: 'backup',           name: 'Backup' },
  { id: 'suppliers', name: 'Proveedores' },
  { id: 'notifications',    name: 'Notificaciones' },
  { id: 'ideas',            name: 'Ideas Menu' },
]);

const showFilters    = ref(false);
const priceRange     = ref({ min: 0, max: 1000000 });
const isLoading      = ref(false);
const isDarkMode     = ref(true);
const backupProgress = ref(0);
const store          = useStore();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8222/api';

const orders = ref([]);
const users = ref([]);
const products = ref([
  { id: 1, name: 'Vodka Premium',      image: 'https://bottleengraving.com/cdn/shop/products/belvedere-super-premium-vodka-808216.jpg?v=1689877745&width=1000', price: '$85,000',  description: 'Vodka de alta calidad importado.',           stock: 50, category: 'Licores',   id_categoria: 1 },
  { id: 2, name: 'Dom Pérignon',        image: 'https://merchantofwine.com/cdn/shop/files/Dom-Perignon-Brut-Champagne-France-2013.jpg?v=1757424322',             price: '$450,000', description: 'Champagne premium para ocasiones especiales.', stock: 20, category: 'Champagne', id_categoria: 2 },
  { id: 3, name: "Buchanan's 12 Años",  image: 'http://crownwineandspirits.com/cdn/shop/products/buchanan-s-scotch-buchanan-s-deluxe-aged-12-years-blended-scotch-whisky-750ml-31515759870045.jpg?v=1664304151', price: '$120,000', description: 'Whisky escocés añejado 12 años.', stock: 5, category: 'Whisky', id_categoria: 3 },
]);
const categories = ref([
  { id: 1, name: 'Licores',   productCount: 1 },
  { id: 2, name: 'Champagne', productCount: 1 },
  { id: 3, name: 'Whisky',    productCount: 1 },
]);
const notifications = ref([]);
const unreadNotifications = computed(() => notifications.value.filter(n => !n.read));

const tickets = ref([
  { subject:'Problema con pedido', userName:'Juan Pérez', status:'Abierto', createdAt: new Date(),
    messages:[{ text:'No recibí mi pedido', timestamp: new Date(), sentBy:'Juan Pérez' }] }
]);



// Toast state
const toast = ref({ show: false, message: '', type: 'info' });
function showToast(message, type = 'info') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}



function applyFilters() { showToast('Filtros aplicados', 'info'); }
function clearFilters() {
  priceRange.value  = { min: 0, max: 1000000 };
  stockFilter.value = '';
  showToast('Filtros limpiados', 'info');
}

onMounted(() => {
  checkAuthStatus();
  loadOrders();
  // loadUsers(); // If you have it
  // fetchProducts/Categories from store if needed
  setTimeout(initCharts, 500);
});



// ─── CHARTS ──────────────────────────────────────────────────
const salesChart = ref(null);
const stockChart = ref(null);
const userChart  = ref(null);

let salesChartInstance = null;
let stockChartInstance = null;
let userChartInstance  = null;

function initCharts() {
  if (!salesChart.value || !stockChart.value || !userChart.value) return;

  if (salesChartInstance) salesChartInstance.destroy();
  if (stockChartInstance) stockChartInstance.destroy();
  if (userChartInstance)  userChartInstance.destroy();

  const last6Months = [];
  const salesData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(d.toLocaleString('es-CO', { month: 'short' }));
    
    const monthlyTotal = orders.value.filter(o => {
      const orderDate = new Date(); 
      return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
    }).length; 
    salesData.push(monthlyTotal);
  }

  salesChartInstance = new Chart(salesChart.value, {
    type: 'line',
    data: {
      labels: last6Months,
      datasets: [{
        label: 'Número de Pedidos',
        data: salesData,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e0e0e0' } } },
      scales: {
        y: { ticks: { color: '#e0e0e0' } },
        x: { ticks: { color: '#e0e0e0' } }
      }
    }
  });

  stockChartInstance = new Chart(stockChart.value, {
    type: 'doughnut',
    data: {
      labels: categories.value.map(c => c.name),
      datasets: [{
        data: categories.value.map(c => c.productCount),
        backgroundColor: ['#FFD700', '#FF4500', '#8B4513', '#48bb78', '#3182ce', '#805ad5']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e0e0e0' } } }
    }
  });

  userChartInstance = new Chart(userChart.value, {
    type: 'pie',
    data: {
      labels: ['Activos', 'Inactivos'],
      datasets: [{
        data: [activeUsers.value, users.value.length - activeUsers.value],
        backgroundColor: ['#48bb78', '#e53e3e']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e0e0e0' } } }
    }
  });
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
}

// ─── AUTH ─────────────────────────────────────────────────────
const isAuthenticated = ref(false);
const userName        = ref('');
const router          = useRouter();

function checkAuthStatus() {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser  = localStorage.getItem('adminUser');
  if (adminToken && adminUser) {
    isAuthenticated.value = true;
    const userData = JSON.parse(adminUser);
    userName.value = userData.name || userData.email || 'Administrador';
  } else {
    router.push('/login');
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  isAuthenticated.value = false;
  userName.value = '';
  router.push('/login');
}

// ─── PRODUCTOS ────────────────────────────────────────────────
// (Variables movidas al inicio)


const productSearchQuery = ref('');
const stockFilter        = ref('');

const filteredProducts = computed(() => {
  let filtered = products.value.filter(p =>
    p.name.toLowerCase().includes(productSearchQuery.value.toLowerCase())
  );
  if (stockFilter.value === 'low')  filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
  else if (stockFilter.value === 'out') filtered = filtered.filter(p => p.stock === 0);
  return filtered;
});

const showProductModal = ref(false);
const currentProduct   = ref(null);

// Delete confirmation modal state
const showDeleteModal = ref(false);
const deleteModalData = ref({
  type: '', // 'product', 'category', 'user', 'promotion'
  item: null,
  index: null,
  title: '',
  message: ''
});
const productForm      = ref({
  nombre: '', marca: '', precio_venta: 0, precio_compra: 0,
  stock_minimo: 0, stock_actual: 0, imagen_url: '',
  codigo_barras: '', activo: true, id_categoria: null,
  id_proveedor: null  // ← agrega esto
});

function openProductModal(product) {
  if (product) {
    currentProduct.value = product;
    productForm.value = {
      nombre:        product.name          || '',
      marca:         product.brand         || '',
      precio_venta:  product.price ? parseFloat(product.price.replace(/[^0-9.-]+/g, '')) : 0,
      precio_compra: product.precio_compra ? parseFloat(product.precio_compra) : 0,
      stock_minimo:  product.stock_minimo  || 10,
      stock_actual:  product.stock         || 0,
      imagen_url:    product.image         || '',
      codigo_barras: product.codigo_barras || '',
      activo:        product.activo !== undefined ? product.activo : true,
      id_categoria:  product.id_categoria  || null,
      id_proveedor:  product.id_proveedor  || null  // ← agrega esto
    };
  } else {
    currentProduct.value = null;
    productForm.value = {
      nombre: '', marca: '', precio_venta: 0, precio_compra: 0,
      stock_minimo: 10, stock_actual: 0, imagen_url: '',
      codigo_barras: '', activo: true, id_categoria: null
    };
  }
  showProductModal.value = true;
}
function closeProductModal() { showProductModal.value = false; }

async function saveProduct() {
  try {
    isLoading.value = true;
    if (currentProduct.value) {
      Object.assign(currentProduct.value, {
        name:         productForm.value.nombre,
        brand:        productForm.value.marca,
        price:        `$${productForm.value.precio_venta.toLocaleString('es-CO')}`,
        stock:        productForm.value.stock_actual,
        image:        productForm.value.imagen_url,
        codigo_barras: productForm.value.codigo_barras,
        activo:       productForm.value.activo,
        id_categoria: productForm.value.id_categoria
      });
      pushNotification('Producto actualizado', `El producto ${productForm.value.nombre} fue actualizado.`);
      showToast('Producto actualizado', 'success');
    } else {
      const productData = {
        nombre:       productForm.value.nombre,
        marca:        productForm.value.marca,
        precio_venta: productForm.value.precio_venta,
        precio_compra: productForm.value.precio_compra,
        stock_minimo: productForm.value.stock_minimo,
        stock_actual: productForm.value.stock_actual,
        imagen_url:   productForm.value.imagen_url,
        codigo_barras: productForm.value.codigo_barras,
        activo:       productForm.value.activo,
        id_categoria: productForm.value.id_categoria,
        ...(productForm.value.id_proveedor && { id_proveedor: Number(productForm.value.id_proveedor) }),
      };
      const response = await fetch(`${API_URL}/productos/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(productData)
      });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.message || 'Error al crear el producto');
      }
      const result = await response.json();
      store.addProduct({ id_producto: result.id_producto, ...productData });
      products.value.push({
        id:           result.id_producto,
        name:         productForm.value.nombre,
        brand:        productForm.value.marca,
        image:        productForm.value.imagen_url,
        price:        `$${productForm.value.precio_venta.toLocaleString('es-CO')}`,
        stock:        productForm.value.stock_actual,
        stock_minimo: productForm.value.stock_minimo,
        codigo_barras: productForm.value.codigo_barras,
        activo:       productForm.value.activo,
        id_categoria: productForm.value.id_categoria,
        category:     getCategoryNameById(productForm.value.id_categoria)
      });
      const cat = categories.value.find(c => c.id === productForm.value.id_categoria);
      if (cat) cat.productCount++;
      pushNotification('Producto creado', `Se añadió: ${productForm.value.nombre}`);
      showToast('Producto creado exitosamente', 'success');
    }
    checkLowStock();
    closeProductModal();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Error al guardar el producto', 'error');
    pushNotification('Error al crear producto', error.message || 'No se pudo crear el producto');
  } finally {
    isLoading.value = false;
  }
}

// Local status tracking to preserve changes during data reloads (persisted in localStorage)
const localUserStatusChanges = ref(new Map(JSON.parse(localStorage.getItem('localUserStatusChanges') || '[]')));

// Google login whitelist management
const googleWhitelist = ref(JSON.parse(localStorage.getItem('googleWhitelist') || '[]'));
const newWhitelistEmail = ref('');

// Save whitelist to localStorage whenever it's updated
watch(googleWhitelist, (newWhitelist) => {
  localStorage.setItem('googleWhitelist', JSON.stringify(newWhitelist));
}, { deep: true });

// Save changes to localStorage whenever they're updated
watch(localUserStatusChanges, (newChanges) => {
  localStorage.setItem('localUserStatusChanges', JSON.stringify(Array.from(newChanges.entries())));
}, { deep: true });

// Helper functions for managing local status tracking
function clearLocalStatusTracking(userId = null) {
  if (userId) {
    localUserStatusChanges.value.delete(userId);
  } else {
    localUserStatusChanges.value.clear();
  }
  localStorage.setItem('localUserStatusChanges', JSON.stringify(Array.from(localUserStatusChanges.value.entries())));
  console.log('🗑️ Local status tracking cleared:', { userId, remaining: localUserStatusChanges.value.size });
}

function getLocalStatus(userId) {
  return localUserStatusChanges.value.get(userId);
}

function hasLocalChanges() {
  return localUserStatusChanges.value.size > 0;
}

// Whitelist management functions
function addToWhitelist() {
  const email = newWhitelistEmail.value.toLowerCase().trim();
  if (email && !googleWhitelist.value.includes(email)) {
    googleWhitelist.value.push(email);
    newWhitelistEmail.value = '';
    pushNotification('Usuario agregado a whitelist', `${email} ahora puede usar Google login.`);
    showToast('Usuario agregado exitosamente', 'success');
  } else if (googleWhitelist.value.includes(email)) {
    showToast('Este usuario ya está en la whitelist', 'warning');
  }
}

function removeFromWhitelist(email) {
  const index = googleWhitelist.value.indexOf(email);
  if (index > -1) {
    googleWhitelist.value.splice(index, 1);
    pushNotification('Usuario removido de whitelist', `${email} ya no puede usar Google login.`);
    showToast('Usuario removido exitosamente', 'success');
  }
}

function isUserInWhitelist(userEmail) {
  return googleWhitelist.value.includes(userEmail.toLowerCase().trim());
}

// Delete Confirmation Modal Functions
function openDeleteModal(type, item, index = null) {
  deleteModalData.value = {
    type,
    item,
    index,
    title: getDeleteTitle(type),
    message: getDeleteMessage(type, item)
  };
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteModalData.value = {
    type: '',
    item: null,
    index: null,
    title: '',
    message: ''
  };
}

function getItemName() {
  const { type, item } = deleteModalData.value;
  if (!item) return '';
  
  switch (type) {
    case 'product':
      return item.name || item.nombre || 'Producto';
    case 'category':
      return item.name || item.nombre || 'Categoría';
    case 'user':
      return item.name || item.nombre || 'Usuario';
    case 'promotion':
      return item.nombre_promocion || item.nombre || 'Promoción';
    default:
      return 'Item';
  }
}

function getDeleteTitle(type) {
  switch (type) {
    case 'product':
      return 'Eliminar Producto';
    case 'category':
      return 'Eliminar Categoría';
    case 'user':
      return 'Eliminar Usuario';
    case 'promotion':
      return 'Eliminar Promoción';
    default:
      return 'Confirmar Eliminación';
  }
}

function getDeleteMessage(type, item) {
  const itemName = getItemName();
  switch (type) {
    case 'product':
      return `¿Estás seguro de que deseas eliminar el producto "${itemName}"? Esta acción también eliminará el producto de la base de datos.`;
    case 'category':
      return `¿Estás seguro de que deseas eliminar la categoría "${itemName}"? Los productos en esta categoría serán movidos a "Sin categoría".`;
    case 'user':
      return `¿Estás seguro de que deseas eliminar al usuario "${itemName}"? Esta acción también eliminará el usuario de la base de datos.`;
    case 'promotion':
      return `¿Estás seguro de que deseas eliminar la promoción "${itemName}"? Esta acción también eliminará la promoción de la base de datos.`;
    default:
      return `¿Estás seguro de que deseas eliminar este item?`;
  }
}

async function confirmDelete() {
  const { type, item, index } = deleteModalData.value;
  
  try {
    isLoading.value = true;
    
    switch (type) {
      case 'product':
        await handleDeleteProduct(item, index);
        break;
      case 'category':
        await handleDeleteCategory(item, index);
        break;
      case 'user':
        await handleDeleteUser(item, index);
        break;
      case 'promotion':
        await handleDeletePromotion(item);
        break;
    }
    
    closeDeleteModal();
  } catch (error) {
    console.error('Error en confirmDelete:', error);
    showToast(error.message || 'Error al eliminar', 'error');
  } finally {
    isLoading.value = false;
  }
}

function deleteProduct(index) {
  const product = products.value[index];
  openDeleteModal('product', product, index);
}

// Delete Handler Functions with API calls
async function handleDeleteProduct(product, index) {
  try {
    // Make API call to delete from database
    const productId = product.id_producto || product.id;
    const response = await fetch(`${API_URL}/productos/${productId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    // Remove from local state
    const name = product.name || product.nombre;
    const cat = categories.value.find(c => c.name === (product.category || product.categoria));
    if (cat) cat.productCount--;
    products.value.splice(index, 1);
    
    pushNotification('Producto eliminado', `El producto ${name} fue eliminado de la base de datos.`);
    showToast('Producto eliminado exitosamente', 'success');
    
  } catch (error) {
    console.error('❌ handleDeleteProduct:', error);
    throw error;
  }
}

async function handleDeleteCategory(category, index) {
  try {
    // Make API call to delete from database
    const categoryId = category.id_categoria || category.id;
    const response = await fetch(`${API_URL}/categorias/${categoryId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    // Update local state - move products to "Sin categoría"
    const name = category.name || category.nombre;
    products.value = products.value.map(p =>
      (p.category === name || p.categoria === name) 
        ? { ...p, category: 'Sin categoría', categoria: 'Sin categoría' } 
        : p
    );
    categories.value.splice(index, 1);
    
    pushNotification('Categoría eliminada', `La categoría ${name} fue eliminada de la base de datos.`);
    showToast('Categoría eliminada exitosamente', 'success');
    
  } catch (error) {
    console.error('❌ handleDeleteCategory:', error);
    throw error;
  }
}

async function handleDeleteUser(user, index) {
  try {
    // Make API call to delete from database
    const userId = user.id_usuario || user.id;
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    // Remove from local state
    const name = user.name || user.nombre;
    users.value.splice(index, 1);
    
    pushNotification('Usuario eliminado', `${name} fue eliminado de la base de datos.`);
    showToast('Usuario eliminado exitosamente', 'success');
    
  } catch (error) {
    console.error('❌ handleDeleteUser:', error);
    throw error;
  }
}

async function handleDeletePromotion(promotion) {
  try {
    // Make API call to delete from database
    const promotionId = promotion.id_promocion || promotion.id;
    const response = await fetch(`${API_URL}/promociones/${promotionId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    // Remove from local state
    promotions.value = promotions.value.filter(p => p.id_promocion !== promotion.id_promocion);
    
    pushNotification('Promoción eliminada', `"${promotion.nombre_promocion}" fue eliminada de la base de datos.`);
    showToast('Promoción eliminada exitosamente', 'success');
    
  } catch (error) {
    console.error('❌ handleDeletePromotion:', error);
    throw error;
  }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────
// (Variables movidas al inicio)

const categorySearchQuery = ref('');
const showCategoryModal   = ref(false);
const currentCategory     = ref(null);
const categoryForm        = ref({ nombre: '', descripcion: '', activo: true });

const filteredCategories = computed(() =>
  categories.value.filter(c =>
    c.name.toLowerCase().includes(categorySearchQuery.value.toLowerCase())
  )
);

function openCategoryModal(category) {
  if (category) {
    currentCategory.value = category;
    categoryForm.value = {
      nombre:      category.name        || '',
      descripcion: category.description || '',
      activo:      category.activo !== undefined ? category.activo : true
    };
  } else {
    currentCategory.value = null;
    categoryForm.value = { nombre: '', descripcion: '', activo: true };
  }
  showCategoryModal.value = true;
}
function closeCategoryModal() { showCategoryModal.value = false; }

async function saveCategory() {
  if (!categoryForm.value.nombre.trim()) {
    showToast('El nombre no puede estar vacío', 'error');
    return;
  }
  try {
    isLoading.value = true;
    if (currentCategory.value) {
      Object.assign(currentCategory.value, {
        name:        categoryForm.value.nombre,
        description: categoryForm.value.descripcion,
        activo:      categoryForm.value.activo
      });
      pushNotification('Categoría actualizada', `Categoría ${categoryForm.value.nombre} actualizada.`);
    } else {
      const categoryData = {
        nombre:      categoryForm.value.nombre,
        descripcion: categoryForm.value.descripcion,
        activo:      categoryForm.value.activo
      };
      const response = await fetch(`${API_URL}/categoria/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(categoryData)
      });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.message || 'Error al crear la categoría');
      }
      const result = await response.json();
      store.addCategory({ id_categoria: result.id_categoria, ...categoryData });
      categories.value.push({
        id:          result.id_categoria,
        name:        categoryForm.value.nombre,
        description: categoryForm.value.descripcion,
        activo:      categoryForm.value.activo,
        productCount: 0
      });
      pushNotification('Categoría creada', `Se añadió: ${categoryForm.value.nombre}`);
      showToast('Categoría creada exitosamente', 'success');
    }
    closeCategoryModal();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Error al guardar la categoría', 'error');
    pushNotification('Error al crear categoría', error.message || 'No se pudo crear la categoría');
  } finally {
    isLoading.value = false;
  }
}

function deleteCategory(index) {
  const category = categories.value[index];
  openDeleteModal('category', category, index);
}

function getCategoryNameById(categoryId) {
  if (!categoryId) return 'Sin categoría';
  const cat = categories.value.find(c => Number(c.id) === Number(categoryId));
  return cat ? cat.name : 'Sin categoría';
}

function getProductsByCategory(categoryId) {
  return products.value.filter(p => Number(p.id_categoria) === Number(categoryId));
}

// ─── NOTIFICACIONES ───────────────────────────────────────────

// ─── NOTIFICACIONES ───────────────────────────────────────────
// (Variables movidas al inicio)

const notificationSearchQuery = ref('');
const notificationFilter = ref('');

watch(() => orders.value.length, (newVal, oldVal) => {
  if (newVal > oldVal && oldVal > 0) {
    const newOrder = orders.value[0];
    pushNotification('🛍️ Nuevo Pedido', `Se ha recibido un pedido de ${newOrder?.userName || 'un cliente'} por ${newOrder?.total || 'su total'}.`);
  }
});

watch(() => users.value.length, (newVal, oldVal) => {
  if (newVal > oldVal && oldVal > 0) {
    const newUser = users.value[0];
    pushNotification('👤 Nuevo Registro', `${newUser?.name || 'Un usuario'} se ha registrado en la plataforma.`);
  }
});

const filteredNotifications = computed(() => {
  let f = notifications.value.filter(n =>
    n.title.toLowerCase().includes(notificationSearchQuery.value.toLowerCase()) ||
    n.message.toLowerCase().includes(notificationSearchQuery.value.toLowerCase())
  );
  if (notificationFilter.value === 'unread') f = f.filter(n => !n.read);
  else if (notificationFilter.value === 'read') f = f.filter(n => n.read);
  return f;
});

// (Computeds movidos al inicio)


function pushNotification(title, message) {
  notifications.value.push({
    id:        notifications.value.length + 1,
    title,
    message,
    timestamp: new Date(),
    read:      false,
  });
}

function markAsRead(index)         { notifications.value[index].read = true; }
function markAllAsRead()           { notifications.value.forEach(n => n.read = true); }
function deleteNotification(index) { notifications.value.splice(index, 1); }
function clearAllNotifications()   {
  if (confirm('¿Eliminar todas las notificaciones?')) notifications.value = [];
}

// ─── PEDIDOS (VENTAS) ─────────────────────────────────────────

async function loadOrders() {
  try {
    const response = await fetch(`${API_URL}/ventas`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!response.ok) throw new Error('Error al cargar ventas');
    const data = await response.json();
    orders.value = data.map(v => ({
      id: v.id_venta,
      productId: v.id_producto || 1, // Fallback if not joined
      productName: v.nombre_producto || 'Venta Brindis',
      productImage: v.imagen_producto || 'https://via.placeholder.com/100',
      userName: v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido}` : 'Invitado',
      status: v.estado === 'completada' ? 'Entregado' : (v.estado === 'pendiente' ? 'Pendiente' : 'Enviado'),
      quantity: 1,
      total: `$${Number(v.total_venta).toLocaleString('es-CO')}`
    }));
  } catch (error) {
    console.error('❌ loadOrders:', error);
  }
}


const orderSearchQuery  = ref('');
const debouncedOrderQuery = ref('');
let orderDebounceTimer = null;

watch(orderSearchQuery, (val) => {
  clearTimeout(orderDebounceTimer);
  orderDebounceTimer = setTimeout(() => { debouncedOrderQuery.value = val; }, 300);
});

const orderStatusFilter = ref('');

const filteredOrders = computed(() =>
  orders.value.filter(o =>
    o.productName.toLowerCase().includes(debouncedOrderQuery.value.toLowerCase()) &&
    (orderStatusFilter.value === '' || o.status === orderStatusFilter.value)
  )
);

const showOrderDetailsModal  = ref(false);
const currentOrderForDetails = ref(null);
const showOrderUpdateModal   = ref(false);
const currentOrderForUpdate  = ref(null);
const orderForm              = ref({ productName: '', status: '', newStatus: '' });

function openOrderDetailsModal(order)  { currentOrderForDetails.value = order; showOrderDetailsModal.value = true; }
function closeOrderDetailsModal()      { showOrderDetailsModal.value = false; }
function openOrderUpdateModal(order)   {
  currentOrderForUpdate.value = order;
  orderForm.value = { productName: order.productName, status: order.status, newStatus: order.status };
  showOrderUpdateModal.value = true;
}
function closeOrderUpdateModal() { showOrderUpdateModal.value = false; }

function saveOrderStatus() {
  const oldStatus = currentOrderForUpdate.value.status;
  const newStatus = orderForm.value.newStatus;
  if (newStatus !== oldStatus && newStatus === 'Enviado') {
    const product = products.value.find(p => p.id === currentOrderForUpdate.value.productId);
    if (product && product.stock >= currentOrderForUpdate.value.quantity) {
      product.stock -= currentOrderForUpdate.value.quantity;
      currentOrderForUpdate.value.status = newStatus;
      pushNotification('Pedido actualizado', `Pedido de ${orderForm.value.productName} → ${newStatus}. Stock actualizado.`);
      checkLowStock();
    } else {
      pushNotification('Error en pedido', `Stock insuficiente para ${orderForm.value.productName}.`);
      return;
    }
  } else {
    currentOrderForUpdate.value.status = newStatus;
    pushNotification('Pedido actualizado', `Pedido de ${orderForm.value.productName} → ${newStatus}.`);
  }
  closeOrderUpdateModal();
}

// ─── USUARIOS ────────────────────────────────────────────────

async function loadUsers() {
  try {
    console.log('🔄 Cargando usuarios desde backend...');
    
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!response.ok) throw new Error('Error al cargar usuarios');
    const data = await response.json();
    
    console.log('📊 Datos recibidos del backend:', {
      totalBackendUsers: data.length,
      localChangesBefore: localUserStatusChanges.value.size
    });
    
    // Map users and apply any local status changes
    users.value = data.map(u => {
      const userId = u.id;
      const localStatus = getLocalStatus(userId);
      const backendStatus = u.activo ? 'Activo' : 'Inactivo';
      const finalStatus = localStatus || backendStatus;
      
      // Log if there's a local override
      if (localStatus && localStatus !== backendStatus) {
        console.log('🔄 Aplicando cambio local:', {
          userId,
          userName: `${u.nombre} ${u.apellido}`,
          backendStatus,
          localStatus,
          finalStatus
        });
      }
      
      return {
        id: userId,
        name: `${u.nombre} ${u.apellido}`,
        email: u.email,
        role: u.role === 'admin' ? 'Administrador' : 'Cliente',
        status: finalStatus
      };
    });
    
    console.log('✅ Usuarios cargados con cambios locales preservados:', {
      totalUsers: users.value.length,
      localChangesAfter: localUserStatusChanges.value.size,
      hasLocalChanges: hasLocalChanges()
    });
    
    // Show summary of local changes
    if (hasLocalChanges()) {
      const deactivatedUsers = users.value.filter(u => getLocalStatus(u.id) === 'Inactivo');
      console.log('🔒 Usuarios con estado local modificado:', {
        totalLocalChanges: localUserStatusChanges.value.size,
        deactivatedCount: deactivatedUsers.length,
        deactivatedUsers: deactivatedUsers.map(u => ({ id: u.id, name: u.name, status: u.status }))
      });
    }
    
  } catch (error) {
    console.error('❌ loadUsers:', error);
  }
}

const userSearchQuery = ref('');
const userRoleFilter  = ref('');

const filteredUsers = computed(() =>
  users.value.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.value.toLowerCase()) &&
    (userRoleFilter.value === '' || u.role === userRoleFilter.value)
  )
);

const showUserModal = ref(false);
const currentUser   = ref(null);
const userForm      = ref({ name: '', email: '', role: 'Cliente', status: 'Activo' });

function openUserModal(user) {
  if (user) { currentUser.value = user; userForm.value = { ...user }; }
  else       { currentUser.value = null; userForm.value = { name: '', email: '', role: 'Cliente', status: 'Activo' }; }
  showUserModal.value = true;
}
function closeUserModal() { showUserModal.value = false; }

function saveUser() {
  if (currentUser.value) {
    Object.assign(currentUser.value, userForm.value);
    pushNotification('Usuario actualizado', `${userForm.value.name} fue actualizado.`);
  } else {
    users.value.push({ ...userForm.value });
    pushNotification('Usuario añadido', `Nuevo usuario: ${userForm.value.name}`);
  }
  closeUserModal();
}
function deleteUser(index) {
  const user = users.value[index];
  openDeleteModal('user', user, index);
}
async function toggleUserStatus(user) {
  try {
    isLoading.value = true;
    
    // Determine the new status
    const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    const isActive = newStatus === 'Activo';
    
    console.log('🔄 Iniciando toggleUserStatus para:', {
      userName: user.name,
      currentStatus: user.status,
      newStatus: newStatus,
      userId: user.id,
      userEmail: user.email
    });

    // Store the local status change to preserve it during data reloads
    localUserStatusChanges.value.set(user.id, newStatus);
    console.log('💾 Cambio local guardado en localStorage:', {
      userId: user.id,
      userName: user.name,
      newStatus,
      totalLocalChanges: localUserStatusChanges.value.size
    });
    
    // Update local state immediately to provide visual feedback
    const oldStatus = user.status;
    user.status = newStatus;
    
    console.log('✅ Estado local actualizado y guardado:', {
      userName: user.name,
      oldStatus: oldStatus,
      newStatus: user.status,
      localChangesCount: localUserStatusChanges.value.size
    });
    
    pushNotification('Estado actualizado', `${user.name} → ${user.status}.`);
    showToast(`Usuario ${newStatus.toLowerCase()} exitosamente`, 'success');
    
    // If user was deactivated, log them out if they're currently logged in
    if (!isActive) {
      console.log('🔒 Usuario desactivado, verificando si necesita cerrar sesión');
      await logoutDeactivatedUser(user.email);
    }
    
    // Try to sync with backend (now with better error handling)
    try {
      const userId = user.id_usuario || user.id || user.user_id;
      
      if (userId) {
        const adminToken = localStorage.getItem('adminToken');
        const url = `${API_URL}/usuarios/${userId}/status`;
        console.log('🔄 Intentando sincronizar con backend:', {
          userId,
          url,
          isActive,
          hasAdminToken: !!adminToken,
          adminTokenPreview: adminToken ? adminToken.substring(0, 20) + '...' : 'NO TOKEN'
        });
        
        // For reactivation, try multiple endpoints to ensure it works
        let syncSuccess = false;
        
        // Try 1: Status endpoint
        try {
          console.log('📡 Sending PATCH request to:', url);
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: isActive })
          });

          if (response.ok) {
            console.log('✅ Backend sincronizado correctamente (status endpoint)');
            syncSuccess = true;
          } else {
            const errorText = await response.text();
            console.log('⚠️ Status endpoint failed:', response.status, errorText);
          }
        } catch (statusError) {
          console.log('⚠️ Status endpoint error:', statusError.message);
        }
        
        // Try 2: PUT endpoint as fallback
        if (!syncSuccess) {
          try {
            const response = await fetch(`${API_URL}/usuarios/${userId}`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                activo: isActive,
                nombre: user.name?.split(' ')[0] || 'Usuario',
                email: user.email
              })
            });

            if (response.ok) {
              console.log('✅ Backend sincronizado correctamente (PUT endpoint)');
              syncSuccess = true;
            } else {
              console.log('⚠️ PUT endpoint also failed');
            }
          } catch (putError) {
            console.log('⚠️ PUT endpoint error:', putError.message);
          }
        }
        
        // If sync succeeded, clear local tracking for reactivated users
        if (syncSuccess && isActive) {
          console.log('✅ Usuario reactivado - limpiando tracking local');
          clearLocalStatusTracking(userId);
          
          // Force reload users to get fresh data
          setTimeout(() => {
            loadUsers();
          }, 1000);
        } else if (!syncSuccess) {
          console.log('⚠️ Backend no sincronizado, pero estado local preservado');
        }
      }
    } catch (apiError) {
      console.log('⚠️ Error en API, pero estado local preservado:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ toggleUserStatus:', error);
    showToast(error.message || 'Error al actualizar estado del usuario', 'error');
  } finally {
    isLoading.value = false;
  }
}

// Function to logout deactivated users
async function logoutDeactivatedUser(userEmail) {
  try {
    // Check if the deactivated user is currently logged in
    const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (currentUser.email === userEmail) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');
      console.log(`Usuario ${userEmail} fue desactivado y cerró sesión automáticamente`);
    }
  } catch (error) {
    console.error('Error checking logged in user:', error);
  }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────
const ventaStats = ref({ total: 0, completadas: 0, pendientes: 0 });
const montoStats = ref({ totalGeneral: 0, totalCompletadas: 0, totalPendientes: 0 });

async function loadStats() {
  try {
    const [resStats, resMontos] = await Promise.all([
      fetch(`${API_URL}/ventas/estadisticas`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } }),
      fetch(`${API_URL}/ventas/montos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } })
    ]);
    if (resStats.ok)  ventaStats.value = await resStats.json();
    if (resMontos.ok) montoStats.value = await resMontos.json();
  } catch (error) {
    console.error('❌ loadStats:', error);
  }
}

const totalSales = computed(() =>
  Number(montoStats.value.totalGeneral).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
);
const activeUsers      = computed(() => users.value.filter(u => u.status === 'Activo').length);
const pendingOrders    = computed(() => ventaStats.value.pendientes);
const lowStockProducts = computed(() => products.value.filter(p => p.stock < 10).length);
const openTickets      = computed(() => tickets.value.filter(t => t.status === 'Abierto').length);

// ─── MONITOR DE PÁGINAS ────────────────────────────────────────
const activePromosCount = computed(() => promotions.value.filter(p => p.activo).length);
const catalogStats = computed(() => {
  const total = products.value.length;
  const lowStock = products.value.filter(p => p.stock < 10).length;
  const healthyStock = total - lowStock;
  return {
    total,
    healthyStock,
    lowStock,
    healthPercent: total > 0 ? Math.round((healthyStock / total) * 100) : 0
  };
});
const homeStats = computed(() => ({
  carouselImages: 3, 
  featuredProducts: products.value.slice(0, 3).length
}));
const virtualMenuStats = computed(() => ({
  heroProduct: products.value[0]?.name || 'Ninguno',
  status: 'Exclusivo Bares Locales'
}));

// ─── PROMOCIONES ─────────────────────────────────────────────
const promotions           = ref([]);
const promotionSearchQuery = ref('');
const showPromotionModal   = ref(false);
const currentPromotion     = ref(null);
const isLoadingPromotions  = ref(false);

const promotionForm = ref({
  nombre_promocion:   '',
  descuento:          0,
  fecha_inicio:       '',
  fecha_fin:          '',
  cantidad_productos: 1,
  activo:             true,
  id_producto:        null,
});

const filteredPromotions = computed(() =>
  promotions.value.filter(p =>
    (p.nombre_promocion ?? '').toLowerCase().includes(promotionSearchQuery.value.toLowerCase())
  )
);

async function loadPromotions() {
  try {
    isLoadingPromotions.value = true;
    const response = await fetch(`${API_URL}/promociones`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!response.ok) throw new Error('Error al cargar promociones');
    promotions.value = await response.json();
  } catch (error) {
    console.error('❌ loadPromotions:', error);
    showToast('No se pudieron cargar las promociones', 'error');
  } finally {
    isLoadingPromotions.value = false;
  }
}

function openPromotionModal(promotion = null) {
  if (promotion) {
    currentPromotion.value = promotion;
    promotionForm.value = {
      nombre_promocion:   promotion.nombre_promocion   ?? '',
      descuento:          promotion.descuento           ?? 0,
      fecha_inicio:       promotion.fecha_inicio        ? String(promotion.fecha_inicio).split('T')[0] : '',
      fecha_fin:          promotion.fecha_fin           ? String(promotion.fecha_fin).split('T')[0]    : '',
      cantidad_productos: promotion.cantidad_productos  ?? 1,
      activo:             promotion.activo              ?? true,
      id_producto:        promotion.id_producto         ?? null,
    };
  } else {
    currentPromotion.value = null;
    promotionForm.value = {
      nombre_promocion:   '',
      descuento:          0,
      fecha_inicio:       '',
      fecha_fin:          '',
      cantidad_productos: 1,
      activo:             true,
      id_producto:        null,
    };
  }
  showPromotionModal.value = true;
}

function closePromotionModal() {
  showPromotionModal.value = false;
  currentPromotion.value   = null;
}

// Obtiene la imagen del producto asociado a la promoción
function getProductImage(id_producto) {
  const prod = products.value.find(p => Number(p.id) === Number(id_producto));
  return prod?.image || 'https://via.placeholder.com/300x200?text=Sin+imagen';
}

// Obtiene el nombre del producto asociado a la promoción
function getProductName(id_producto) {
  const prod = products.value.find(p => Number(p.id) === Number(id_producto));
  return prod?.name || `Producto #${id_producto}`;
}


function validatePromotionForm() {
  if (!promotionForm.value.nombre_promocion.trim()) {
    showToast('El nombre de la promoción es obligatorio', 'error'); return false;
  }
  if (promotionForm.value.descuento <= 0 || promotionForm.value.descuento > 100) {
    showToast('El descuento debe estar entre 0.01% y 100%', 'error'); return false;
  }
  if (!promotionForm.value.fecha_inicio) {
    showToast('La fecha de inicio es obligatoria', 'error'); return false;
  }
  if (!promotionForm.value.fecha_fin) {
    showToast('La fecha de fin es obligatoria', 'error'); return false;
  }
  if (new Date(promotionForm.value.fecha_fin) <= new Date(promotionForm.value.fecha_inicio)) {
    showToast('La fecha de fin debe ser posterior a la de inicio', 'error'); return false;
  }
  if (!promotionForm.value.id_producto) {
    showToast('Debes seleccionar un producto', 'error'); return false;
  }
  if (promotionForm.value.cantidad_productos < 1) {
    showToast('La cantidad debe ser al menos 1', 'error'); return false;
  }
  return true;
}

async function savePromotion() {
  if (!validatePromotionForm()) return;
  try {
    isLoading.value = true;
    const payload = {
      nombre_promocion:   promotionForm.value.nombre_promocion.trim(),
      descuento:          Number(promotionForm.value.descuento),
      fecha_inicio:       promotionForm.value.fecha_inicio,
      fecha_fin:          promotionForm.value.fecha_fin,
      cantidad_productos: Number(promotionForm.value.cantidad_productos),
      activo:             promotionForm.value.activo,
      id_producto:        Number(promotionForm.value.id_producto),
    };

    let response;
    if (currentPromotion.value) {
      response = await fetch(`${API_URL}/promociones/${currentPromotion.value.id_promocion}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${API_URL}/promociones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }

    const result = await response.json();

    if (currentPromotion.value) {
      const idx = promotions.value.findIndex(p => p.id_promocion === currentPromotion.value.id_promocion);
      if (idx !== -1) promotions.value[idx] = result;
      pushNotification('Promoción actualizada', `"${payload.nombre_promocion}" fue actualizada.`);
      showToast('Promoción actualizada correctamente', 'success');
    } else {
      promotions.value.push(result);
      pushNotification('Promoción creada', `Se creó: "${payload.nombre_promocion}".`);
      showToast('Promoción creada correctamente', 'success');
    }

    closePromotionModal();
  } catch (error) {
    console.error('❌ savePromotion:', error);
    showToast(error.message || 'Error al guardar la promoción', 'error');
    pushNotification('Error al guardar promoción', error.message || 'No se pudo guardar.');
  } finally {
    isLoading.value = false;
  }
}

// ✅ CORREGIDO: recibe el objeto, no el índice
function deletePromotion(promotion) {
  openDeleteModal('promotion', promotion);
}

async function desactivarPromotion(promotion) {
  try {
    isLoading.value = true;
    const response = await fetch(`${API_URL}/promociones/${promotion.id_promocion}/desactivar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }
    const result = await response.json();
    const idx = promotions.value.findIndex(p => p.id_promocion === promotion.id_promocion);
    if (idx !== -1) promotions.value[idx] = result;
    pushNotification('Promoción desactivada', `"${promotion.nombre_promocion}" fue desactivada.`);
    showToast('Promoción desactivada', 'success');
  } catch (error) {
    console.error('❌ desactivarPromotion:', error);
    showToast(error.message || 'Error al desactivar', 'error');
  } finally {
    isLoading.value = false;
  }
}

// ─── TICKETS ─────────────────────────────────────────────────
const showTicketChatModal = ref(false);
const currentTicket       = ref(null);
const newMessage          = ref('');
// (Variable tickets movida al inicio)


const ticketSearchQuery  = ref('');
const ticketStatusFilter = ref('');
const filteredTickets    = computed(() =>
  tickets.value.filter(t =>
    t.subject.toLowerCase().includes(ticketSearchQuery.value.toLowerCase()) &&
    (ticketStatusFilter.value === '' || t.status === ticketStatusFilter.value)
  )
);

function openTicketChat(ticket) {
  currentTicket.value = { ...ticket, messages: [...ticket.messages] };
  showTicketChatModal.value = true;
  setTimeout(() => {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }, 100);
}
function closeTicketChatModal() { showTicketChatModal.value = false; }
function sendMessage() {
  if (!newMessage.value.trim()) return;
  currentTicket.value.messages.push({ text: newMessage.value, timestamp: new Date(), sentBy: userName.value });
  newMessage.value = '';
  setTimeout(() => {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }, 100);
}
function toggleTicketStatus(ticket) {
  ticket.status = ticket.status === 'Abierto' ? 'Cerrado' : 'Abierto';
  pushNotification('Ticket actualizado', `Ticket de ${ticket.userName} → ${ticket.status}.`);
}

// ─── LOGS ────────────────────────────────────────────────────
const logs = ref([
  { message:'Juan Pérez inició sesión',         timestamp: new Date('2025-10-21T06:00:00'), user:'Juan Pérez',  type:'login' },
  { message:'Vodka Premium editado',             timestamp: new Date('2025-10-21T06:10:00'), user:'María Gómez', type:'edit' },
  { message:'Usuario Carlos López eliminado',    timestamp: new Date('2025-10-21T06:20:00'), user:'María Gómez', type:'delete' }
]);
const logSearchQuery = ref('');
const logFilter      = ref('');
const filteredLogs   = computed(() =>
  logs.value.filter(l =>
    l.message.toLowerCase().includes(logSearchQuery.value.toLowerCase()) &&
    (logFilter.value === '' || l.type === logFilter.value)
  )
);

// ─── MÉTODOS DE PAGO ─────────────────────────────────────────
const paymentConfig = ref({ stripeKey: '', paypalId: '' });
function savePaymentConfig() {
  pushNotification('Configuración guardada', 'Métodos de pago configurados correctamente.');
}

// ─── BACKUP ──────────────────────────────────────────────────
const backupFile = ref(null);
function exportBackup() {
  isLoading.value = true;
  const data = {
    products: products.value, orders: orders.value, users: users.value,
    categories: categories.value, promotions: promotions.value,
    tickets: tickets.value, logs: logs.value
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'brindis_backup.json';
  link.click();
  isLoading.value = false;
}
function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  isLoading.value = true;
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    products.value   = data.products   || [];
    orders.value     = data.orders     || [];
    users.value      = data.users      || [];
    categories.value = data.categories || [];
    promotions.value = data.promotions || [];
    tickets.value    = data.tickets    || [];
    logs.value       = data.logs       || [];
    isLoading.value  = false;
    pushNotification('Backup importado', 'Datos restaurados correctamente.');
  };
  reader.readAsText(file);
}

// ─── EXPORTAR PDF / CSV ───────────────────────────────────────
function exportProductsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Reporte de Productos - Brindis Express", 10, 10);
  products.value.forEach((p, i) => doc.text(`${i+1}. ${p.name} - ${p.price} - Stock: ${p.stock}`, 10, 20+(i*10)));
  doc.save('productos.pdf');
}
function exportOrdersPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Reporte de Pedidos - Brindis Express", 10, 10);
  orders.value.forEach((o, i) => doc.text(`${i+1}. ${o.productName} - ${o.total} - ${o.status}`, 10, 20+(i*10)));
  doc.save('pedidos.pdf');
}
function exportUsersPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Reporte de Usuarios - Brindis Express", 10, 10);
  users.value.forEach((u, i) => doc.text(`${i+1}. ${u.name} - ${u.email} - ${u.role}`, 10, 20+(i*10)));
  doc.save('usuarios.pdf');
}

function csvDownload(filename, rows) {
  const headers = Object.keys(rows[0]).join(',');
  const body    = rows.map(r => Object.values(r).join(',')).join('\n');
  const blob    = new Blob([`${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const link    = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
function exportProducts() {
  csvDownload('productos.csv', products.value.map(p => ({
    ID: p.id, Nombre: p.name, Precio: p.price, Stock: p.stock, Categoría: p.category
  })));
}
function exportOrders() {
  csvDownload('pedidos.csv', orders.value.map(o => ({
    ID: o.id, Producto: o.productName, Usuario: o.userName,
    Estado: o.status, Cantidad: o.quantity, Total: o.total
  })));
}
function exportUsers() {
  csvDownload('usuarios.csv', users.value.map(u => ({
    Nombre: u.name, Email: u.email, Rol: u.role, Estado: u.status
  })));
}

// ─── HELPERS ─────────────────────────────────────────────────
function formatDate(date) {
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function checkLowStock() {
  products.value.forEach(p => {
    if (p.stock < 10) {
      const alreadyNotified = notifications.value.some(n => 
        n.title === '⚠️ Stock Bajo' && n.message.includes(`'${p.name}'`)
      );
      if (!alreadyNotified) {
        pushNotification('⚠️ Stock Bajo', `El producto '${p.name}' tiene solo ${p.stock} unidades. ¡Reabastece pronto!`);
      }
    }
  });
}



// ─── CARGAR BACKEND ──────────────────────────────────────────
async function fetchAllData() {
  try {
    await Promise.all([
      store.fetchCategories(),
      store.fetchProducts(),
      loadPromotions(),
      loadSuppliers(),
      loadOrders(),
      loadUsers(),
      loadStats()
    ]);

    categories.value = store.categories.map(cat => ({
      id:           cat.id,
      name:         cat.nombre,
      description:  cat.description || '',
      activo:       cat.activo,
      productCount: cat.productos ? cat.productos.length : 0
    }));

    products.value = store.products.map(prod => ({
      id:           prod.id,
      name:         prod.nombre,
      image:        prod.imagen_url || '',
      price:        `$${Number(prod.precio_venta).toLocaleString('es-CO')}`,
      stock:        prod.stock_actual,
      category:     store.getCategoryName(prod.id_categoria),
      id_categoria: prod.id_categoria
    }));

    checkLowStock();
    if (activeTab.value === 'dashboard') {
      initCharts();
    }
  } catch (error) {
    console.error('Error in real-time sync:', error);
  }
}
let syncInterval = null;

onMounted(async () => {
  checkAuthStatus();
  await fetchAllData();
  
  if (isAuthenticated.value) {
    pushNotification('👋 Bienvenida', `Hola ${userName.value}, panel de administración sincronizado.`);
    
    // Connect to WebSocket for real-time user status updates
    websocketService.connect()
    
    // Listen for user status updates from other admin actions
    // This is handled by the WebSocket service, but we can refresh user list when received
    console.log('🔔 Admin WebSocket connected - listening for user status updates')
  }
  setTimeout(initCharts, 500);

  syncInterval = setInterval(() => {
    if (!document.hidden) fetchAllData();
  }, 30000);
});

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval);
  websocketService.disconnect()
});
// ─── PROVEEDORES ──────────────────────────────────────────────
const suppliers = ref([]);
const supplierSearchQuery = ref('');

const filteredSuppliers = computed(() =>
  suppliers.value.filter(s =>
    s.nombre_empresa.toLowerCase().includes(supplierSearchQuery.value.toLowerCase())
  )
);

const showSupplierModal = ref(false);
const currentSupplier   = ref(null);
const supplierForm      = ref({
  nombre_empresa: '',
  contacto:       '',
  telefono:       '',
  email:          '',
  direccion:      '',
  pais:           '',
  ruc_nit:        '',
  activo:         true,
});

function openSupplierModal(supplier) {
  if (supplier) {
    currentSupplier.value = supplier;
    supplierForm.value = {
      nombre_empresa: supplier.nombre_empresa || '',
      contacto:       supplier.contacto       || '',
      telefono:       supplier.telefono       || '',
      email:          supplier.email          || '',
      direccion:      supplier.direccion      || '',
      pais:           supplier.pais           || '',
      ruc_nit:        supplier.ruc_nit        || '',
      activo:         supplier.activo !== undefined ? supplier.activo : true,
    };
  } else {
    currentSupplier.value = null;
    supplierForm.value = {
      nombre_empresa: '',
      contacto:       '',
      telefono:       '',
      email:          '',
      direccion:      '',
      pais:           '',
      ruc_nit:        '',
      activo:         true,
    };
  }
  showSupplierModal.value = true;
}

function closeSupplierModal() { showSupplierModal.value = false; }

async function loadSuppliers() {
  try {
    const response = await fetch(`${API_URL}/proveedores`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (!response.ok) throw new Error('Error al cargar proveedores');
    suppliers.value = await response.json();
  } catch (error) {
    console.error('❌ loadSuppliers:', error);
    showToast('No se pudieron cargar los proveedores', 'error');
  }
}

async function saveSupplier() {
  if (!supplierForm.value.nombre_empresa.trim()) {
    showToast('El nombre de la empresa es obligatorio', 'error');
    return;
  }
  try {
    isLoading.value = true;
    const payload = {
      nombre_empresa: supplierForm.value.nombre_empresa.trim(),
      activo:         supplierForm.value.activo,
      ...(supplierForm.value.contacto  && { contacto:  supplierForm.value.contacto.trim()  }),
      ...(supplierForm.value.telefono  && { telefono:  supplierForm.value.telefono.trim()  }),
      ...(supplierForm.value.email     && { email:     supplierForm.value.email.trim()     }),
      ...(supplierForm.value.direccion && { direccion: supplierForm.value.direccion.trim() }),
      ...(supplierForm.value.pais      && { pais:      supplierForm.value.pais.trim()      }),
      ...(supplierForm.value.ruc_nit   && { ruc_nit:   supplierForm.value.ruc_nit.trim()   }),
    };

    let response;
    if (currentSupplier.value) {
      response = await fetch(`${API_URL}/proveedores/${currentSupplier.value.id_proveedor}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${API_URL}/proveedores/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }

    const result = await response.json();

    if (currentSupplier.value) {
      const idx = suppliers.value.findIndex(s => s.id_proveedor === currentSupplier.value.id_proveedor);
      if (idx !== -1) suppliers.value[idx] = result;
      pushNotification('Proveedor actualizado', `"${payload.nombre_empresa}" fue actualizado.`);
      showToast('Proveedor actualizado', 'success');
    } else {
      suppliers.value.push(result);
      pushNotification('Proveedor creado', `Se añadió: "${payload.nombre_empresa}".`);
      showToast('Proveedor creado', 'success');
    }

    closeSupplierModal();
  } catch (error) {
    console.error('❌ saveSupplier:', error);
    showToast(error.message || 'Error al guardar el proveedor', 'error');
    pushNotification('Error', error.message || 'No se pudo guardar el proveedor.');
  } finally {
    isLoading.value = false;
  }
}

async function deleteSupplier(index) {
  const supplier = suppliers.value[index];
  if (!confirm(`¿Eliminar el proveedor "${supplier.nombre_empresa}"?`)) return;
  try {
    isLoading.value = true;
    const response = await fetch(`${API_URL}/proveedores/${supplier.id_proveedor}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (response.status !== 204 && !response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }
    suppliers.value.splice(index, 1);
    pushNotification('Proveedor eliminado', `"${supplier.nombre_empresa}" fue eliminado.`);
    showToast('Proveedor eliminado', 'success');
  } catch (error) {
    console.error('❌ deleteSupplier:', error);
    showToast(error.message || 'Error al eliminar el proveedor', 'error');
  } finally {
    isLoading.value = false;
  }
}
// ─── MARCAS ───────────────────────────────────────────────────
const brands = ref([
  { id: 1, name: 'Johnnie Walker', refCount: 7 },
  { id: 2, name: "Jack Daniel's",  refCount: 5 },
  { id: 3, name: 'Smirnoff',       refCount: 9 },
  { id: 4, name: 'Absolut',        refCount: 6 },
  { id: 5, name: 'Bacardí',        refCount: 8 },
  { id: 6, name: 'Don Julio',      refCount: 4 },
]);

const showBrandModal = ref(false);
const currentBrand   = ref(null);
const brandForm      = ref({ name: '', refCount: 0 });

function openBrandModal(brand) {
  if (brand) {
    currentBrand.value = brand;
    brandForm.value = { name: brand.name, refCount: brand.refCount };
  } else {
    currentBrand.value = null;
    brandForm.value = { name: '', refCount: 0 };
  }
  showBrandModal.value = true;
}
function closeBrandModal() { showBrandModal.value = false; }

function saveBrand() {
  if (!brandForm.value.name.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
  if (currentBrand.value) {
    Object.assign(currentBrand.value, brandForm.value);
    pushNotification('Marca actualizada', `"${brandForm.value.name}" fue actualizada.`);
    showToast('Marca actualizada', 'success');
  } else {
    brands.value.push({ id: Date.now(), ...brandForm.value });
    pushNotification('Marca creada', `Se añadió: "${brandForm.value.name}".`);
    showToast('Marca creada', 'success');
  }
  closeBrandModal();
}

function deleteBrand(index) {
  if (!confirm(`¿Eliminar la marca "${brands.value[index].name}"?`)) return;
  const name = brands.value[index].name;
  brands.value.splice(index, 1);
  pushNotification('Marca eliminada', `"${name}" fue eliminada.`);
  showToast('Marca eliminada', 'success');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --gold: #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber: #E87B2B;
}

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #3d3d2d 75%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #e0e0e0;
  transition: background 0.3s ease;
  font-size: 1.1rem;
}
.main-layout.light-mode {
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
  color: #333;
}
.background-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.5; pointer-events: none; z-index: 1;
}
.navbar {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding: clamp(0.6rem, 1.5vh, 1.2rem) clamp(0.8rem, 2vw, 1.5rem);
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  width: 100%; box-sizing: border-box;
}
.navbar.light-mode {
  background: rgba(240, 240, 240, 0.95);
  border-bottom-color: rgba(255, 69, 0, 0.1);
}
.navbar-content {
  display: flex; justify-content: flex-start; align-items: center;
  width: 100%; gap: clamp(1rem, 2vw, 2rem); flex-wrap: wrap;
}
.brand-title {
  color: #FFD700; font-size: clamp(1.2rem, 3vw, 2.5rem); font-weight: 900;
  margin: 0 auto 0 0; letter-spacing: clamp(0.5px, 0.2vw, 2px);
  background: linear-gradient(135deg, #FFD700, #FF4500);
  background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  white-space: nowrap;
}
.nav-section {
  display: flex; align-items: center; gap: clamp(0.5rem, 1.2vw, 1.5rem);
  flex-wrap: wrap; justify-content: flex-end;
}
.nav-links { display: flex; gap: clamp(0.5rem, 1vw, 1.5rem); flex-wrap: wrap; }
.nav-link, .notification-bell-btn {
  color: #e0e0e0; text-decoration: none; font-weight: 600;
  font-size: clamp(0.85rem, 1.5vw, 1rem);
  padding: clamp(0.4rem, 0.8vw, 0.5rem) clamp(0.6rem, 1.2vw, 1rem);
  border-radius: 20px; transition: all 0.3s ease;
  position: relative; display: flex; align-items: center; gap: 0.5rem;
  background: transparent; border: none; cursor: pointer;
}
.nav-link:hover, .notification-bell-btn:hover {
  background: rgba(255, 215, 0, 0.1); color: #FFD700;
}
.notification-badge {
  background: #e53e3e; color: white; border-radius: 50%;
  padding: 0.15rem 0.3rem; font-size: 0.7rem;
  position: absolute; top: -5px; right: -5px;
}
.animate-pulse { animation: pulse 1.5s infinite; }
@keyframes pulse {
  0%   { transform: scale(1);   box-shadow: 0 0 0 0 rgba(229,62,62,0.7); }
  70%  { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(229,62,62,0); }
  100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(229,62,62,0); }
}
.user-menu { display: flex; align-items: center; gap: clamp(0.5rem, 1vw, 1rem); flex-wrap: wrap; }
.user-welcome {
  display: flex; align-items: center; gap: 0.5rem; color: #FFD700;
  font-size: clamp(0.7rem, 1.3vw, 0.85rem); font-weight: 600;
  padding: clamp(0.3rem, 0.8vw, 0.5rem) clamp(0.5rem, 1.2vw, 0.8rem);
  background: rgba(255, 215, 0, 0.1); border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2); white-space: nowrap;
}
.user-info { display: flex; flex-direction: column; }
.welcome-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px; }
.user-role { font-size: 0.7rem; color: rgba(255, 215, 0, 0.7); }
.logout-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030); color: white;
  border: none; padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.6rem, 1.2vw, 1rem);
  border-radius: 25px; cursor: pointer; font-size: clamp(0.7rem, 1.3vw, 0.85rem);
  font-weight: 600; display: flex; align-items: center; gap: 0.4rem;
  transition: all 0.3s ease; white-space: nowrap;
}
.logout-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px rgba(229,62,62,0.5); }
.nav-tabs {
  display: flex; gap: 0.5rem; flex-wrap: nowrap; overflow-x: auto;
  padding: 0.5rem; background: rgba(30, 30, 30, 0.5); border-radius: 30px;
  scrollbar-width: thin; scrollbar-color: rgba(255,215,0,0.3) transparent;
  -webkit-overflow-scrolling: touch;
}
.nav-tab {
  background: rgba(40, 40, 40, 0.9); color: #e0e0e0; border: 2px solid transparent;
  padding: clamp(0.5rem, 1vw, 0.7rem) clamp(0.8rem, 1.5vw, 1.2rem);
  border-radius: 20px; cursor: pointer; font-weight: 600;
  font-size: clamp(0.8rem, 1.5vw, 0.95rem); transition: all 0.3s ease;
  white-space: nowrap; min-width: max-content; flex-shrink: 0;
}
.nav-tab:hover {
  background: rgba(60, 60, 60, 1); border-color: rgba(255, 215, 0, 0.5);
  color: #FFD700; transform: translateY(-3px) scale(1.05);
}
.nav-tab.active {
  background: linear-gradient(135deg, #FFD700 0%, #FF4500 100%);
  color: #1a1a1a; border-color: transparent; transform: scale(1.05); font-weight: 700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.6);
}
.content-scroll {
  max-height: calc(100vh - 100px); overflow-y: auto; padding: 2rem 3rem;
  scrollbar-width: thin; scrollbar-color: #FFD700 rgba(255,255,255,0.1);
}
.content-scroll::-webkit-scrollbar { width: 8px; }
.content-scroll::-webkit-scrollbar-thumb { background: #FFD700; border-radius: 4px; }
.catalog-section {
  background: rgba(30, 30, 30, 0.9); backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2); padding: 2rem;
  border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
.section-header { text-align: center; margin-bottom: 2rem; }
.section-title { color: #FFD700; font-size: 2rem; font-weight: 700; margin: 0; text-shadow: 0 0 10px rgba(255,215,0,0.5); }
.title-underline { width: 100px; height: 3px; background: #FFD700; margin: 0.5rem auto; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.stat-card {
  background: rgba(50, 50, 50, 0.9); border-radius: 10px; padding: 1.5rem;
  text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.3s ease;
}
.stat-card:hover { transform: translateY(-5px); }
.stat-card h3 { color: #e0e0e0; font-size: 1.1rem; margin-bottom: 0.5rem; }
.stat-card p  { color: #FFD700; font-size: 1.5rem; font-weight: 700; }
.charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
.chart-card { background: rgba(40, 40, 40, 0.9); border-radius: 10px; padding: 1rem; }
.chart-card h3 { color: #FFD700; font-size: 1.3rem; margin-bottom: 1rem; }
.filters-sidebar {
  position: fixed; right: -350px; top: 100px; width: 350px;
  background: rgba(25, 25, 25, 0.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 15px 0 0 15px;
  padding: 1.5rem; z-index: 90; transition: right 0.3s ease;
}
.filters-sidebar.active { right: 0; }
.filters-toggle {
  position: absolute; left: -60px; top: 20px; background: #FFD700; color: #1a1a1a;
  border: none; padding: 0.8rem 1.2rem; border-radius: 10px 0 0 10px; cursor: pointer; font-weight: 600;
}
.filters-content h3  { color: #FFD700; font-size: 1.4rem; margin-bottom: 1.5rem; }
.filter-group        { margin-bottom: 1.5rem; }
.filter-group label  { color: #e0e0e0; font-size: 1.1rem; margin-bottom: 0.5rem; display: block; }
.filter-group input,
.filter-group select { width: 100%; padding: 0.8rem; border-radius: 5px; border: 1px solid rgba(255,215,0,0.2); background: rgba(40,40,40,0.5); color: #e0e0e0; }
.apply-filters-btn { width:100%; padding:0.8rem; border-radius:25px; border:none; cursor:pointer; font-size:1rem; font-weight:600; margin-top:0.5rem; background:linear-gradient(135deg,#48bb78,#2f855a); color:white; }
.clear-filters-btn  { width:100%; padding:0.8rem; border-radius:25px; border:none; cursor:pointer; font-size:1rem; font-weight:600; margin-top:0.5rem; background:linear-gradient(135deg,#e53e3e,#c53030); color:white; }
.search-bar { display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
.search-bar input,
.search-bar select  { flex:1; min-width:200px; padding:0.8rem; border-radius:5px; border:1px solid rgba(255,215,0,0.2); background:rgba(40,40,40,0.5); color:#e0e0e0; }
.add-btn    { padding:0.8rem 1.2rem; border-radius:25px; border:none; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:0.5rem; transition:all 0.3s ease; background:linear-gradient(135deg,#48bb78,#2f855a); color:white; }
.export-btn { padding:0.8rem 1.2rem; border-radius:25px; border:none; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:0.5rem; transition:all 0.3s ease; background:linear-gradient(135deg,#3182ce,#2b6cb0); color:white; }
.add-btn:hover, .export-btn:hover { transform:translateY(-2px) scale(1.05); }
.products-grid,
.promotions-grid,
.notifications-grid,
.tickets-grid,
.users-grid,
.logs-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px,1fr)); gap:2rem; }
.product-card, .promotion-card, .notification-card, .ticket-card, .user-card, .log-card {
  background: rgba(40,40,40,0.9); border-radius:15px; padding:1.5rem;
  box-shadow:0 4px 15px rgba(0,0,0,0.3); transition:all 0.3s ease;
  position: relative;
}
.product-card:hover, .promotion-card:hover, .notification-card:hover,
.ticket-card:hover, .user-card:hover { transform:translateY(-5px); }
.card-image-container { position:relative; height:200px; overflow:hidden; border-radius:15px; margin-bottom:1.5rem; }
.product-image { width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease; }
.product-card:hover .product-image { transform:scale(1.08); }
.image-overlay { position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.5) 100%); }
.product-info { padding:1.5rem; }
.product-title    { font-size:1.5rem; font-weight:700; color:#e0e0e0; margin-bottom:1rem; }
.product-description { font-size:1.1rem; color:#b0b0b0; margin-bottom:1rem; line-height:1.6; }
.promotion-title  { font-size:1.4rem; font-weight:700; color:#FFD700; margin-bottom:1rem; }
.promotion-description { font-size:1rem; color:#b0b0b0; margin-bottom:0.6rem; line-height:1.5; }
.notification-title { font-size:1.4rem; color:#FFD700; margin-bottom:1rem; }
.notification-message { font-size:1.1rem; line-height:1.6; }
.notification-date  { font-size:0.9rem; color:#b0b0b0; margin-top:1rem; text-align:right; }
.notification-actions { display:flex; gap:1rem; margin-top:1.5rem; justify-content:space-between; }
.ticket-title  { font-size:1.4rem; font-weight:700; color:#e0e0e0; margin-bottom:0.8rem; }
.ticket-description { font-size:1rem; color:#b0b0b0; margin-bottom:0.5rem; }
.ticket-actions { display:flex; gap:0.8rem; margin-top:1rem; }
.log-message { color:#e0e0e0; font-size:1rem; margin-bottom:0.3rem; }
.log-date    { color:#b0b0b0; font-size:0.85rem; }
.log-card.critical { background:rgba(229,62,62,0.1); border-left:4px solid #e53e3e; }
.notification-card.unread { background:rgba(72,187,120,0.1); border-left:4px solid #48bb78; animation:glow 1.5s ease-in-out infinite alternate; }
@keyframes glow {
  from { box-shadow:0 0 5px rgba(72,187,120,0.2); }
  to   { box-shadow:0 0 15px rgba(72,187,120,0.5); }
}
.admin-controls { display:flex; flex-direction:column; gap:0.8rem; }
.price-display  { display:flex; justify-content:space-between; align-items:center; }
.price-label    { color:#e0e0e0; font-weight:600; }
.price-value    { color:#FFD700; font-size:1.1rem; font-weight:700; }
.admin-actions  { display:flex; flex-wrap:nowrap; gap:0.5rem; justify-content:space-between; }
.edit-product-btn, .view-stats-btn, .status-btn, .mark-read-btn, .send-btn, .save-btn, .cancel-btn {
  background:linear-gradient(135deg,#3182ce,#2b6cb0); color:white; border:none;
  padding:0.5rem 0.8rem; border-radius:20px; cursor:pointer; font-weight:600; font-size:0.85rem;
  display:flex; align-items:center; gap:0.3rem; transition:all 0.3s ease;
  flex:1; min-width:90px; justify-content:center; white-space:nowrap;
}
.edit-product-btn:hover, .view-stats-btn:hover, .mark-read-btn:hover, .send-btn:hover, .save-btn:hover { transform:translateY(-2px) scale(1.05); }
.delete-btn, .delete-notification-btn {
  background:linear-gradient(135deg,#e53e3e,#c53030); color:white; border:none;
  padding:0.5rem 0.8rem; border-radius:20px; cursor:pointer; font-weight:600; font-size:0.85rem;
  display:flex; align-items:center; gap:0.3rem; transition:all 0.3s ease;
  flex:1; min-width:90px; justify-content:center; white-space:nowrap;
}
.delete-btn:hover, .delete-notification-btn:hover { transform:translateY(-2px) scale(1.05); }
.cancel-btn { background:linear-gradient(135deg,#a0aec0,#718096); }
.status-btn.open { background:linear-gradient(135deg,#48bb78,#2f855a); }
.mark-read-btn   { background:linear-gradient(135deg,#48bb78,#2f855a); }
.close-panel-btn { background:none; border:1px solid rgba(255,215,0,0.3); color:#FFD700; padding:0.4rem 1rem; border-radius:20px; cursor:pointer; font-size:0.9rem; }
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:200; }
.modal-content {
  background:rgba(30,30,30,0.95); border-radius:15px; padding:2rem;
  width:90%; max-width:600px; box-shadow:0 8px 30px rgba(0,0,0,0.5);
  max-height:90vh; overflow-y:auto;
}
.large-modal { max-width:800px; }
.modal-content h2 { color:#FFD700; font-size:1.8rem; margin-bottom:1.5rem; }
.modal-content form { display:flex; flex-direction:column; gap:1.5rem; }
.form-group { display:flex; flex-direction:column; gap:0.5rem; }
.form-group label { color:#e0e0e0; font-size:1.1rem; font-weight:600; }
.form-group input,
.form-group select,
.form-group textarea { padding:0.8rem; border-radius:5px; border:1px solid rgba(255,215,0,0.2); background:rgba(40,40,40,0.5); color:#e0e0e0; font-size:1rem; }
.form-group input:focus, .form-group select:focus { border-color:#FFD700; outline:none; }
.modal-actions { display:flex; gap:1rem; justify-content:flex-end; }
.save-btn { background:linear-gradient(135deg,#48bb78,#2f855a); flex:none; min-width:auto; padding:0.6rem 1.5rem; }
.chat-container { display:flex; flex-direction:column; height:400px; }
.chat-messages  { flex-grow:1; overflow-y:auto; padding:1rem; background:rgba(40,40,40,0.9); border-radius:5px; margin-bottom:1rem; }
.chat-message   { margin-bottom:0.5rem; padding:0.5rem; border-radius:5px; max-width:70%; }
.chat-message.sent { background:#3182ce; margin-left:auto; color:white; }
.chat-message p { margin:0; }
.message-time   { font-size:0.7rem; color:#b0b0b0; display:block; text-align:right; }
.chat-input     { display:flex; gap:0.5rem; }
.chat-input input { flex-grow:1; padding:0.5rem; border:1px solid rgba(255,215,0,0.2); border-radius:5px; background:rgba(40,40,40,0.5); color:#e0e0e0; }
.order-details img { max-width:100%; border-radius:5px; margin-bottom:1rem; }
.payment-form { display:flex; flex-direction:column; gap:1.5rem; padding:1.5rem; background:rgba(40,40,40,0.9); border-radius:10px; }

/* Grid de promociones — mismo estilo que productos en categorías */
.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.backup-actions { display:flex; gap:1.5rem; justify-content:center; margin-top:1.5rem; flex-wrap:wrap; }
.backup-actions input[type="file"] { display:none; }
.progress-bar   { width:100%; background:rgba(255,255,255,0.1); border-radius:5px; overflow:hidden; margin-top:1rem; }
.progress       { height:10px; background:#FFD700; transition:width 0.3s ease; }
.loading-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:1000; }
.loading-spinner { width:50px; height:50px; border:5px solid #f3f3f3; border-top:5px solid #FFD700; border-radius:50%; animation:spin 1s linear infinite; }
.loading-overlay p { color:#e0e0e0; margin-top:1rem; font-size:1.2rem; }
@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
@keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
.category-section-wrapper { background:rgba(30,30,30,0.9); border:1px solid rgba(255,215,0,0.2); border-radius:15px; padding:2rem; margin-bottom:2rem; }
.category-header { display:flex; justify-content:space-between; align-items:center; padding-bottom:1.5rem; margin-bottom:2rem; border-bottom:3px solid rgba(255,215,0,0.4); }
.category-info-header { flex:1; }
.category-title-large { font-size:2.5rem; font-weight:800; color:#FFD700; margin:0 0 0.5rem 0; text-shadow:0 0 15px rgba(255,215,0,0.5); }
.category-product-count { font-size:1.2rem; color:#b0b0b0; margin:0; }
.category-actions-header { display:flex; gap:1rem; }
.products-in-category { margin-top:1.5rem; }
.products-in-category .products-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:1.2rem; }
.products-in-category .product-card  { padding:0; max-width:250px; margin:0 auto; overflow:hidden; }
.products-in-category .card-image-container { height:180px; display:flex; align-items:center; justify-content:center; background:linear-gradient(to bottom,#f5f5f5,#e8e8e8); }
.products-in-category .product-image { object-fit:contain; padding:0.8rem; }
.products-in-category .image-overlay { display:none; }
.products-in-category .product-info  { padding:1rem; }
.products-in-category .product-title { font-size:1rem; min-height:2.6em; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.products-in-category .product-description { font-size:0.85rem; }
.products-in-category .admin-controls { gap:0.7rem; }

/* Grid de promociones — mismo estilo que productos en categorías */
.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.2rem;
}
.promotion-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  max-width: 250px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.promotion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}
.promotion-card .card-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
  display: flex;
  align-items: center;
  justify-content: center;
}
.promotion-card .product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.8rem;
  transition: transform 0.4s ease;
}
.promotion-card:hover .product-image {
  transform: scale(1.05);
}
.promotion-card .image-overlay {
  display: none;
}
.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #FF4500, #e53e3e);
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.5);
  z-index: 2;
}
.promotion-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.promotion-title {
  font-size: 1rem;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 0.5rem;
  min-height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.promotion-description {
  font-size: 0.82rem;
  color: #b0b0b0;
  margin-bottom: 0.4rem;
  line-height: 1.4;
}
.promotion-card .admin-actions {
  margin-top: auto;
  padding-top: 0.8rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: nowrap;
}
.promotion-card .edit-product-btn,
.promotion-card .view-stats-btn,
.promotion-card .delete-btn {
  padding: 0.45rem 0.5rem;
  font-size: 0.78rem;
  min-width: 0;
  border-radius: 16px;
}

/* ← aquí empieza lo que ya existía */
.no-products-message { text-align:center; padding:3rem; background:rgba(40,40,40,0.5); border-radius:10px; border:2px dashed rgba(255,215,0,0.3); }
.products-in-category .price-display  { padding:0.6rem; background:rgba(255,215,0,0.1); border-radius:6px; }
.no-products-message { text-align:center; padding:3rem; background:rgba(40,40,40,0.5); border-radius:10px; border:2px dashed rgba(255,215,0,0.3); }
.no-products-message p { color:#b0b0b0; font-size:1.3rem; margin:0; }
.no-categories-message { text-align:center; padding:3rem; color:#b0b0b0; font-size:1.3rem; }
 
@media (max-width: 768px) {
  .navbar-content { flex-direction:column; gap:1rem; align-items:stretch; }
  .brand-title    { text-align:center; }
  .nav-section    { flex-direction:column; }
  .content-scroll { padding:1rem; }
}
@media (max-width: 480px) {
  .nav-tab { font-size:0.75rem; padding:0.4rem 0.8rem; }
  .section-title { font-size:1.5rem; }
}

/* Badge de descuento sobre la imagen */
.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FF4500, #e53e3e);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.5);
  z-index: 2;
}

/* Info de la promoción dentro de la tarjeta */
.promotion-info {
  padding: 1.2rem;
}

.promotion-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 0.8rem;
}

.promotion-description {
  font-size: 0.95rem;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* ═════════════════════════════════════════════════════════════
   Estilo Admin (mismo look que Promociones.vue)
   - No toca template/script
   - Solo CSS al final para sobrescribir
═════════════════════════════════════════════════════════════ */

.main-layout {
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 119px,
      rgba(201,168,76,0.025) 120px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 119px,
      rgba(201,168,76,0.025) 120px
    ),
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.10) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%) !important;
  color: #fff !important;
  font-family: 'DM Sans', sans-serif !important;
}

.main-layout.light-mode {
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 119px,
      rgba(201,168,76,0.04) 120px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 119px,
      rgba(201,168,76,0.04) 120px
    ),
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.10) 0%, transparent 60%),
    linear-gradient(160deg, #1B140C 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%) !important;
  color: #F6F1E8 !important;
}

.background-overlay {
  opacity: 0.35 !important;
}

.content-scroll {
  scrollbar-width: thin;
  scrollbar-color: #C9A84C rgba(255,255,255,0.06);
}
.content-scroll::-webkit-scrollbar { width: 8px; }
.content-scroll::-webkit-scrollbar-thumb {
  background: #C9A84C !important;
  border-radius: 6px !important;
}
.content-scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.06);
}

/* NAVBAR */
.navbar {
  position: sticky !important;
  top: 0;
  z-index: 100 !important;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(10,7,3,0.55) !important;
  border-top: 2px solid rgba(201,168,76,0.5) !important;
  border-bottom: 1px solid rgba(201,168,76,0.35) !important;
  backdrop-filter: blur(14px) saturate(140%);
  padding: clamp(0.6rem, 1.5vh, 1.2rem) clamp(0.8rem, 2vw, 1.5rem);
}
.navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #0d1117;
  background-image: 
    linear-gradient(rgba(201, 168, 76, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 168, 76, 0.07) 1px, transparent 1px);
  background-size: 25px 25px;
  filter: none;
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}
.navbar::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    linear-gradient(90deg, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.4) 30%, rgba(13,17,23,0.4) 70%, rgba(13,17,23,0.9) 100%),
    linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 20%, rgba(255,215,0,0.85) 50%, rgba(201,168,76,0.5) 80%, transparent);
  background-size: 100% 100%, 200% 2px;
  background-position: 0 0, 0 100%;
  background-repeat: no-repeat;
  animation: techScanner 4s linear infinite;
  pointer-events: none;
  box-shadow: inset 0 -2px 15px rgba(201, 168, 76, 0.15);
}
@keyframes techScanner {
  from { background-position: 0 0, 0 100%; }
  to   { background-position: 0 0, 200% 100%; }
}

.navbar.light-mode::before {
  background-color: #f3f4f6;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  filter: none;
}

.navbar-content {
  position: relative;
  z-index: 2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* Flechas deben no tapar contenido */
.brand-title,
.nav-section,
.nav-tabs,
.nav-links {
  position: relative;
  z-index: 3;
}

/* Brand title & Section titles (TIPOGRAFÍA) */
.brand-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-variant: small-caps;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  text-shadow: 0 0 10px rgba(201,168,76,0.4) !important;
  font-size: clamp(1.2rem, 3vw, 2.5rem) !important;
  font-weight: 700 !important;
  letter-spacing: 2px !important;
}

.section-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}
.title-underline {
  background: linear-gradient(90deg, rgba(255,224,102,0.1), rgba(255,224,102,1), rgba(232,123,43,1), rgba(255,224,102,0.1)) !important;
}

/* NAV TABS */
.nav-tabs {
  background: rgba(10,7,3,0.72) !important;
  border: 1px solid rgba(201,168,76,0.18) !important;
}
.nav-tab {
  background: rgba(10,7,3,0.35) !important;
  border: 1px solid rgba(201,168,76,0.12) !important;
  color: rgba(240,220,180,0.85) !important;
}
.nav-tab:hover {
  color: #FFE066 !important;
  border-color: rgba(201,168,76,0.35) !important;
}
.nav-tab.active {
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  color: #0D0A07 !important;
  border-color: transparent !important;
  box-shadow: 0 0 22px rgba(201,168,76,0.22) !important;
}

/* CARDS */
.product-card,
.promotion-card,
.notification-card,
.ticket-card,
.user-card,
.log-card,
.chart-card,
.category-section-wrapper,
.stat-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.98), rgba(19,14,9,0.98)) !important;
  border: 1px solid rgba(201,168,76,0.12) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35) !important;
  border-radius: 15px !important;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease !important;
}
.product-card:hover,
.promotion-card:hover,
.notification-card:hover,
.ticket-card:hover,
.user-card:hover,
.log-card:hover,
.chart-card:hover,
.category-section-wrapper:hover,
.stat-card:hover {
  transform: translateY(-10px) !important;
  border-color: rgba(201,168,76,0.35) !important;
  box-shadow: 0 22px 60px rgba(201,168,76,0.12), 0 0 0 1px rgba(201,168,76,0.12) !important;
}

/* Titles dentro de cards */
.product-title,
.ticket-title,
.user-card .product-title,
.log-message,
.notification-title,
.promotion-title {
  color: rgba(255, 236, 168, 0.96) !important;
}
.promotion-description,
.product-description,
.ticket-description,
.notification-message,
.log-date,
.notification-date {
  color: rgba(200,175,130,0.55) !important;
}

/* User Status Indicators */
.user-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 10;
}

.status-active {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.status-inactive {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.user-inactive {
  opacity: 0.7;
  border: 2px solid rgba(229, 62, 62, 0.3);
}

.user-inactive:hover {
  opacity: 0.8;
  border-color: rgba(229, 62, 62, 0.5);
}

.inactive-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 0.6rem;
  margin: 0.8rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ffc107;
}

.warning-icon {
  animation: pulse 2s infinite;
}

.activate-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a) !important;
  color: white !important;
}

.activate-btn:hover {
  background: linear-gradient(135deg, #38a169, #276749) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.deactivate-btn {
  background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
  color: white !important;
}

.deactivate-btn:hover {
  background: linear-gradient(135deg, #dd6b20, #c05621) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
}

/* STAT CARDS */
.stat-card h3 {
  color: rgba(255, 250, 230, 0.92) !important;
  font-family: 'Cinzel', serif !important;
}
.stat-card p {
  color: var(--gold-lt) !important;
  font-family: 'Cinzel', serif !important;
}

/* BOTONES */
.add-btn,
.save-btn,
.apply-filters-btn,
.mark-read-btn,
.send-btn,
.close-panel-btn,
.edit-product-btn,
.view-stats-btn {
  border: 1px solid rgba(201,168,76,0.55) !important;
  background: rgba(201,168,76,0.15) !important;
  color: #FFE066 !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(201,168,76,0.05) !important;
}
.add-btn:hover,
.save-btn:hover,
.apply-filters-btn:hover,
.mark-read-btn:hover,
.send-btn:hover,
.close-panel-btn:hover,
.edit-product-btn:hover,
.view-stats-btn:hover {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 20px 50px rgba(201,168,76,0.12) !important;
}

.delete-btn,
.delete-notification-btn {
  background: linear-gradient(135deg, #C53030, #9B2C2C) !important;
  border: 1px solid rgba(229, 62, 62, 0.35) !important;
  color: #fff !important;
}
.delete-btn:hover,
.delete-notification-btn:hover {
  box-shadow: 0 18px 50px rgba(229,62,62,0.18) !important;
}

.export-btn {
  background: linear-gradient(135deg, #0E2A4F, #123F78) !important;
  border: 1px solid rgba(100,160,255,0.32) !important;
  color: #BFE3FF !important;
}
.export-btn:hover {
  transform: translateY(-2px) scale(1.03) !important;
  box-shadow: 0 18px 50px rgba(18,63,120,0.35) !important;
}

/* MODALES */
.modal-content {
  background: linear-gradient(145deg, #1C1610, #130F0A) !important;
  border: 1px solid rgba(201,168,76,0.2) !important;
}
.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1px;
  right: -1px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201,168,76,0.85),
    rgba(232,123,43,0.9),
    rgba(201,168,76,0.85),
    transparent
  );
  background-size: 200% 100%;
  animation: modalTopShimmer 2.2s linear infinite;
  border-radius: 8px 8px 0 0;
}
@keyframes modalTopShimmer {
  from { background-position: 0% 50%; }
  to { background-position: 200% 50%; }
}

.modal-content h2 {
  font-family: 'Cinzel', serif !important;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}

.form-group input,
.form-group select,
.form-group textarea {
  background: rgba(10,7,3,0.62) !important;
  border: 1px solid rgba(201,168,76,0.18) !important;
  color: #F6F1E8 !important;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: rgba(201,168,76,0.55) !important;
}

.cancel-btn {
  background: rgba(10,7,3,0.25) !important;
  border: 1px solid rgba(160,174,192,0.35) !important;
  color: rgba(236, 240, 255, 0.85) !important;
}

 

/* Responsive - no romper el navbar con flechas */
@media (max-width: 900px) {
  .navbar-content::before,
  .navbar-content::after { display: none; }
}


/* ─── PROVEEDORES Y MARCAS ─────────────────────────────────── */
.suppliers-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
@media (max-width: 768px) {
  .suppliers-layout { grid-template-columns: 1fr; }
}
.suppliers-panel {
  background: linear-gradient(145deg, rgba(28,22,14,0.98), rgba(19,14,9,0.98));
  border: 1px solid rgba(201,168,76,0.12);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(201,168,76,0.15);
}
.panel-title {
  font-family: 'Cinzel', serif;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}
.panel-list { display: flex; flex-direction: column; gap: 0.6rem; }
.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(201,168,76,0.08);
  border-radius: 8px;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.panel-row:hover {
  background: rgba(201,168,76,0.06);
  border-color: rgba(201,168,76,0.25);
}
.panel-row-name {
  color: rgba(255, 236, 168, 0.92);
  font-size: 0.95rem;
  font-weight: 500;
}
.panel-row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.count-badge {
  background: rgba(201,168,76,0.15);
  border: 1px solid rgba(201,168,76,0.3);
  color: #FFE066;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;
}
.icon-btn {
  padding: 0.3rem 0.5rem !important;
  min-width: unset !important;
  flex: none !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
}

.modal-content {
  overflow-y: auto !important;
  max-height: 90vh !important;
}

.modal-content form {
  gap: 0.8rem !important;
}

.modal-content .form-group {
  gap: 0.3rem !important;
}

.modal-content .form-group label {
  font-size: 0.9rem !important;
}

.modal-content .form-group input,
.modal-content .form-group select,
.modal-content .form-group textarea {
  padding: 0.5rem 0.8rem !important;
  font-size: 0.9rem !important;
}

.modal-content h2 {
  font-size: 1.4rem !important;
  margin-bottom: 0.8rem !important;
}

/* Delete Confirmation Modal Styles */
.delete-modal {
  max-width: 500px !important;
  text-align: center;
}

.delete-modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.delete-modal-header .delete-icon {
  font-size: 2.5rem;
  animation: pulse 2s infinite;
}

.delete-modal-header h2 {
  font-family: 'Cinzel', serif !important;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 45%, #c44569 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  margin: 0 !important;
}

.delete-modal-body {
  margin-bottom: 2rem;
}

.delete-message {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.delete-item-preview {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-label {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.preview-name {
  color: #FFD700;
  font-size: 1.1rem;
  font-weight: 600;
}

.delete-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 0.8rem;
  margin-top: 1rem;
}

.delete-warning p {
  color: #ffc107;
  margin: 0;
  font-weight: 600;
}

.delete-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.delete-confirm-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-confirm-btn:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.delete-cancel-btn {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-cancel-btn:hover {
  background: linear-gradient(135deg, #5a6268, #495057);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* WordPress Admin Dashboard Structure Styles */
.wp-layout {
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  width: 100vw !important;
  overflow: hidden !important;
  position: absolute;
  top: 0; left: 0;
  z-index: 9999;
}

.wp-topbar {
  height: 32px;
  background: rgba(10,7,3,0.95) !important;
  border-bottom: 1px solid rgba(201,168,76,0.3) !important;
  color: #fff;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  width: 100% !important;
}

.wp-topbar-left, .wp-topbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.wp-site-name {
  font-size: 13px;
  color: #FFE066;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}

.wp-home-icon { font-size: 14px; }
.wp-new-menu { font-size: 13px; display: flex; align-items: center; gap: 5px; color: rgba(240,220,180,0.85); cursor: pointer; }
.wp-new-menu:hover { color: #FFE066; }

.wp-user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wp-user-welcome {
  background: transparent !important;
  border: none !important;
  color: rgba(240,220,180,0.85) !important;
  padding: 0 !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  display: flex;
  align-items: center;
  gap: 8px;
}
.wp-avatar-icon { font-size: 18px; filter: none; }

.wp-logout-btn {
  background: transparent !important;
  border: none !important;
  color: rgba(240,220,180,0.85) !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  min-width: unset !important;
  margin-left: 10px;
  transform: none !important;
}
.wp-logout-btn:hover {
  color: #FFE066 !important;
}

.wp-notif-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
.wp-badge {
  background: linear-gradient(135deg, #FF4500, #e53e3e) !important;
  color: white !important;
  font-size: 10px !important;
  padding: 2px 5px !important;
}

.wp-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.wp-sidebar {
  width: 260px;
  background: rgba(15,11,7,0.98);
  border-right: 1px solid rgba(201,168,76,0.15) !important;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
}

.wp-sidebar-header {
  padding: 15px 20px;
  background: transparent;
  border-bottom: 1px solid rgba(201,168,76,0.1) !important;
  display: flex;
  align-items: center;
}

.wp-brand-title {
  color: transparent !important;
  font-size: 18px !important;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 700 !important;
  text-shadow: 0 0 10px rgba(201,168,76,0.4) !important;
  letter-spacing: 0 !important;
  margin: 0 !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
}

.wp-sidebar-menu {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.wp-menu-item {
  background: transparent;
  border: none;
  color: rgba(240,220,180,0.85);
  padding: 14px 20px;
  text-align: left;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  margin: 0 !important;
  border-radius: 0 !important;
  transform: none !important;
}

.wp-menu-item:hover {
  color: #FFE066 !important;
  background: rgba(201,168,76,0.1) !important;
}

.wp-menu-item.active {
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  color: #0D0A07 !important;
  font-weight: 700 !important;
  border-color: transparent !important;
  box-shadow: 0 0 15px rgba(201,168,76,0.2) !important;
}

.wp-menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.wp-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.wp-page-header {
  padding: 15px 20px 0;
}
.wp-page-title {
  font-family: 'Cinzel', serif !important;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  font-size: 23px;
  font-weight: 700;
  margin: 0;
  padding: 0;
}

.wp-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 40px 20px !important;
  background: transparent !important;
  max-height: none !important;
}

/* Fix spacing for the dashboard inside layout */
.wp-content .catalog-section {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  max-width: none !important;
}

/* Fixing Filters Sidebar layout to fit WP structure */
.filters-sidebar {
  position: static !important;
  width: 100% !important;
  padding: 0 0 15px 0 !important;
  background: transparent !important;
  border: none !important;
}
.filters-content {
  background: linear-gradient(145deg, rgba(28,22,14,0.98), rgba(19,14,9,0.98)) !important;
  border: 1px solid rgba(201,168,76,0.12) !important;
  border-radius: 8px;
  padding: 15px !important;
}
.filters-toggle {
  position: static !important;
  margin-bottom: 10px;
}

/* ─── MONITOR DE PÁGINAS ESTILOS ─── */
.page-monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.monitor-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.95), rgba(19,14,9,0.95)) !important;
  border: 1px solid rgba(201,168,76,0.15) !important;
  border-radius: 12px !important;
  padding: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.monitor-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: var(--gold);
  opacity: 0.6;
}

.monitor-card:hover {
  transform: translateY(-5px);
  border-color: var(--gold) !important;
  box-shadow: 0 10px 30px rgba(201,168,76,0.15);
}

.monitor-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(201,168,76,0.1);
  padding-bottom: 0.5rem;
}

.page-icon {
  font-size: 1.4rem;
}

.monitor-header h3 {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  color: #FFE066;
  margin: 0;
}

.monitor-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.monitor-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.monitor-stat .label {
  color: rgba(200,175,130,0.7);
}

.monitor-stat .value {
  color: #fff;
  font-weight: 600;
}

.badge-count {
  background: rgba(201,168,76,0.2);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  color: #FFE066 !important;
  border: 1px solid rgba(201,168,76,0.3);
}

.health-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  margin: 0 0.8rem;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #E87B2B, #FFE066);
  border-radius: 3px;
}

.status-badge {
  font-size: 0.75rem;
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78 !important;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.warning-text {
  color: #f6ad55 !important;
}

.preview-btn {
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(201,168,76,0.05);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 6px;
  color: rgba(201,168,76,0.8);
  text-decoration: none;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: rgba(201,168,76,0.15);
  color: #FFE066;
  border-color: #FFE066;
}

/* ─── LIVE INDICATOR ─── */
.live-indicator-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.live-dot {
  width: 10px;
  height: 10px;
  background-color: #48bb78;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 10px #48bb78;
}

.live-dot::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border: 2px solid #48bb78;
  border-radius: 50%;
  animation: livePulse 2s infinite;
}

@keyframes livePulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}

.live-text {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: #48bb78;
  text-transform: uppercase;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
/* ─── SHOWROOM INTEGRATION ─── */
.showroom-integration {
  padding: 0 !important;
  overflow: hidden;
  background: #000 !important;
  border-color: rgba(255, 215, 0, 0.4) !important;
}
.showroom-container-admin {
  width: 100%;
  height: 80vh;
  position: relative;
  overflow-y: auto;
  border-radius: 8px;
}
.showroom-container-admin :deep(.showroom-wrapper) {
  min-height: 100%;
  position: relative;
}
.showroom-container-admin :deep(.showroom-navbar) {
  display: none; /* Hide internal navbar inside admin */
}

.wp-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: slideIn 0.3s ease-out;
}
.wp-toast.info { background-color: #3182ce; }
.wp-toast.success { background-color: #48bb78; }
.wp-toast.error { background-color: #e53e3e; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

</style>

