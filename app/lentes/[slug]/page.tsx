import Image from "next/image";
import Link from "next/link";
import {
  getWooProductBySlug,
  getWooVariations,
} from "../../lib/woocommerce";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(price?: string) {
  if (!price) {
    return "Consultar precio";
  }

  const value = Number(price);

  if (Number.isNaN(value)) {
    return "Consultar precio";
  }

  return `$${value.toLocaleString("es-MX")} MXN`;
}

function cleanHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .trim();
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product = null;
  let errorMessage = "";

  try {
    product = await getWooProductBySlug(slug);
  } catch (error) {
    console.error("Error cargando producto:", error);

    errorMessage =
      error instanceof Error
        ? error.message
        : "No fue posible consultar este producto.";
  }

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-error">
          <p className="eyebrow">PRODUCTO</p>

          <h1>No fue posible cargar este producto</h1>

          <p>Slug consultado:</p>

          <code>{slug}</code>

          {errorMessage && (
            <p className="product-error-detail">
              {errorMessage}
            </p>
          )}

          <Link href="/" className="button button-primary">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  let variations = [];

  if (product.type === "variable") {
    try {
      variations = await getWooVariations(product.id);
    } catch (error) {
      console.error("Error cargando variaciones:", error);
    }
  }

  const mainImage = product.images?.[0];
  const category =
    product.categories?.[0]?.name || "Lentes y armazones";
  const price = product.sale_price || product.price;
  const description = cleanHtml(
    product.description || product.short_description
  );

  return (
    <main className="product-page">
      <div className="product-container">
        <nav className="product-breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <span>{category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product-detail">
          <div className="product-detail-gallery">
            <div className="product-detail-image">
              {mainImage?.src ? (
                <Image
                  src={mainImage.src}
                  alt={mainImage.alt || product.name}
                  width={900}
                  height={900}
                  priority
                  unoptimized
                  className="product-detail-main-image"
                />
              ) : (
                <div className="product-placeholder">👓</div>
              )}
            </div>
          </div>

          <div className="product-detail-content">
            <p className="product-category">{category}</p>

            <h1>{product.name}</h1>

            <div className="product-prices">
              {product.sale_price &&
                product.regular_price &&
                product.sale_price !== product.regular_price && (
                  <span className="product-old-price">
                    {formatPrice(product.regular_price)}
                  </span>
                )}

              <span className="product-current-price">
                {formatPrice(price)}
              </span>
            </div>

            <div className="product-description">
              <p>
                {description ||
                  "Consulta la disponibilidad y opciones de personalización para este armazón."}
              </p>
            </div>

            {product.sku && (
              <p className="product-sku">
                SKU: {product.sku}
              </p>
            )}

            <p className="product-availability">
              {product.stock_status === "instock"
                ? "Disponible"
                : "Consulta disponibilidad"}
            </p>

            {variations.length > 0 && (
              <section className="product-variations">
                <h2>Colores disponibles</h2>

                <div className="variation-list">
                  {variations.map((variation) => {
                    const attributes =
                      variation.attributes
                        ?.map(
                          (attribute) =>
                            `${attribute.name}: ${attribute.option}`
                        )
                        .join(", ") ||
                      variation.sku ||
                      "Opción disponible";

                    const variationPrice =
                      variation.sale_price || variation.price;

                    return (
                      <article
                        className="variation-option"
                        key={variation.id}
                      >
                        {variation.image?.src ? (
                          <Image
                            src={variation.image.src}
                            alt={attributes}
                            width={80}
                            height={80}
                            unoptimized
                          />
                        ) : (
                          <div className="variation-placeholder">
                            👓
                          </div>
                        )}

                        <div>
                          <p>{attributes}</p>

                          <small>
                            {formatPrice(variationPrice)}
                          </small>

                          <small>
                            {variation.stock_status === "instock"
                              ? "Disponible"
                              : "No disponible"}
                          </small>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="prescription-section">
              <h2>Personaliza tus lentes</h2>

              <label>
                <input
                  type="radio"
                  name="purchase-type"
                  defaultChecked
                />
                Solo armazón
              </label>

              <label>
                <input type="radio" name="purchase-type" />
                Armazón con lentes graduados
              </label>

              <label>
                <input type="checkbox" name="eye-exam" />
                Quiero agendar un examen visual
              </label>
            </section>

            <div className="product-actions">
              <a
                className="button button-primary"
                href="https://wa.me/525618452614"
                target="_blank"
                rel="noreferrer"
              >
                Solicitar información por WhatsApp
              </a>
            </div>

            <Link href="/" className="back-link">
              ← Volver al catálogo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
