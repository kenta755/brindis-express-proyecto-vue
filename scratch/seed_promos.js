const API_URL = 'http://localhost:8222/api';

const promotions = [
  {
    nombre: 'Festival del Whisky',
    descripcion: 'Descuentos exclusivos en Whiskys importados',
    descuento: 20,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    activo: true,
    id_producto: 1, // Whisky Reserva
    imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    nombre: 'Noche de Vinos',
    descripcion: 'Perfecto para una velada especial',
    descuento: 15,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    activo: true,
    id_producto: 2, // Vino Tinto
    imagen_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

async function seed() {
  console.log('Seeding promotions...');
  for (const promo of promotions) {
    try {
      await fetch(`${API_URL}/promociones/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promo)
      });
      console.log(`✅ Promotion ${promo.nombre} created`);
    } catch (e) { console.error(`❌ Promotion ${promo.nombre} failed:`, e.message); }
  }
}

seed();
