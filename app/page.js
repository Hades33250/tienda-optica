import Image from "next/image";
import { getWooProducts } from "./lib/woocommerce";

export default async function Home() {
  let products = [];
  let errorMessage = "";

  try {
    products = await getWooProducts();
  } catch (error) {
    console.error("Error al cargar WooCommerce:", error);

    errorMessage =
      "No fue posible cargar el catálogo en este momento.";
  }

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
            Compra tus lentes de manera sencilla y recibe atención profesional.
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
            Escoge tu armazon que se adapte a tu estilo.
          </p>
        </div>

        {errorMessage ? (
          <div className="catalog-message">
            <p>{errorMessage}</p>
            <p>Por favor, intenta nuevamente más tarde.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-message">
            <p>No hay productos publicados en este momento.</p>
          </div>
        ) : (
          <div className="products">
            {products.map((product) => {
              const image = product.images?.[0];

              const category =
                product.categories?.[0]?.name ||
                "Lentes y armazones";

              const price =
                product.sale_price || product.price;

              const formattedPrice = price
                ? `$${Number(price).toLocaleString("es-MX")} MXN`
                : "Consultar precio";

              return (
                <article
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image">
                    {image?.src ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        width={600}
                        height={600}
                        unoptimized
                        className="product-card-image"
                      />
                    ) : (
                      <span>👓</span>
                    )}
                  </div>

                  <div className="product-content">
                    <p className="product-category">
                      {category}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="price">
                      {formattedPrice}
                    </p>

                    <a
                      href={`/lentes/${product.slug}`}
                      className="product-button"
                    >
                      Ver producto
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
          Realiza tu cita por WhatsApp o en Doctoralia.
        </p>

        <div className="hero-actions">
          <a
            className="button button-primary"
            href="https://wa.me/525618452614"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          <a
            className="button button-primary"
            href="https://www.doctoralia.com.mx/clinicas/clinica-capital-vision"
            target="_blank"
            rel="noreferrer"
          >
            Doctoralia
          </a>
        </div>
      </section>

      <footer>
        <p>
          © Capital Vision 2026.
        </p>
      </footer>
    </main>
  );
}
