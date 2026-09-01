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

function formatPrice(price: string) {
  if (!price) {
    return "Consultar precio";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Consultar precio";
  }

  return `$${numericPrice.toLocaleString("es-MX")} MXN`;
}

function cleanHtml(html: string) {
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

  const product = await getWooProductBySlug(slug);

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-error">
          <p className="eyebrow">PRODUCTO</p>

          <h1>Producto no encontrado</h1>

          <p>
            No encontramos un producto con la dirección:
          </p>

          <code>{slug}</code>

          <Link
            href="/"
            className="button button-primary"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  const variations =
    product.type === "variable"
      ? await getWooVariations(product.id)
      : [];

  const mainImage = product.images?.[0];

  const category =
    product.categories?.[0]?.name ||
    "Lentes y armazones";

  const currentPrice =
    product.sale_price || product.price;

  const description = cleanHtml(
    product.description ||
      product.short_description ||
      ""
  );

  return (
    <main className="product-page">
      <div className="product-container">
        <div className="product-breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <span>{category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </div>

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
                <div className="product-placeholder">
                  👓
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.src}
                    alt={image.alt || product.name}
                    width={100}
                    height={100}
                    unoptimized
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-content">
            <p className="product-category">
              {category}
            </p>

            <h1>{product.name}</h1>

            <div className="product-prices">
              {product.sale_price &&
                product.regular_price &&
                product.sale_price !==
                  product.regular_price && (
                  <span className="product-old-price">
                    {formatPrice(product.regular_price)}
                  </span>
                )}

              <span className="product-current-price">
                {formatPrice(currentPrice)}
              </span>
            </div>

            <div className="product-description">
              {description ? (
                <p>{description}</p>
              ) : (
                <p>
                  Consulta la disponibilidad y opciones de
                  personalización para este armazón.
                </p>
              )}
            </div>

            {product.sku && (
              <p className="product-sku">
                SKU: {product.sku}
              </p>
            )}

            <div className="product-availability">
              {product.stock_status === "instock" ? (
                <span>Disponible</span>
              ) : (
                <span>Consultar disponibilidad</span>
              )}
            </div>

            {variations.length > 0 && (
              <section className="product-variations">
                <h2>Colores disponibles</h2>

                <div className="variation-list">
                  {variations.map((variation) => {
                    const variationName =
                      variation.attributes
                        ?.map(
                          (attribute) =>
                            `${attribute.name}: ${attribute.option}`
                        )
                        .join(", ") ||
                      variation.sku ||
                      `Variación ${variation.id}`;

                    const variationPrice =
                      variation.sale_price ||
                      variation.price;

                    return (
                      <div
                        className="variation-option"
                        key={variation.id}
                      >
                        {variation.image?.src ? (
                          <Image
                            src={variation.image.src}
                            alt={variationName}
                            width={90}
                            height={90}
                            unoptimized
                          />
                        ) : (
                          <div className="variation-placeholder">
                            👓
                          </div>
                        )}

                        <div>
                          <p>{variationName}</p>

                          <small>
                            {formatPrice(variationPrice)}
                          </small>

                          <small>
                            {variation.stock_status ===
                            "instock"
                              ? "Disponible"
                              : "No disponible"}
                          </small>
                        </div>
                      </div>
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
                  value="frame"
                  defaultChecked
                />
                Solo armazón
              </label>

              <label>
                <input
                  type="radio"
                  name="purchase-type"
                  value="prescription"
                />
                Armazón con lentes graduados
              </label>

              <label>
                <input
                  type="checkbox"
                  name="eye-exam"
                />
                Quiero agendar un examen visual
              </label>
            </section>

            <div className="product-actions">
              <button
                type="button"
                className="button button-primary"
              >
                Personalizar mis lentes
              </button>
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
