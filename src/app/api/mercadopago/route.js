import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configura Mercado Pago con tu Access Token.
// Idealmente, esto debería estar en un archivo .env (ej. process.env.MP_ACCESS_TOKEN)
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "TEST-8339243003001928-042411-1a3b8c6d4e5f7a9b0c1d2e3f4a5b6c7d-123456789";

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No hay items en el carrito" }), { status: 400 });
    }

    // Inicializamos el cliente de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
    const preference = new Preference(client);

    // Formateamos los items del carrito para Mercado Pago
    const mpItems = items.map((item) => ({
      id: item.id.toString(),
      title: item.name,
      description: item.description,
      picture_url: item.image,
      quantity: Number(item.quantity),
      currency_id: 'ARS',
      unit_price: Number(item.price)
    }));

    // Creamos la preferencia
    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: "http://localhost:3000?status=success",
          failure: "http://localhost:3000?status=failure",
          pending: "http://localhost:3000?status=pending"
        },
        auto_return: "approved"
      }
    });

    // Retornamos el init_point (la URL para redirigir al usuario)
    return new Response(JSON.stringify({ init_point: result.init_point }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error);

    // Fallback: Si el token es inválido o hay error, devolvemos un mock para que puedan probar la UI.
    // EN PRODUCCIÓN DEBES REMOVER ESTE FALLBACK.
    return new Response(JSON.stringify({
      init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=TEST-MOCK-PREF-ID",
      error: error.message
    }), {
      status: 200, // Devolvemos 200 para que la UI no rompa en pruebas
      headers: { "Content-Type": "application/json" }
    });
  }
}
