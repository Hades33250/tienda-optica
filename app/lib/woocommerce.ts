import "server-only";

export type WooImage = {
  id: number;
  src: string;
  alt: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WooAttribute = {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
};

export type WooVariation = {
  id: number;
  description?: string;
  permalink?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_code?: string;
    currency_symbol?: string;
    currency_minor_unit?: number;
    currency_decimal_separator?: string;
    currency_thousand_separator?: string;
    currency_prefix?: string;
    currency_suffix?: string;
  };

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type?: string;
  permalink?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  short_description?: string;
  description?: string;
  images?: WooImage[];
  categories?: WooCategory[];
  attributes?: WooAttribute[];
  variations?: number[];
};

const rawStoreUrl = process.env.WOOCOMMERCE_URL || "";
const storeUrl = rawStoreUrl.replace(/\/+$/, "");

if (!storeUrl) {
  throw new Error(
    "Falta WOOCOMMERCE_URL en las variables de entorno de Easypanel."
  );
}

async function wooStoreFetch<T>(endpoint: string): Promise<T> {
  const url = `${storeUrl}/wp-json/wc/store/v1${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `WooCommerce Store API respondió HTTP ${response.status}: ${body.slice(0, 300)}`
      );
    }

    return JSON.parse(body) as T;
  } catch (error) {
    const errorWithCause = error as Error & {
      cause?: {
        code?: string;
        message?: string;
      };
    };

    const detail =
      error instanceof Error
        ? error.message
        : "Error de red desconocido";

    const cause = errorWithCause.cause
      ? ` Causa: ${errorWithCause.cause.code || ""} ${
          errorWithCause.cause.message || ""
        }`
      : "";

    throw new Error(
      `No se pudo cargar el catálogo desde WooCommerce en ${url}. ${detail}${cause}`
    );
  }
}

export async function getWooProducts(): Promise<WooProduct[]> {
  return wooStoreFetch<WooProduct[]>(
    "/products?per_page=24&catalog_visibility=visible"
  );
}

export async function getWooProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  const products = await wooStoreFetch<WooProduct[]>(
    `/products?slug=${encodeURIComponent(slug)}`
  );

  return products[0] || null;
}

export async function getWooVariations(
  productId: number
): Promise<WooVariation[]> {
  const product = await wooStoreFetch<WooProduct>(
    `/products/${productId}`
  );

  return (product.variations || []).map((variationId) => ({
    id: variationId,
  }));
}
