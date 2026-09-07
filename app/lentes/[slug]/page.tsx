import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import type { ProductOption } from "../../../components/ProductConfigurator";

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

type StorePrices = {
  price?: string;
  regular_price?: string;
  sale_price?: string;
  currency_minor_unit?: number;
  currency_symbol?: string;
};

type StoreVariationAttribute = {
  name?: string;
  slug?: string;
  option?: string;
  value?: string;
};

type StoreVariation = {
  id: number;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  prices?: StorePrices;
  stock_status?: string;
  image?: StoreImage;
  attributes?: StoreVariationAttribute[];
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  short_description?: string;
  prices?: StorePrices;
  on_sale?: boolean;
  images?: StoreImage[];
  variations?: StoreVariation[];
  attributes?: StoreAttribute[];
  stock_status?: string;
  sku?: string;
  permalink?: string;
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

function getPriceFromStorePrices(prices?: StorePrices) {
  if (!prices) {
    return 0;
  }

  const rawPrice = prices.sale_price || prices.price || prices.regular_price || "0";
  const amount = Number(rawPrice);
  const minorUnit = prices.currency_minor_unit ?? 2;

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount / 10 ** minorUnit;
}

function getRegularPriceFromStorePrices(prices?: StorePrices) {
  if (!prices?.regular_price) {
    return 0;
  }

  const amount = Number(prices.regular_price);
  const minorUnit = prices.currency_minor_unit ?? 2;

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount / 10 ** minorUnit;
}

function getDirectPrice(value?: string) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function getVariationSalePrice(variation: StoreVariation) {
  if (variation.prices) {
    return getPriceFromStorePrices(variation.prices);
  }

  return (
    getDirectPrice(variation.sale_price) ||
    getDirectPrice(variation.price) ||
    getDirectPrice(variation.regular_price)
  );
}

function getVariationRegularPrice(variation: StoreVariation) {
  if (variation.prices) {
    return getRegularPriceFromStorePrices(variation.prices);
  }

  return getDirectPrice(variation.regular_price);
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

async function getVariations(product: StoreProduct): Promise<StoreVariation[]> {
  if (product.variations && product.variations.length > 0) {
    return product.variations;
  }

  if (!STORE_URL) {
    return [];
  }

  const response = await fetch(
    `${STORE_URL}/wp-json/wc/store/v1/products/${product.id}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    return [];
  }

  const fullProduct = (await response.json()) as StoreProduct;
  return fullProduct.variations || [];
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const variations = await getVariations(product);
  const basePrice = getPriceFromStorePrices(product.prices);
  const regularPrice = getRegularPriceFromStorePrices(product.prices);
  const currencySymbol = product.prices?.currency_symbol || "$";
  const description = stripHtml(product.description || product.short_description || "");
  const mainImage = product.images?.[0];
  const productUrl = product.permalink || `${STORE_URL}/producto/${product.slug}/`;

  const configuratorVariations: ProductOption[] = variations.map((variation) => {
    const salePrice = getVariationSalePrice(variation);
    const normalPrice = getVariationRegularPrice(variation);

    return {
      id: variation.id,
      name: variation.sku || "Opción disponible",
      price: salePrice > 0 ? salePrice.toString() : undefined,
      regularPrice: normalPrice > 0 ? normalPrice.toString() : undefined,
      stockStatus: variation.stock_status,
      image: variation.image?.src || mainImage?.src,
      attributes: variation.attributes || [],
    };
  });

  return (
    <main className="product-page">
      <nav className="product-breadcrumb" aria-label="Navegación">
        <Link href="/lentes">Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span>{decodeHtml(product.name)}</span>
      </nav>

      <section className="product-detail-page-header">
        <div>
          {product.sku && <p className="product-sku">Modelo: {product.sku}</p>}
          <h1>{decodeHtml(product.name)}</h1>
        </div>

        {description && <p className="product-description">{description}</p>}
      </section>

      <ProductDetailClient
        productName={decodeHtml(product.name)}
        productUrl={productUrl}
        basePrice={basePrice}
        regularPrice={regularPrice > 0 ? regularPrice : undefined}
        currencySymbol={currencySymbol}
        mainImage={mainImage}
        images={product.images || []}
        variations={configuratorVariations}
      />

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
    </main>
  );
}
