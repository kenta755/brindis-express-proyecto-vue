import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ✅ CORRECCIÓN: Usar variable de entorno con /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8222/api';

export const useStore = defineStore('main', () => {
  const categories = ref<any[]>([]);
  const products = ref<any[]>([]);
  const promotions = ref<any[]>([]);
  const authToken = ref<string>(localStorage.getItem('authToken') || localStorage.getItem('adminToken') || '');

  // Cargar categorías desde el backend
  const fetchCategories = async () => {
    try {
      console.log('🔍 Cargando categorías desde:', `${API_URL}/categoria`);
      
      const response = await fetch(`${API_URL}/categoria`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        categories.value = data.map((cat: any) => ({
          id: Number(cat.id_categoria || cat.id),
          id_categoria: Number(cat.id_categoria || cat.id),
          nombre: cat.nombre || cat.name,
          name: cat.nombre || cat.name,
          descripcion: cat.descripcion || cat.description || '',
          description: cat.descripcion || cat.description || '',
          activo: cat.activo !== undefined ? cat.activo : true,
          productos: cat.productos || []
        }));
        console.log('✅ Categorías sincronizadas:', categories.value);
      } else {
        console.error('❌ Error HTTP al cargar categorías:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
    } finally {
      if (categories.value.length === 0) {
        console.log('⚠️ Usando datos mock de categorías por defecto.');
        categories.value = [
          { id: 1, id_categoria: 1, nombre: 'Whisky', name: 'Whisky', descripcion: 'Selección premium', description: 'Selección premium', activo: true, productos: [] },
          { id: 2, id_categoria: 2, nombre: 'Vinos', name: 'Vinos', descripcion: 'Vinos de reserva', description: 'Vinos de reserva', activo: true, productos: [] },
          { id: 3, id_categoria: 3, nombre: 'Tequila', name: 'Tequila', descripcion: 'Tequilas añejos', description: 'Tequilas añejos', activo: true, productos: [] },
          { id: 4, id_categoria: 4, nombre: 'Ginebra', name: 'Ginebra', descripcion: 'Ginebras botánicas', description: 'Ginebras botánicas', activo: true, productos: [] }
        ];
      }
    }
  };

  // Cargar productos desde el backend
  const fetchProducts = async () => {
    try {
      console.log('🔍 Cargando productos desde:', `${API_URL}/productos`);
      
      const response = await fetch(`${API_URL}/productos`);
      
      if (!response.ok) {
        console.error('❌ Error HTTP al cargar productos:', response.status);
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      products.value = data.map((prod: any) => ({
        id: prod.id_producto,
        id_producto: prod.id_producto,
        nombre: prod.nombre,
        name: prod.nombre,
        imagen_url: prod.imagen_url || '',
        image: prod.imagen_url || '',
        precio_venta: prod.precio_venta,
        price: `$${Number(prod.precio_venta).toLocaleString('es-CO')}`,
        stock_actual: prod.stock_actual,
        stock: prod.stock_actual,
        id_categoria: Number(prod.id_categoria || 0),
        marca: prod.marca || '',
        descripcion: prod.descripcion || '',
        codigo_barras: prod.codigo_barras || '',
        activo: prod.activo !== undefined ? prod.activo : true
      }));
      console.log('✅ Productos sincronizados:', products.value);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    } finally {
      if (products.value.length === 0) {
        console.log('⚠️ Usando datos mock de productos por defecto.');
        products.value = [
          {
            id: 1, id_producto: 1, nombre: 'Whisky Reserva 18 Años', name: 'Whisky Reserva 18 Años',
            imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 240000, price: '$240.000', stock_actual: 50, stock: 50, id_categoria: 1, marca: 'Premium', 
            descripcion: 'Añejado magistralmente con notas profundas de roble y vainilla negra.', codigo_barras: '', activo: true
          },
          {
            id: 2, id_producto: 2, nombre: 'Vino Tinto Gran Reserva', name: 'Vino Tinto Gran Reserva',
            imagen_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 180000, price: '$180.000', stock_actual: 30, stock: 30, id_categoria: 2, marca: 'Premium', 
            descripcion: 'Cosecha excepcional. Aromas a frutos rojos maduros y taninos sedosos.', codigo_barras: '', activo: true
          },
          {
            id: 3, id_producto: 3, nombre: 'Tequila Añejo Cristalino', name: 'Tequila Añejo Cristalino',
            imagen_url: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 320000, price: '$320.000', stock_actual: 20, stock: 20, id_categoria: 3, marca: 'Premium', 
            descripcion: 'Pureza inigualable con un final suave y notas cítricas sutiles.', codigo_barras: '', activo: true
          },
          {
            id: 4, id_producto: 4, nombre: 'Ginebra Premium Botanics', name: 'Ginebra Premium Botanics',
            imagen_url: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 150000, price: '$150.000', stock_actual: 40, stock: 40, id_categoria: 4, marca: 'Premium', 
            descripcion: 'Infusionada con 12 botánicos exóticos.', codigo_barras: '', activo: true
          },
          {
            id: 5, id_producto: 5, nombre: 'Vino Blanco Sauvignon', name: 'Vino Blanco Sauvignon',
            imagen_url: 'https://images.unsplash.com/photo-1575037614876-c3852d23ef72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1575037614876-c3852d23ef72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 85000, price: '$85.000', stock_actual: 25, stock: 25, id_categoria: 2, marca: 'Premium', 
            descripcion: 'Fresco, afrutado y perfecto para mariscos.', codigo_barras: '', activo: true
          },
          {
            id: 6, id_producto: 6, nombre: 'Whisky Single Malt', name: 'Whisky Single Malt',
            imagen_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_venta: 290000, price: '$290.000', stock_actual: 15, stock: 15, id_categoria: 1, marca: 'Premium', 
            descripcion: 'Sabor intenso con toques ahumados.', codigo_barras: '', activo: true
          }
        ];
      }
    }
  };

  // Cargar promociones desde el backend
  const fetchPromotions = async () => {
    try {
      console.log('🔍 Cargando promociones desde:', `${API_URL}/promociones`);
      const response = await fetch(`${API_URL}/promociones`);
      if (response.ok) {
        const data = await response.json();
        promotions.value = data;
        console.log('✅ Promociones sincronizadas:', promotions.value);
      }
    } catch (error) {
      console.error('❌ Error al cargar promociones:', error);
    } finally {
      if (promotions.value.length === 0) {
        console.log('⚠️ Usando datos mock de promociones por defecto.');
        promotions.value = [
          {
            id_promocion: 'p1', nombre_promocion: 'Pack Fiesta VIP',
            descripcion: '2 Botellas de Whisky 12 años + Hielo + Mixers. Perfecto para la noche.',
            imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_promocion: 250000, precio_original: 300000, descuento: 15, fecha_fin: new Date(Date.now() + 86400000 * 2).toISOString()
          },
          {
            id_promocion: 'p2', nombre_promocion: 'Noche de Vinos',
            descripcion: '3 Vinos Gran Reserva + Tabla de quesos. La combinación ideal.',
            imagen_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_promocion: 180000, precio_original: 240000, descuento: 25, fecha_fin: new Date(Date.now() + 86400000 * 5).toISOString()
          },
          {
            id_promocion: 'p3', nombre_promocion: 'Tequila & Limón',
            descripcion: 'Botella de Tequila Añejo + Limones + Sal de gusano.',
            imagen_url: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            precio_promocion: 160000, precio_original: 190000, descuento: 15, fecha_fin: new Date(Date.now() + 86400000 * 1).toISOString()
          }
        ];
      }
    }
  };

  // Agregar categoría al store (para actualizaciones en tiempo real)
  const addCategory = (category: any) => {
    const newCat = {
      id: Number(category.id_categoria),
      id_categoria: Number(category.id_categoria),
      nombre: category.nombre,
      name: category.nombre,
      descripcion: category.descripcion || '',
      description: category.descripcion || '',
      activo: category.activo !== undefined ? category.activo : true,
      productos: []
    };
    categories.value.push(newCat);
    console.log('✅ Categoría agregada al store:', newCat);
  };

  // Agregar producto al store (para actualizaciones en tiempo real)
  const addProduct = (product: any) => {
    const newProd = {
      id: product.id_producto,
      id_producto: product.id_producto,
      nombre: product.nombre,
      name: product.nombre,
      imagen_url: product.imagen_url || '',
      image: product.imagen_url || '',
      precio_venta: product.precio_venta,
      price: `$${Number(product.precio_venta).toLocaleString('es-CO')}`,
      stock_actual: product.stock_actual,
      stock: product.stock_actual,
      id_categoria: Number(product.id_categoria || 0),
      marca: product.marca || '',
      descripcion: product.descripcion || '',
      codigo_barras: product.codigo_barras || '',
      activo: product.activo !== undefined ? product.activo : true
    };
    products.value.push(newProd);
    console.log('✅ Producto agregado al store:', newProd);
  };

  // Obtener productos por categoría
  const getProductsByCategory = (categoryId: number | string) => {
    return computed(() => 
      products.value.filter(prod => Number(prod.id_categoria) === Number(categoryId))
    ).value;
  };

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId: number | string | null): string => {
    if (!categoryId) return 'Sin categoría';
    const cat = categories.value.find(c => Number(c.id) === Number(categoryId));
    return cat ? cat.nombre : 'Sin categoría';
  };

  return {
    categories,
    products,
    promotions,
    authToken,
    fetchCategories,
    fetchProducts,
    fetchPromotions,
    addCategory,
    addProduct,
    getProductsByCategory,
    getCategoryName
  };
});