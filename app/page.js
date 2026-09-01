const products = [
  {
    id: 1,
    name: "Armazón Clásico Negro",
    category: "Armazón graduable",
    price: "$1,299 MXN",
    emoji: "🕶️",
  },
  {
    id: 2,
    name: "Armazón Transparente",
    category: "Armazón graduable",
    price: "$1,499 MXN",
    emoji: "👓",
  },
  {
    id: 3,
    name: "Lentes Solares Urban",
    category: "Lentes de sol",
    price: "$1,799 MXN",
    emoji: "😎",
  },
];

export default function Home() {
  return (
    <main>
      <header className="header">
        <a className="brand" href="/">
          ÓPTICA
        </a>

        <nav className="nav">
          <a href="#coleccion">Colección</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#cita">Citas</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VISIÓN, ESTILO Y TECNOLOGÍA</p>

          <h1>
            Encuentra lentes
            <span> hechos para ti.</span>
          </h1>

          <p className="hero-text">
            Elige tu armazón, selecciona tus micas y comparte tu graduación.
            Esta es la primera demostración de tu futura tienda óptica en línea.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#coleccion">
              Ver colección
            </a>

            <a className="button button-secondary" href="#cita">
              Agendar examen visual
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="glasses">👓</div>
        </div>
      </section>

      <section id="coleccion" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CATÁLOGO DEMO</p>
            <h2>Armazones destacados</h2>
          </div>

          <p>
            Más adelante estos productos se cargarán desde Shopify o desde tu
            propia plataforma de comercio.
          </p>
        </div>

        <div className="products">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">{product.emoji}</div>

              <div className="product-content">
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="price">{product.price}</p>

                <button type="button">Ver producto</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="beneficios" className="benefits">
        <article>
          <span>01</span>
          <h3>Armazones seleccionados</h3>
          <p>Opciones para diferentes rostros, estilos y necesidades visuales.</p>
        </article>

        <article>
          <span>02</span>
          <h3>Micas personalizadas</h3>
          <p>Graduación, antirreflejante, filtro azul y protección solar.</p>
        </article>

        <article>
          <span>03</span>
          <h3>Atención profesional</h3>
          <p>Compra en línea o agenda un examen visual para recibir asesoría.</p>
        </article>
      </section>

      <section id="cita" className="appointment">
        <p className="eyebrow">ATENCIÓN PERSONALIZADA</p>
        <h2>Tu visión merece atención profesional.</h2>
        <p>
          En la siguiente fase conectaremos este botón a tu agenda, WhatsApp,
          n8n o formulario de citas.
        </p>
        <a className="button button-primary" href="https://wa.me/">
          Solicitar información
        </a>
      </section>

      <footer>
        <p>© 2026 Óptica. Demostración técnica en Next.js y Easypanel.</p>
      </footer>
    </main>
  );
}
