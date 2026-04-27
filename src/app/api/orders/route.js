import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { items, total, method, customerName } = data;

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.warn("GOOGLE_SCRIPT_URL no está configurada. El pedido no se registrará en Google Sheets.");
      return NextResponse.json({ success: true, warning: "URL de Google Script no configurada" });
    }

    // Formatear la fecha como DD/MM
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Preparamos un array de filas para insertar, una por cada producto en el carrito.
    // Columnas: A(Fecha), B(Cliente), C(Cantidad), D(Precio Unit.), E(Total), F(Tipo de Cliente), G(Notas)
    const rows = items.map(item => {
      return [
        formattedDate,                          // A: Fecha
        customerName || `Anónimo (${method})`,  // B: Cliente
        item.quantity,                          // C: Cantidad
        item.price,                             // D: Precio Unit.
        item.quantity * item.price,             // E: Total
        "Web",                                  // F: Tipo de Cliente
        item.name                               // G: Notas (Nombre del producto)
      ];
    });

    const payload = {
      action: "appendRows",
      rows: rows
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log("Respuesta de Apps Script:", responseText);

    if (!response.ok) {
      throw new Error(`Error HTTP de Google Script: ${response.status} ${responseText}`);
    }

    try {
      const responseJson = JSON.parse(responseText);
      if (responseJson.error) {
         throw new Error(responseJson.error);
      }
    } catch (e) {
      // Si no es JSON, quizás no es nuestro script
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error al guardar el pedido en Google Sheets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

