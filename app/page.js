import Image from "next/image";
import { getWooProducts } from "./lib/woocommerce";

export default async function Home() {
  const products = await getWooProducts();

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
            <p className="eyebrow">CATÁLOGO EN LÍNEA</p>
            <h2>Lentes y armazones</h2>
          </div>

          <p>
            Productos sincronizados desde tu catálogo de WooCommerce.
          </p>
        </div>

        <div className="products">
          {products.length === 0 ? (
            <p>No hay productos publicados por el momento.</p>
          ) : (
            products.map((product) => {
              const image = product.images[0];

              const category =
                product.categories[0]?.name || "Lentes y armazones";

              const price = product.sale_price || product.price;

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        width={600}
                        height={600}
                      />
                    ) : (
                      <span>👓</span>
                    )}
                  </div>

                  <div className="product-content">
                    <p className="product-category">{category}</p>

                    <h3>{product.name}</h3>

                    <p className="price">
                      {price
                        ? `$${Number(price).toLocaleString("es-MX")} MXN`
                        : "Consultar precio"}
                    </p>

                    <a
                      href={product.permalink}
                      className="product-button"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver producto
                    </a>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section id="beneficios" className="benefits">
        <article>
          <span>01</span>
          <h3>Armazones seleccionados</h3>
          <p>
            Opciones para diferentes rostros, estilos y necesidades visuales.
          </p>
        </article>

        <article>
          <span>02</span>
          <h3>Micas personalizadas</h3>
          <p>
            Graduación, antirreflejante, filtro azul y protección solar.
          </p>
        </article>

        <article>
          <span>03</span>
          <h3>Atención profesional</h3>
          <p>
            Compra en línea o agenda un examen visual para recibir asesoría.
          </p>
        </article>
      </section>

      <section id="cita" className="appointment">
        <p className="eyebrow">ATENCIÓN PERSONALIZADA</p>

        <h2>Tu visión merece atención profesional.</h2>

        <p>
          En la siguiente fase conectaremos este botón a tu agenda, WhatsApp,
          n8n o formulario de citas.
        </p>

        <a
          className="button button-primary"
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
        >
          Solicitar información
        </a>
      </section>

      <footer>
        <p>© 2026 Óptica. Tienda en Next.js conectada a WooCommerce.</p>
      </footer>
    </main>
  );
}
