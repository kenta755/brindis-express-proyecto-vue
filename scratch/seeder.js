const API_URL = 'http://localhost:8222/api';

const categories = [
  { nombre: 'Whisky', descripcion: 'Selección premium' },
  { nombre: 'Vinos', descripcion: 'Los mejores vinos' },
  { nombre: 'Tequila', descripcion: 'Tequilas añejos y reposados' },
  { nombre: 'Ginebra', descripcion: 'Ginebras botánicas' },
  { nombre: 'Vodka', descripcion: 'Vodkas destilados' },
  { nombre: 'Cervezas', descripcion: 'Cervezas artesanales e importadas' }
];

const products = [
  {
    codigo_barras: 'WHI-001', nombre: 'Whisky Reserva 18 Años', marca: 'Premium',
    descripcion: 'Añejado magistralmente con notas profundas de roble y vainilla negra.',
    precio_compra: 100000, precio_venta: 240000, stock_minimo: 5, stock_actual: 50,
    imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 1
  },
  {
    codigo_barras: 'VIN-001', nombre: 'Vino Tinto Gran Reserva', marca: 'Premium',
    descripcion: 'Aromas intensos a frutos rojos y especias con un final aterciopelado.',
    precio_compra: 80000, precio_venta: 180000, stock_minimo: 5, stock_actual: 30,
    imagen_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 2
  },
  {
    codigo_barras: 'TEQ-001', nombre: 'Tequila Añejo Cristalino', marca: 'Premium',
    descripcion: 'Suave, con toques de agave dulce y cítricos maduros.',
    precio_compra: 150000, precio_venta: 320000, stock_minimo: 5, stock_actual: 20,
    imagen_url: 'https://images.unsplash.com/photo-1516531154568-d018cb1dc4ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 3
  },
  {
    codigo_barras: 'GIN-001', nombre: 'Ginebra Premium Botanics', marca: 'Premium',
    descripcion: 'Refrescante, con una mezcla secreta de 12 botánicos exóticos.',
    precio_compra: 60000, precio_venta: 150000, stock_minimo: 5, stock_actual: 40,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 4
  },
  {
    codigo_barras: 'VOD-001', nombre: 'Vodka Puro Destilado', marca: 'Premium',
    descripcion: 'Múltiples destilaciones para una pureza inigualable.',
    precio_compra: 40000, precio_venta: 110000, stock_minimo: 5, stock_actual: 60,
    imagen_url: 'https://images.unsplash.com/photo-1517878342429-c70a98b48866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 5
  },
  {
    codigo_barras: 'CER-001', nombre: 'Cerveza Artesanal IPA (Six Pack)', marca: 'Artesanal',
    descripcion: 'Lupulada, aromática y con el balance perfecto de amargor.',
    precio_compra: 15000, precio_venta: 45000, stock_minimo: 5, stock_actual: 100,
    imagen_url: 'https://images.unsplash.com/photo-1538592116845-119a3974c958?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    activo: true, id_categoria: 6
  }
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    try {
      await fetch(`${API_URL}/categoria/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      console.log(`✅ Category ${cat.nombre} created`);
    } catch (e) { console.error(`❌ Category ${cat.nombre} failed:`, e.message); }
  }

  console.log('Seeding products...');
  for (const prod of products) {
    try {
      await fetch(`${API_URL}/productos/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
      });
      console.log(`✅ Product ${prod.nombre} created`);
    } catch (e) { console.error(`❌ Product ${prod.nombre} failed:`, e.message); }
  }
}

seed();
