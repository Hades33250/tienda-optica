import Image from "next/image";
import Link from "next/link";
import {
  getWooProductBySlug,
  getWooVariations,
} from "../../lib/woocommerce";

function formatPrice(price) {
  if (!price) {
    return "Consultar precio";
  }

  return `$${Number(price).toLocaleString("es-MX")} MXN`;
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getWooProductBySlug(slug);

  if (!product) {
    return (
      <main className="product-page">
        <h1>Producto no encontrado</h1>

        <p>
          El producto que buscas no existe o ya no está disponible.
        </p>

        <Link href="/" className="button button-primary">
          Volver a la tienda
        </Link>
      </main>
    );
  }

  const variations =
    product.type === "variable"
      ? await getWooVariations(product.id)
      : [];

  const mainImage = product.images?.[0];

  const category =
    product.categories?.[0]?.name || "Lentes y armazones";

  const price = product.sale_price || product.price;

  return (
    <main className="product-page">
      <div className="product-breadcrumb">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail">
        <div className="product-detail-image">
          {mainImage?.src ? (
            <Image
              src={mainImage.src}
              alt={mainImage.alt || product.name}
              width={900}
              height={900}
              priority
            />
          ) : (
            <div className="product-placeholder">
              👓
            </div>
          )}
        </div>

        <div className="product-detail-content">
          <p className="product-category">{category}</p>

          <h1>{product.name}</h1>

          <p className="product-detail-price">
            {formatPrice(price)}
          </p>

          {product.regular_price &&
            product.sale_price &&
            product.regular_price !== product.sale_price && (
              <p className="product-regular-price">
                Precio anterior: {formatPrice(product.regular_price)}
              </p>
            )}

          <div className="product-description">
            {stripHtml(
              product.short_description ||
                product.description
            )}
          </div>

          {product.sku && (
            <p className="product-sku">
              SKU: {product.sku}
            </p>
          )}

          <p className="product-stock">
            {product.stock_status === "instock"
              ? "Disponible"
              : "Consultar disponibilidad"}
          </p>

          {variations.length > 0 && (
            <section className="product-variations">
              <h2>Elige tu color</h2>

              <div className="variation-list">
                {variations.map((variation) => {
                  const color =
                    variation.attributes?.[0]?.option ||
                    variation.sku ||
                    `Variación ${variation.id}`;

                  return (
                    <div
                      className="variation-option"
                      key={variation.id}
                    >
                      {variation.image?.src && (
                        <Image
                          src={variation.image.src}
                          alt={color}
                          width={80}
                          height={80}
                        />
                      )}

                      <div>
                        <p>{color}</p>
                        <small>
                          {formatPrice(
                            variation.sale_price ||
                              variation.price
                          )}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="product-actions">
            <a
              href={product.permalink}
              className="button button-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Ver ficha original
            </a>

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
    </main>
  );
}
