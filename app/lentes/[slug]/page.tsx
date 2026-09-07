import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductConfigurator from "../../../components/ProductConfigurator";
type StoreImage = {
  id?: number;
  src: string;
  alt?: string;
  thumbnail?: string;
};

type StoreAttribute = {
  id?: number;
  name: string;
  options?: string[];
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  currency_minor_unit?: number;
  currency_symbol?: string;
  images?: StoreImage[];
  attributes?: StoreAttribute[];
  stock_status?: string;
  sku?: string;
  permalink?: string;
};

type StoreVariation = {
  id: number;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  image?: StoreImage;
  attributes?: {
    name: string;
    option: string;
  }[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const STORE_URL = process.env.WOOCOMMERCE_URL?.replace(/\/$/, "") || "";

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—");
}

function getProductPrice(product: StoreProduct) {
  const price = Number(product.price || product.sale_price || product.regular_price || 0);
  const minorUnit = product.currency_minor_unit ?? 2;

  return minorUnit > 0 ? price / 10 ** minorUnit : price;
}

function formatMoney(value: number, symbol = "$") {
  return `${symbol}${value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

async function getProduct(slug: string): Promise<StoreProduct | null> {
  if (!STORE_URL) {
    return null;
  }

  const response = await fetch(
    `${STORE_URL}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    return null;
  }

  const products = (await response.json()) as StoreProduct[];
  return products[0] || null;
}

async function getVariations(productId: number): Promise<StoreVariation[]> {
  if (!STORE_URL) {
    return [];
  }

  const response = await fetch(
    `${STORE_URL}/wp-json/wc/store/v1/products/${productId}/variations`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as StoreVariation[];
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const variations = await getVariations(product.id);
  const price = getProductPrice(product);
  const currencySymbol = product.currency_symbol || "$";
  const description = stripHtml(product.description || product.short_description || "");
  const mainImage = product.images?.[0];
  const productUrl = product.permalink || `${STORE_URL}/producto/${product.slug}/`;

  return (
    <main className="product-page">
      <nav className="product-breadcrumb" aria-label="Navegación">
        <Link href="/lentes">Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span>{decodeHtml(product.name)}</span>
      </nav>

      <section className="product-detail">
        <div className="product-gallery">
          <div className="product-main-image">
            {mainImage?.src ? (
              <Image
                src={mainImage.src}
                alt={mainImage.alt || decodeHtml(product.name)}
                width={900}
                height={700}
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            ) : (
              <div className="product-image-placeholder">
                Imagen no disponible
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.slice(1).map((image, index) => (
                <div className="product-thumbnail" key={image.id || index}>
                  <Image
                    src={image.thumbnail || image.src}
                    alt={image.alt || `${decodeHtml(product.name)} ${index + 2}`}
                    width={110}
                    height={90}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          {product.sku && <p className="product-sku">Modelo: {product.sku}</p>}

          <h1>{decodeHtml(product.name)}</h1>

          <p className="product-price">
            {product.on_sale && product.regular_price && (
              <del>
                {formatMoney(
                  Number(product.regular_price) /
                    10 ** (product.currency_minor_unit ?? 2),
                  currencySymbol
                )}
              </del>
            )}
            <span>{formatMoney(price, currencySymbol)}</span>
          </p>

          <p className="product-price-note">Precio del armazón</p>

          {description && <p className="product-description">{description}</p>}

          {product.attributes && product.attributes.length > 0 && (
            <section className="product-specifications">
              <h2>Detalles del armazón</h2>
              <dl>
                {product.attributes
                  .filter((attribute) => attribute.options && attribute.options.length > 0)
                  .map((attribute) => (
                    <div key={attribute.id || attribute.name}>
                      <dt>{attribute.name}</dt>
                      <dd>{attribute.options?.join(", ")}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          )}

          <ProductConfigurator
            productName={decodeHtml(product.name)}
            productUrl={productUrl}
            basePrice={price}
            currencySymbol={currencySymbol}
            variations={variations.map((variation) => ({
              id: variation.id,
              name: variation.sku || "Opción disponible",
              price: variation.price,
              regularPrice: variation.regular_price,
              stockStatus: variation.stock_status,
              image: variation.image?.src,
              attributes: variation.attributes || [],
            }))}
          />
        </div>
      </section>
    </main>
  );
}
