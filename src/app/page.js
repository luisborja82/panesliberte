"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Send, CreditCard } from "lucide-react";
import "./page.css";

// Datos de prueba (Dummy Data)
const PRODUCTS = [
  {
    id: 1,
    name: "Pan de Campo Clásico",
    description: "Masa madre 100% natural, harina de trigo orgánica, agua filtrada y sal marina. Corteza crujiente y miga alveolada.",
    price: 3500,
    image: "/pan-de-campo.png",
    available: true
  },
  {
    id: 2,
    name: "Pan de Campo Integral",
    description: "Mezcla de harina integral y blanca, con un mix de semillas tostadas de girasol, lino y sésamo.",
    price: 0,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    available: false
  },
  {
    id: 3,
    name: "Focaccia de Papa y Ajo",
    description: "Fermentación lenta de 48hs. Bañada en aceite de oliva virgen extra, romero fresco y sal en escamas.",
    price: 0,
    image: "https://images.unsplash.com/photo-1596450514735-111a2fe02935?auto=format&fit=crop&w=600&q=80",
    available: false
  },
  {
    id: 4,
    name: "Baguette Rústica",
    description: "La clásica francesa elaborada con masa madre. Ideal para sándwiches o acompañar quesos.",
    price: 0,
    image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=600&q=80",
    available: false
  }
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoadingMP, setIsLoadingMP] = useState(false);
  const [customerName, setCustomerName] = useState("");

  // Funciones del Carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Registro de pedidos en Google Sheets
  const registerOrder = async (method) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          method: method,
          customerName: customerName || "Anónimo (Web)"
        })
      });
    } catch (error) {
      console.error("Error al registrar el pedido:", error);
    }
  };

  // Integraciones
  const handleWhatsAppOrder = async () => {
    if (cart.length === 0) return;

    // Registrar el pedido internamente primero
    await registerOrder('WhatsApp');

    let text = `¡Hola! Soy ${customerName ? customerName : "un cliente"}. Quería hacer un pedido de panes de masa madre:%0A%0A`;
    cart.forEach(item => {
      text += `- ${item.quantity}x ${item.name} ($${item.price * item.quantity})%0A`;
    });
    text += `%0A*Total: $${cartTotal}*%0A%0A¿Cómo podemos coordinar la entrega y el pago?`;

    // Reemplaza 1234567890 con el número de teléfono real
    window.open(`https://wa.me/+541173656513?text=${text}`, "_blank");
  };

  const handleMercadoPago = async () => {
    if (cart.length === 0) return;
    setIsLoadingMP(true);

    try {
      // Registrar el pedido internamente primero
      await registerOrder('MercadoPago');

      const response = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart })
      });

      const data = await response.json();
      if (data.init_point) {
        // Redirigir al usuario al Checkout Pro de Mercado Pago
        window.location.href = data.init_point;
      } else {
        alert("Hubo un error al generar el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con Mercado Pago.");
    } finally {
      setIsLoadingMP(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header glass-panel">
        <div className="container header-content">
          <div className="logo">
            <h1>Panes Liberté</h1>
            <span>Masa Madre Luján</span>
          </div>
          <button className="cart-toggle" onClick={() => setIsCartOpen(!isCartOpen)}>
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <h2>Masa Madre 100% Artesanal</h2>
          <p>Hechos a mano en Luján. Pedidos hasta el Jueves, horneado Viernes.</p>
          <a href="#catalogo" className="btn btn-primary">Ver Catálogo</a>
        </div>
      </section>

      {/* Flyer Announcement */}
      <section className="container text-center animate-fade-in" style={{ margin: '3rem auto' }}>
        <img
          src="/flyer.png"
          alt="Panes Liberté Luján Promo"
          style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
        />
      </section>

      {/* Main Catalog */}
      <main id="catalogo" className="container catalog-section">
        <div className="section-header text-center animate-fade-in">
          <h2>Nuestros Panes</h2>
          <p>Selecciona tus favoritos y haz tu pedido online.</p>
        </div>

        <div className="products-grid">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="product-card glass-panel animate-fade-in" style={product.available === false ? { filter: 'grayscale(0.5) opacity(0.8)' } : {}}>
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                <div className="product-footer">
                  <span className="price">${product.price}</span>
                  {product.available === false ? (
                    <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                      Próximamente
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                      <Plus size={18} /> Agregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Panes Liberté - Masa Madre 100% Artesanal, Luján. Hecho con ❤️</p>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Tu Pedido</h2>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} opacity={0.2} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <span className="item-price">${item.price} x {item.quantity}</span>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-customer-info">
              <input
                type="text"
                placeholder="Tu nombre (opcional)"
                className="customer-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="cart-total">
              <span>Total:</span>
              <strong>${cartTotal}</strong>
            </div>
            <div className="checkout-actions">
              <button className="btn btn-primary w-full" onClick={handleWhatsAppOrder}>
                <Send size={18} /> Pedir por WhatsApp
              </button>
              <button
                className="btn btn-outline w-full"
                onClick={handleMercadoPago}
                disabled={isLoadingMP}
              >
                <CreditCard size={18} /> {isLoadingMP ? "Generando pago..." : "Pagar con Mercado Pago"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for Sidebar */}
      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
    </div>
  );
}
